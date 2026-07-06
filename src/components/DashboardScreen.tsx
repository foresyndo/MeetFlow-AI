import { useState } from 'react';
import { 
  FileText, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Clock, 
  AlertTriangle, 
  UserCheck, 
  TrendingUp, 
  Bell, 
  Send,
  Building2,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Meeting, ActionItem } from '../types';

interface DashboardScreenProps {
  meetings: Meeting[];
  actionItems: ActionItem[];
  onSelectMeeting: (meetingId: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function DashboardScreen({ 
  meetings, 
  actionItems, 
  onSelectMeeting,
  onNavigateToTab
}: DashboardScreenProps) {
  
  // States for calendar view mode
  const [calendarMode, setCalendarMode] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [currentDate, setCurrentDate] = useState(new Date('2026-07-05'));
  
  // Notification simulator state
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  // Stats calculation
  const totalMeetings = meetings.length;
  const meetingsToday = meetings.filter(m => m.date === '2026-07-05').length;
  const upcomingMeetings = meetings.filter(m => m.status === 'Upcoming').length;
  const totalActions = actionItems.length;
  const completedActions = actionItems.filter(a => a.status === 'Done').length;
  const pendingActions = totalActions - completedActions;
  const completionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  // Reminders list (high-priority action items past deadline or near)
  const highPriorityReminders = actionItems.filter(item => {
    const isOverdue = new Date(item.deadline) < new Date('2026-07-06') && item.status !== 'Done';
    return isOverdue;
  });

  // Simulated notifications triggers
  const triggerNotification = (channel: 'email' | 'whatsapp' | 'telegram' | 'push') => {
    setNotificationStatus(`Mengirim notifikasi progres tindak lanjut via ${channel.toUpperCase()}...`);
    setTimeout(() => {
      setNotificationStatus(`Notifikasi berhasil terkirim via ${channel.toUpperCase()} ke seluruh PIC yang bertanggung jawab! ✅`);
      setTimeout(() => setNotificationStatus(null), 4000);
    }, 1500);
  };

  // Calendar dates generation helper (Simple 35-day grid for July 2026)
  const getDaysInJuly2026 = () => {
    const days = [];
    // July 1st 2026 is Wednesday (offset 3)
    for (let i = -2; i <= 32; i++) {
      if (i <= 0) {
        // June overflow days
        days.push({ day: 30 + i, isCurrentMonth: false, dateStr: `2026-06-${30 + i}` });
      } else if (i <= 31) {
        days.push({ day: i, isCurrentMonth: true, dateStr: `2026-07-${i < 10 ? '0' + i : i}` });
      } else {
        // August overflow days
        days.push({ day: i - 31, isCurrentMonth: false, dateStr: `2026-08-0${i - 31}` });
      }
    }
    return days;
  };

  const julyDays = getDaysInJuly2026();

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full max-w-7xl mx-auto font-sans text-slate-100 bg-polish-bg">
      
      {/* Upper Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl tracking-tight text-white flex items-center gap-2">
            Ringkasan Operasional <span className="text-blue-500">MeetFlow AI</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Smart dashboard untuk monitoring keputusan, progres konstruksi, dan action items.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => triggerNotification('whatsapp')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
          >
            <Bell className="h-3.5 w-3.5" /> WhatsApp Alert
          </button>
          <button 
            onClick={() => triggerNotification('telegram')}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-sky-500/10 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" /> Telegram Bot
          </button>
          <button 
            onClick={() => triggerNotification('email')}
            className="px-3.5 py-2 bg-polish-card hover:bg-polish-hover text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all border border-polish-border cursor-pointer"
          >
            <Bell className="h-3.5 w-3.5" /> Email Blast
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notificationStatus && (
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm flex items-center gap-3 animate-pulse">
          <Bell className="h-5 w-5 text-blue-400" />
          <span>{notificationStatus}</span>
        </div>
      )}

      {/* Grid: Highlight Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-polish-card border border-polish-border rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Rapat Hari Ini</span>
            <div className="h-8 w-8 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white font-mono">{meetingsToday}</h3>
            <p className="text-[11px] text-blue-400 mt-1">● 2 Selesai, 3 Terjadwal</p>
          </div>
        </div>

        <div className="bg-polish-card border border-polish-border rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Mendatang</span>
            <div className="h-8 w-8 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white font-mono">{upcomingMeetings}</h3>
            <p className="text-[11px] text-slate-400 mt-1">Hingga akhir minggu ini</p>
          </div>
        </div>

        <div className="bg-polish-card border border-polish-border rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Action Items</span>
            <div className="h-8 w-8 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center">
              <CheckSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white font-mono">{totalActions}</h3>
            <p className="text-[11px] text-indigo-400 mt-1">Total tugas didelegasikan</p>
          </div>
        </div>

        <div className="bg-polish-card border border-polish-border rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Belum Selesai</span>
            <div className="h-8 w-8 bg-rose-500/10 text-rose-400 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white font-mono">{pendingActions}</h3>
            <p className="text-[11px] text-rose-400 mt-1">8 Melewati batas waktu</p>
          </div>
        </div>

        <div className="bg-polish-card border border-polish-border rounded-2xl p-5 flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Persentase Selesai</span>
            <div className="h-8 w-8 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-emerald-400 font-mono">{completionRate}%</h3>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${completionRate}%` }} />
            </div>
          </div>
        </div>

      </div>

      {/* Middle Layout: Calendar & Reminders/Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Span 2: Interactive Calendar Widget */}
        <div className="lg:col-span-2 bg-polish-card border border-polish-border rounded-3xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="flex items-center gap-2.5">
              <CalendarIcon className="h-5 w-5 text-blue-400" />
              <h2 className="font-display font-semibold text-lg text-white">Kalender Proyek</h2>
              <span className="text-xs bg-polish-hover text-slate-400 px-2 py-0.5 rounded-full font-semibold">Juli 2026</span>
            </div>
            
            {/* Calendar Daily/Weekly/Monthly Switcher */}
            <div className="flex bg-polish-input p-1 rounded-xl border border-polish-border">
              {(['daily', 'weekly', 'monthly'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setCalendarMode(mode)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-all cursor-pointer ${
                    calendarMode === mode 
                      ? 'bg-polish-hover text-white font-semibold' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode === 'daily' ? 'Harian' : mode === 'weekly' ? 'Mingguan' : 'Bulanan'}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Body Rendering */}
          {calendarMode === 'monthly' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500">
                <div>MIN</div><div>SEN</div><div>SEL</div><div>RAB</div><div>KAM</div><div>JUM</div><div>SAB</div>
              </div>
              <div className="grid grid-cols-7 gap-2.5">
                {julyDays.map((dayObj, index) => {
                  const dayMeetings = meetings.filter(m => m.date === dayObj.dateStr);
                  const isToday = dayObj.dateStr === '2026-07-05';
                  return (
                    <div 
                      key={index} 
                      className={`min-h-20 rounded-xl p-2 border flex flex-col justify-between transition-all ${
                        dayObj.isCurrentMonth 
                          ? 'bg-polish-input/40 border-polish-border hover:bg-polish-hover/40' 
                          : 'bg-polish-input/10 border-polish-border/40 text-slate-600'
                      } ${isToday ? 'border-blue-500/80 bg-blue-950/10 ring-1 ring-blue-500/20' : ''}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-bold ${isToday ? 'text-blue-400 font-black' : 'text-slate-400'}`}>
                          {dayObj.day}
                        </span>
                        {isToday && <span className="h-1.5 w-1.5 bg-blue-400 rounded-full" />}
                      </div>
                      
                      {/* Meetings of this day */}
                      <div className="mt-1.5 space-y-1">
                        {dayMeetings.map(m => (
                          <button
                            key={m.id}
                            onClick={() => onSelectMeeting(m.id)}
                            className="w-full text-left text-[10px] truncate px-1.5 py-0.5 rounded-lg font-medium border bg-blue-950/40 border-blue-900 text-blue-300 hover:bg-blue-600 hover:text-white transition-all cursor-pointer block"
                            title={m.title}
                          >
                            {m.time} {m.title.replace('Pembangunan ', '')}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : calendarMode === 'weekly' ? (
            <div className="space-y-4">
              {/* Simple Weekly Grid for July 5 - July 11 */}
              <div className="grid grid-cols-7 gap-4">
                {julyDays.slice(5, 12).map((dayObj, idx) => {
                  const dayMeetings = meetings.filter(m => m.date === dayObj.dateStr);
                  return (
                    <div key={idx} className="bg-polish-input/50 p-4 rounded-2xl border border-polish-border space-y-3 min-h-64">
                      <div className="text-center border-b border-polish-border pb-2">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                          {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][idx]}
                        </p>
                        <p className="text-base font-bold text-white mt-0.5">{dayObj.day}</p>
                      </div>
                      <div className="space-y-2">
                        {dayMeetings.map(m => (
                          <div 
                            key={m.id}
                            onClick={() => onSelectMeeting(m.id)}
                            className="p-2 bg-polish-card border border-polish-border hover:border-blue-500/50 rounded-xl text-left cursor-pointer transition-all"
                          >
                            <span className="text-[10px] font-mono text-blue-400 font-semibold">{m.time}</span>
                            <h4 className="text-xs font-semibold text-slate-200 truncate mt-0.5">{m.title}</h4>
                            <p className="text-[10px] text-slate-400 truncate">{m.category}</p>
                          </div>
                        ))}
                        {dayMeetings.length === 0 && (
                          <p className="text-center text-[10px] text-slate-600 mt-4">Senggang</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // Daily View for Sunday, 5 July 2026
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-polish-border pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">Rapat Hari Ini: Minggu, 5 Juli 2026</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Ditemukan {meetingsToday} rapat operasional terjadwal.</p>
                </div>
              </div>
              <div className="space-y-3">
                {meetings.filter(m => m.date === '2026-07-05').map(m => (
                  <div 
                    key={m.id}
                    className="flex justify-between items-center p-4 bg-polish-input/50 border border-polish-border rounded-2xl hover:border-blue-500/50 transition-all cursor-pointer"
                    onClick={() => onSelectMeeting(m.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded-lg">{m.time}</span>
                        <h4 className="text-sm font-bold text-white mt-1">{m.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Building2 className="h-3 w-3 text-slate-400" />
                          <span className="text-xs text-slate-400">{m.company}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        m.status === 'Ongoing' ? 'bg-amber-500/10 text-amber-400' :
                        m.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-polish-hover text-slate-400 border border-polish-border'
                      }`}>
                        {m.status}
                      </span>
                      <ExternalLink className="h-4 w-4 text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Span 1: Reminders & Quick Actions */}
        <div className="space-y-8">
          
          {/* Quick Action Items Reminder */}
          <div className="bg-polish-card border border-polish-border rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-400" /> Pengingat Otomatis
              </h3>
              <span className="text-[10px] bg-rose-500/15 text-rose-400 font-bold px-2 py-0.5 rounded-full">
                {highPriorityReminders.length} Belum Selesai
              </span>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {highPriorityReminders.map(item => (
                <div key={item.id} className="p-3 bg-polish-input/40 border border-polish-border rounded-xl space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-semibold text-slate-200 line-clamp-2">{item.title}</h4>
                    <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 uppercase">TERLEWAT</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="font-semibold text-blue-400">PIC: {item.pic}</span>
                    <span className="font-mono">Tenggat: {item.deadline}</span>
                  </div>
                </div>
              ))}
              {highPriorityReminders.length === 0 && (
                <div className="text-center py-6">
                  <UserCheck className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Kerja bagus! Seluruh action item mendesak telah selesai dikerjakan.</p>
                </div>
              )}
            </div>

            <div className="border-t border-polish-border pt-3 flex justify-between items-center">
              <span className="text-[11px] text-slate-400">Kirim peringatan otomatis?</span>
              <button
                onClick={() => triggerNotification('whatsapp')}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-bold cursor-pointer transition-all"
              >
                Kirim WA ke semua PIC &rarr;
              </button>
            </div>
          </div>

          {/* Meeting Templates Shortcut */}
          <div className="bg-polish-card border border-polish-border rounded-3xl p-6 space-y-4">
            <h3 className="font-display font-semibold text-base text-white">Template Rapat Perusahaan</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { title: 'Rapat Direksi', desc: 'Laporan Keuangan & Strategi' },
                { title: 'Tender Proyek', desc: 'Seleksi Kontraktor & RAB' },
                { title: 'K3 & Safety', desc: 'Audit Keselamatan Kerja' },
                { title: 'Mingguan Proyek', desc: 'SINKRONISASI Progress' }
              ].map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigateToTab('meetings')}
                  className="p-3 bg-polish-input/40 hover:bg-polish-input border border-polish-border rounded-xl text-left hover:border-blue-500/50 transition-all cursor-pointer group"
                >
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-all">{template.title}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{template.desc}</p>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Area: Recent Meetings List */}
      <div className="bg-polish-card border border-polish-border rounded-3xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-display font-semibold text-base text-white">Rapat Terbaru &amp; Progres Notulen</h3>
          <button 
            onClick={() => onNavigateToTab('meetings')}
            className="text-xs text-blue-400 hover:text-blue-300 transition-all cursor-pointer font-bold"
          >
            Lihat Semua Rapat &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-polish-input text-slate-400 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4 rounded-l-xl">Topik Rapat</th>
                <th className="p-4">Perusahaan</th>
                <th className="p-4">Tanggal</th>
                <th className="p-4">Notulen (Minutes)</th>
                <th className="p-4 rounded-r-xl text-right">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-polish-border/50">
              {meetings.slice(0, 5).map((m) => (
                <tr key={m.id} className="hover:bg-polish-input/20 transition-all">
                  <td className="p-4 font-semibold text-white">
                    <button 
                      onClick={() => onSelectMeeting(m.id)}
                      className="hover:text-blue-400 text-left transition-all cursor-pointer font-semibold block"
                    >
                      {m.title}
                    </button>
                    <span className="text-[10px] font-mono text-slate-500">{m.category}</span>
                  </td>
                  <td className="p-4 text-slate-400">{m.company}</td>
                  <td className="p-4 text-slate-400">{m.date} - {m.time}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      m.minutesStatus === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      m.minutesStatus === 'Review' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-polish-input text-slate-300 border border-polish-border'
                    }`}>
                      {m.minutesStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => onSelectMeeting(m.id)}
                      className="px-3 py-1 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white font-bold text-xs rounded-lg transition-all cursor-pointer border border-blue-500/20 hover:border-transparent"
                    >
                      Buka Rapat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
