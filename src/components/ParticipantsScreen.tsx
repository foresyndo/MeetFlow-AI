import { Users, Mail, ShieldAlert, CheckCircle2, AlertTriangle, Building } from 'lucide-react';
import { ActionItem, User } from '../types';

interface ParticipantsScreenProps {
  actionItems: ActionItem[];
}

export default function ParticipantsScreen({ actionItems }: ParticipantsScreenProps) {
  
  // High fidelity list of participants in project Kosdotel & MeetFlow Workspace
  const participants = [
    { name: 'Budi Santoso', email: 'budi.lapangan@kosdotel.com', role: 'PIC Lapangan / Kontraktor', company: 'PT Konstruksi Perkasa Nusantara', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Budi' },
    { name: 'Siti Rahmawati', email: 'siti.keuangan@kosdotel.com', role: 'Staff Keuangan', company: 'PT Kosdotel Group Pratama', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Siti' },
    { name: 'Rudi Hermawan', email: 'rudi.k3@kosdotel.com', role: 'Pengawas K3 & Safety', company: 'PT Konstruksi Perkasa Nusantara', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rudi' },
    { name: 'Joko Widodo', email: 'joko.direktur@kosdotel.com', role: 'Direktur Utama', company: 'PT Kosdotel Group Pratama', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Joko' },
  ];

  return (
    <div className="p-8 h-full overflow-y-auto max-w-7xl mx-auto space-y-8 font-sans bg-polish-bg text-slate-100">
      
      {/* Header */}
      <div className="border-b border-polish-border pb-6">
        <h1 className="font-display font-bold text-3xl text-white">Daftar Anggota &amp; PIC</h1>
        <p className="text-sm text-slate-400 mt-1">Daftar personil, pembagian peran kualifikasi, serta beban kerja tindak lanjut (Action Items).</p>
      </div>

      {/* Grid List of Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {participants.map((p, idx) => {
          // Calculate tasks count for this PIC
          const personalTasks = actionItems.filter(item => item.pic?.toLowerCase().includes(p.name.split(' ')[0].toLowerCase()));
          const completed = personalTasks.filter(item => item.status === 'Done').length;
          const pending = personalTasks.length - completed;

          return (
            <div 
              key={idx} 
              className="bg-polish-card border border-polish-border rounded-3xl p-6 flex flex-col md:flex-row gap-5 hover:border-blue-500/30 transition-all"
            >
              <img 
                src={p.avatar} 
                alt={p.name} 
                className="h-16 w-16 rounded-2xl bg-polish-input border border-polish-border p-1 self-start md:self-center"
              />
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-lg text-white">{p.name}</h3>
                  <p className="text-xs text-blue-400 font-semibold">{p.role}</p>
                  
                  <div className="flex flex-col gap-1 text-xs text-slate-400 mt-2 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-slate-500" />
                      <span>{p.company}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-500" />
                      <span>{p.email}</span>
                    </div>
                  </div>
                </div>

                {/* Task Load meter */}
                <div className="border-t border-polish-border/60 pt-3.5 grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-polish-input border border-polish-border/60 rounded-xl">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Tugas</span>
                    <span className="text-sm font-bold text-white font-mono">{personalTasks.length}</span>
                  </div>
                  <div className="p-2 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                    <span className="text-[10px] text-emerald-500 block uppercase font-bold">Selesai</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">{completed}</span>
                  </div>
                  <div className="p-2 bg-rose-500/5 rounded-xl border border-rose-500/10">
                    <span className="text-[10px] text-rose-500 block uppercase font-bold">Pending</span>
                    <span className="text-sm font-bold text-rose-400 font-mono">{pending}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
