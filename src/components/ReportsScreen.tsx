import { BarChart3, TrendingUp, CheckSquare, Calendar, Award, Check } from 'lucide-react';
import { Meeting, ActionItem } from '../types';

interface ReportsScreenProps {
  meetings: Meeting[];
  actionItems: ActionItem[];
}

export default function ReportsScreen({ meetings, actionItems }: ReportsScreenProps) {
  
  const totalMeetings = meetings.length;
  const completedMeetings = meetings.filter(m => m.status === 'Completed').length;
  const totalActions = actionItems.length;
  const completedActions = actionItems.filter(a => a.status === 'Done').length;
  const completionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  // Group task count by PIC
  const picStats = actionItems.reduce((acc: any, curr) => {
    if (!curr.pic) return acc;
    if (!acc[curr.pic]) {
      acc[curr.pic] = { total: 0, done: 0 };
    }
    acc[curr.pic].total += 1;
    if (curr.status === 'Done') {
      acc[curr.pic].done += 1;
    }
    return acc;
  }, {});

  return (
    <div className="p-8 h-full overflow-y-auto max-w-7xl mx-auto space-y-8 font-sans bg-polish-bg text-slate-100">
      
      {/* Header */}
      <div className="border-b border-polish-border pb-6">
        <h1 className="font-display font-bold text-3xl text-white">Analisis &amp; Laporan Progres <span className="text-blue-400">(Reports)</span></h1>
        <p className="text-sm text-slate-400 mt-1">Metrik visual real-time penyelesaian keputusan, notulen, dan tindak lanjut (Action Items) per-divisi.</p>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Completion rate */}
        <div className="bg-polish-card border border-polish-border rounded-3xl p-6 space-y-4 col-span-1 md:col-span-2">
          <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
            <TrendingUp className="h-4.5 w-4.5 text-blue-400" /> Rasio Penyelesaian Rencana Kerja (S-Curve)
          </h3>
          
          <div className="flex items-center gap-8 py-4">
            <div className="text-left">
              <h4 className="text-4xl font-extrabold text-white font-mono">{completionRate}%</h4>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mt-1">Penyelesaian Kerja</span>
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-xs text-slate-400 font-bold">
                <span>Action Items Selesai ({completedActions} / {totalActions})</span>
                <span>{completionRate}%</span>
              </div>
              <div className="w-full bg-polish-input h-3 rounded-full overflow-hidden border border-polish-border">
                <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${completionRate}%` }} />
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 italic">S-curve optimal menunjukkan progres harian yang berbanding lurus dengan target pengerjaan kosdotel 7 lantai. Seluruh PIC diimbau menyelesaikan tugas tepat waktu.</p>
        </div>

        {/* Card 2: Overview stats */}
        <div className="bg-polish-card border border-polish-border rounded-3xl p-6 flex flex-col justify-between">
          <h3 className="font-display font-semibold text-sm text-slate-400 uppercase tracking-widest">Kinerja Notulen</h3>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center text-sm font-semibold text-slate-200">
              <span>Total Rapat</span>
              <span className="font-mono text-white">{totalMeetings}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Rapat Selesai</span>
              <span>{completedMeetings}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Notulen Disetujui (Approved)</span>
              <span>{meetings.filter(m => m.minutesStatus === 'Approved').length}</span>
            </div>
          </div>
          <div className="border-t border-polish-border/60 pt-3 flex justify-between items-center text-xs text-blue-400 font-bold">
            <span>Rapat Hari Ini</span>
            <span>{meetings.filter(m => m.date === '2026-07-05').length} Rapat</span>
          </div>
        </div>

        {/* Card 3: PIC Task Load Breakdown */}
        <div className="bg-polish-card border border-polish-border rounded-3xl p-6 space-y-4 col-span-full">
          <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
            <Award className="h-4.5 w-4.5 text-blue-400" /> Beban Kerja &amp; Akuntabilitas PIC
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.keys(picStats).map(pic => {
              const stats = picStats[pic];
              const rate = Math.round((stats.done / stats.total) * 100);
              return (
                <div key={pic} className="bg-polish-input p-4 rounded-2xl border border-polish-border flex flex-col justify-between space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-white">{pic}</h4>
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 font-bold px-2 py-0.5 rounded-full">{rate}%</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Progres Tugas</span>
                      <span>{stats.done} / {stats.total} Selesai</span>
                    </div>
                    <div className="w-full bg-polish-card h-1 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${rate}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
