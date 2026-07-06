import { useState, useEffect } from 'react';
import { User, Meeting, AgendaItem, ActionItem, Attachment, ApprovalLog } from './types';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import DashboardScreen from './components/DashboardScreen';
import MeetingsScreen from './components/MeetingsScreen';
import NotionEditor from './components/NotionEditor';
import ActionItemsScreen from './components/ActionItemsScreen';
import ParticipantsScreen from './components/ParticipantsScreen';
import DocumentsScreen from './components/DocumentsScreen';
import ReportsScreen from './components/ReportsScreen';
import AIAssistantScreen from './components/AIAssistantScreen';
import SettingsScreen from './components/SettingsScreen';

// 1. Initial High-Fidelity Default Data
const DEFAULT_USER: User = {
  id: 'admin',
  email: 'sahrul.viona12@gmail.com',
  name: 'Sahrul Viona',
  company: 'PT Kosdotel Group Pratama',
  role: 'Director',
  avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sahrul'
};

const DEFAULT_MEETINGS: Meeting[] = [
  {
    id: 'meet-1',
    title: 'Pembangunan Kosdotel 7 Lantai',
    company: 'PT Kosdotel Group Pratama',
    date: '2026-07-05',
    time: '09:00',
    duration: 120,
    category: 'Meeting Kontraktor',
    participants: ['Budi', 'Siti', 'Rudi', 'Joko'],
    status: 'Ongoing',
    minutesStatus: 'Draft'
  },
  {
    id: 'meet-2',
    title: 'Review Anggaran Direksi Q2',
    company: 'PT Kosdotel Group Pratama',
    date: '2026-07-05',
    time: '14:00',
    duration: 90,
    category: 'Meeting Direksi',
    participants: ['Joko', 'Siti', 'Sahrul'],
    status: 'Upcoming',
    minutesStatus: 'Draft'
  },
  {
    id: 'meet-3',
    title: 'Pemasaran Launching Kosdotel',
    company: 'PT Kosdotel Group Pratama',
    date: '2026-07-06',
    time: '10:00',
    duration: 60,
    category: 'Meeting Marketing',
    participants: ['Andi', 'Siti', 'Rian'],
    status: 'Upcoming',
    minutesStatus: 'Draft'
  }
];

const DEFAULT_AGENDA_ITEMS: AgendaItem[] = [
  // 11 Agendas for meet-1
  {
    id: 'ag-1',
    meetingId: 'meet-1',
    title: 'Pembukaan',
    order: 0,
    completed: true,
    notes: '<p>Rapat dibuka oleh Bapak Joko selaku Director. Mengucapkan terima kasih atas kehadiran seluruh kontraktor dan tim pengawas harian.</p>',
    decisions: '<p>Rapat resmi dimulai pukul 09:00 WIB.</p>',
    pic: 'Joko',
    deadline: '2026-07-05',
    status: 'Done',
    actionItems: []
  },
  {
    id: 'ag-2',
    meetingId: 'meet-1',
    title: 'Perkenalan',
    order: 1,
    completed: true,
    notes: '<p>Perkenalan tim kontraktor baru dari PT Konstruksi Perkasa Nusantara yang akan menangani pengerjaan struktur beton atas.</p>',
    decisions: '<p>PT Konstruksi Perkasa ditunjuk sebagai sub-kontraktor struktur atas.</p>',
    pic: 'Budi',
    deadline: '2026-07-05',
    status: 'Done',
    actionItems: []
  },
  {
    id: 'ag-3',
    meetingId: 'meet-1',
    title: 'Presentasi Proyek',
    order: 2,
    completed: true,
    notes: '<p>Penyampaian status fisik Kosdotel 7 Lantai. Pondasi borepile selesai 100%. Pengecoran lantai dasar (basement) capai 92%.</p>',
    decisions: '<p>Target pengecoran plat lantai 2 harus rampung sebelum minggu depan.</p>',
    pic: 'Budi',
    deadline: '2026-07-05',
    status: 'Done',
    actionItems: []
  },
  {
    id: 'ag-4',
    meetingId: 'meet-1',
    title: 'RAB',
    order: 3,
    completed: false,
    notes: '<p>Pembahasan sisa anggaran semen dan besi beton. Ada kenaikan harga pasar besi beton ukuran 16mm ulir sebesar 12%.</p>',
    decisions: '<p>Menyetujui revisi anggaran RAB sebesar 12% khusus untuk penyesuaian harga besi beton ulir.</p>',
    pic: 'Siti',
    deadline: '2026-07-10',
    status: 'Progress',
    actionItems: [
      {
        id: 'act-1',
        meetingId: 'meet-1',
        agendaItemId: 'ag-4',
        title: 'Minta revisi RAB resmi ke finance',
        pic: 'Siti',
        deadline: '2026-07-10',
        status: 'Progress'
      }
    ]
  },
  {
    id: 'ag-5',
    meetingId: 'meet-1',
    title: 'Jadwal',
    order: 4,
    completed: false,
    notes: '<p>Evaluasi keterlambatan pengerjaan balok struktur zona B karena kendala cuaca buruk akhir pekan lalu.</p>',
    decisions: '<p>Menambah jam kerja lembur harian selama 2 jam bagi tim beton struktur zona B.</p>',
    pic: 'Budi',
    deadline: '2026-07-12',
    status: 'Progress',
    actionItems: []
  },
  {
    id: 'ag-6',
    meetingId: 'meet-1',
    title: 'Material',
    order: 5,
    completed: false,
    notes: '<p>Stok semen sisa 400 sak di gudang lapangan. Perlu pemesanan ulang sebanyak 1200 sak semen instan.</p>',
    decisions: '<p>Pemesanan semen dialihkan ke distributor Tiga Roda karena jaminan supply stabil.</p>',
    pic: 'Budi',
    deadline: '2026-07-08',
    status: 'Open',
    actionItems: []
  },
  {
    id: 'ag-7',
    meetingId: 'meet-1',
    title: 'SDM',
    order: 6,
    completed: false,
    notes: '<p>Kebutuhan tukang besi bertambah 12 orang untuk mempercepat perakitan slab lantai 3.</p>',
    decisions: '<p>Menyetujui penambahan 12 orang tukang besi harian lepas.</p>',
    pic: 'Budi',
    deadline: '2026-07-09',
    status: 'Open',
    actionItems: []
  },
  {
    id: 'ag-8',
    meetingId: 'meet-1',
    title: 'K3',
    order: 7,
    completed: false,
    notes: '<p>Laporan audit safety harian. Penggunaan harness pengaman pada area tepi slab luar lantai 2 perlu ditingkatkan pengawasannya.</p>',
    decisions: '<p>Denda K3 sebesar Rp 500.000 bagi subkontraktor yang melanggar standard safety harness.</p>',
    pic: 'Rudi',
    deadline: '2026-07-07',
    status: 'Progress',
    actionItems: [
      {
        id: 'act-2',
        meetingId: 'meet-1',
        agendaItemId: 'ag-8',
        title: 'Pengawasan safety harness harian diperketat',
        pic: 'Rudi',
        deadline: '2026-07-07',
        status: 'Progress'
      }
    ]
  },
  {
    id: 'ag-9',
    meetingId: 'meet-1',
    title: 'Tanya Jawab',
    order: 8,
    completed: false,
    notes: '<p>Kontraktor menanyakan kelancaran supply air bersih proyek di lantai atas.</p>',
    decisions: '<p>Pompa dorong (booster pump) sementara akan dipasang di lantai 2.</p>',
    pic: 'Budi',
    deadline: '2026-07-15',
    status: 'Open',
    actionItems: []
  },
  {
    id: 'ag-10',
    meetingId: 'meet-1',
    title: 'Kesimpulan',
    order: 9,
    completed: false,
    notes: '<p>Rangkuman kesepakatan: Penyesuaian RAB disetujui, lembur zona B aktif, standar K3 diperketat.</p>',
    decisions: '<p>Seluruh butir kesepakatan dituangkan resmi ke dalam notulen digital.</p>',
    pic: 'Joko',
    deadline: '2026-07-05',
    status: 'Open',
    actionItems: []
  },
  {
    id: 'ag-11',
    meetingId: 'meet-1',
    title: 'Penutup',
    order: 10,
    completed: false,
    notes: '<p>Rapat ditutup dengan doa bersama. Rapat koordinasi berikutnya dijadwalkan pada 12 Juli 2026.</p>',
    decisions: '<p>Rapat ditutup pukul 11:30 WIB.</p>',
    pic: 'Joko',
    deadline: '2026-07-05',
    status: 'Open',
    actionItems: []
  }
];

const DEFAULT_ATTACHMENTS: Attachment[] = [
  {
    id: 'doc-1',
    meetingId: 'meet-1',
    name: 'RAB_Revisi_Besi_Beton.xls',
    size: '1.45 MB',
    type: 'xls',
    url: '#',
    uploadedAt: '05 Juli'
  },
  {
    id: 'doc-2',
    meetingId: 'meet-1',
    name: 'Gambar_Rancangan_Kosdotel_7L.dwg',
    size: '42.1 MB',
    type: 'dwg',
    url: '#',
    uploadedAt: '05 Juli'
  }
];

const DEFAULT_APPROVAL_LOGS: ApprovalLog[] = [
  {
    id: 'log-1',
    meetingId: 'meet-1',
    from: 'Budi (Kontraktor)',
    to: 'Siti (Project Manager)',
    roleFrom: 'Draft',
    roleTo: 'Review',
    status: 'Review',
    notes: 'Draf notulen Kosdotel 7 lantai siap ditinjau. Mohon verifikasi porsi anggaran RAB semen instan.',
    timestamp: '05 Juli 11:45'
  }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  
  // App-wide database states
  const [meetings, setMeetings] = useState<Meeting[]>(DEFAULT_MEETINGS);
  const [agendas, setAgendas] = useState<AgendaItem[]>(DEFAULT_AGENDA_ITEMS);
  const [attachments, setAttachments] = useState<Attachment[]>(DEFAULT_ATTACHMENTS);
  const [approvalLogs, setApprovalLogs] = useState<ApprovalLog[]>(DEFAULT_APPROVAL_LOGS);
  
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Auto-login with default user for seamless experience
  useEffect(() => {
    setCurrentUser(DEFAULT_USER);
  }, []);

  // Sync index.css dark class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleCreateMeeting = (newMeeting: Omit<Meeting, 'id' | 'status' | 'minutesStatus'>) => {
    const newId = `meet-${Math.random().toString(36).substring(7)}`;
    const created: Meeting = {
      ...newMeeting,
      id: newId,
      status: 'Upcoming',
      minutesStatus: 'Draft'
    };

    setMeetings(prev => [created, ...prev]);

    // Generate initial agendas from standard templates
    const initialAgendas: AgendaItem[] = [
      {
        id: `ag-${Math.random().toString(36).substring(7)}`,
        meetingId: newId,
        title: 'Pembukaan & Absensi',
        order: 0,
        completed: false,
        notes: '<p>Rapat dibuka oleh pimpinan rapat...</p>',
        decisions: '<p>Catat keputusan di sini...</p>',
        pic: '',
        deadline: newMeeting.date,
        status: 'Open',
        actionItems: []
      },
      {
        id: `ag-${Math.random().toString(36).substring(7)}`,
        meetingId: newId,
        title: 'Pembahasan Utama & Anggaran',
        order: 1,
        completed: false,
        notes: '<p>Tulis catatan pembahasan di sini...</p>',
        decisions: '<p>Catat keputusan di sini...</p>',
        pic: '',
        deadline: newMeeting.date,
        status: 'Open',
        actionItems: []
      },
      {
        id: `ag-${Math.random().toString(36).substring(7)}`,
        meetingId: newId,
        title: 'Penutup & Tindak Lanjut',
        order: 2,
        completed: false,
        notes: '<p>Rapat ditutup...</p>',
        decisions: '<p>Catat keputusan di sini...</p>',
        pic: '',
        deadline: newMeeting.date,
        status: 'Open',
        actionItems: []
      }
    ];

    setAgendas(prev => [...prev, ...initialAgendas]);
    setSelectedMeetingId(newId);
    setActiveTab('meetings');
  };

  const handleSelectMeeting = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setActiveTab('meetings');
  };

  // State handlers passed to NotionEditor
  const handleUpdateAgendas = (updatedAgendas: AgendaItem[]) => {
    setAgendas(prev => {
      // Filter out all current agendas of this meeting
      const filtered = prev.filter(a => a.meetingId !== selectedMeetingId);
      return [...filtered, ...updatedAgendas];
    });
  };

  const handleUpdateMeetingStatus = (status: 'Upcoming' | 'Ongoing' | 'Completed') => {
    setMeetings(prev => prev.map(m => m.id === selectedMeetingId ? { ...m, status } : m));
  };

  const handleUpdateMinutesStatus = (status: 'Draft' | 'Review' | 'Approved') => {
    setMeetings(prev => prev.map(m => m.id === selectedMeetingId ? { ...m, minutesStatus: status } : m));
  };

  const handleAddAttachment = (name: string, type: string, size: string) => {
    if (!selectedMeetingId) return;
    const newDoc: Attachment = {
      id: Math.random().toString(36).substring(7),
      meetingId: selectedMeetingId,
      name,
      size,
      type,
      url: '#',
      uploadedAt: '05 Juli'
    };
    setAttachments(prev => [...prev, newDoc]);
  };

  const handleAddAttachmentGlobal = (name: string, type: string, size: string, meetingId: string) => {
    const newDoc: Attachment = {
      id: Math.random().toString(36).substring(7),
      meetingId,
      name,
      size,
      type,
      url: '#',
      uploadedAt: '05 Juli'
    };
    setAttachments(prev => [...prev, newDoc]);
  };

  const handleAddApprovalLog = (log: Omit<ApprovalLog, 'id' | 'meetingId' | 'timestamp'>) => {
    if (!selectedMeetingId) return;
    const newLog: ApprovalLog = {
      ...log,
      id: Math.random().toString(36).substring(7),
      meetingId: selectedMeetingId,
      timestamp: '05 Juli 15:30'
    };
    setApprovalLogs(prev => [...prev, newLog]);
  };

  const handleUpdateActionStatus = (itemId: string, status: 'Open' | 'Progress' | 'Done' | 'Cancel') => {
    // We must update the action item inside the correct agenda item in the list
    setAgendas(prev => prev.map(agenda => {
      if (agenda.actionItems && agenda.actionItems.some(item => item.id === itemId)) {
        const updatedItems = agenda.actionItems.map(item => item.id === itemId ? { ...item, status } : item);
        return { ...agenda, actionItems: updatedItems };
      }
      return agenda;
    }));
  };

  // Compile all Action Items across all agendas for reports/consolidation
  const compileAllActionItems = (): ActionItem[] => {
    const allActions: ActionItem[] = [];
    agendas.forEach(a => {
      if (a.actionItems && a.actionItems.length > 0) {
        allActions.push(...a.actionItems);
      }
    });
    return allActions;
  };

  // Render proper screen tab
  const renderTabContent = () => {
    const compiledActions = compileAllActionItems();

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardScreen
            meetings={meetings}
            actionItems={compiledActions}
            onSelectMeeting={handleSelectMeeting}
            onNavigateToTab={setActiveTab}
          />
        );
      case 'meetings':
        // If a specific meeting is selected, we render the gorgeous NotionEditor!
        if (selectedMeetingId) {
          const activeMeeting = meetings.find(m => m.id === selectedMeetingId)!;
          const activeAgendas = agendas.filter(a => a.meetingId === selectedMeetingId).sort((a, b) => a.order - b.order);
          return (
            <NotionEditor
              meeting={activeMeeting}
              agendas={activeAgendas}
              attachments={attachments}
              approvalLogs={approvalLogs}
              onUpdateAgendas={handleUpdateAgendas}
              onUpdateMeetingStatus={handleUpdateMeetingStatus}
              onUpdateMinutesStatus={handleUpdateMinutesStatus}
              onAddAttachment={handleAddAttachment}
              onAddApprovalLog={handleAddApprovalLog}
              onBack={() => setSelectedMeetingId(null)}
            />
          );
        }
        return (
          <MeetingsScreen
            meetings={meetings}
            onCreateMeeting={handleCreateMeeting}
            onSelectMeeting={handleSelectMeeting}
            currentUser={currentUser}
          />
        );
      case 'actionItems':
        return (
          <ActionItemsScreen
            actionItems={compiledActions}
            meetings={meetings}
            onUpdateActionStatus={handleUpdateActionStatus}
          />
        );
      case 'participants':
        return <ParticipantsScreen actionItems={compiledActions} />;
      case 'documents':
        return (
          <DocumentsScreen 
            attachments={attachments} 
            meetings={meetings} 
            onAddAttachmentGlobal={handleAddAttachmentGlobal} 
          />
        );
      case 'reports':
        return <ReportsScreen meetings={meetings} actionItems={compiledActions} />;
      case 'aiAssistant':
        return <AIAssistantScreen meetings={meetings} />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <h2 className="text-xl font-bold text-white">Tab {activeTab} Sedang Dikembangkan...</h2>
          </div>
        );
    }
  };

  // If user not logged in
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex bg-polish-bg font-sans text-slate-100 antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => { setSelectedMeetingId(null); setActiveTab(tab); }}
        currentUser={currentUser}
        onLogout={handleLogout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Panel Content Scrollable */}
      <main className="flex-1 h-screen overflow-hidden flex flex-col">
        {renderTabContent()}
      </main>
    </div>
  );
}
