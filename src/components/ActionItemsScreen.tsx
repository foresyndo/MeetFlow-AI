import { useState } from 'react';
import { CheckSquare, Calendar, User, Search, Filter, AlertCircle, Check, ChevronDown } from 'lucide-react';
import { ActionItem, Meeting } from '../types';

interface ActionItemsScreenProps {
  actionItems: ActionItem[];
  meetings: Meeting[];
  onUpdateActionStatus: (itemId: string, status: 'Open' | 'Progress' | 'Done' | 'Cancel') => void;
}

export default function ActionItemsScreen({ 
  actionItems, 
  meetings, 
  onUpdateActionStatus 
}: ActionItemsScreenProps) {
  
  const [filterPIC, setFilterPIC] = useState('Semua PIC');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract all unique PICs
  const pics = ['Semua PIC', ...Array.from(new Set(actionItems.map(item => item.pic).filter(Boolean)))];

  // Filtering logic
  const filteredActions = actionItems.filter(item => {
    const meet = meetings.find(m => m.id === item.meetingId);
    
    const picMatch = filterPIC === 'Semua PIC' || item.pic === filterPIC;
    const statusMatch = filterStatus === 'Semua Status' || item.status === filterStatus;
    const queryMatch = !searchQuery || 
                       item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (meet?.title || '').toLowerCase().includes(searchQuery.toLowerCase());
                       
    return picMatch && statusMatch && queryMatch;
  });

  return (
    <div className="p-8 h-full overflow-y-auto max-w-7xl mx-auto space-y-8 font-sans bg-polish-bg text-slate-100">
      
      {/* Header */}
      <div className="border-b border-polish-border pb-6">
        <h1 className="font-display font-bold text-3xl text-white">Rencana Tindak Lanjut <span className="text-blue-400">(Action Items)</span></h1>
        <p className="text-sm text-slate-400 mt-1">Konsolidasi seluruh keputusan rapat dan tindak lanjut penanggung jawab proyek.</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-polish-card border border-polish-border rounded-3xl p-5 flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Cari action item atau nama rapat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-polish-input border border-polish-border rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter PIC */}
        <div className="w-full md:w-48">
          <select
            value={filterPIC}
            onChange={(e) => setFilterPIC(e.target.value)}
            className="w-full bg-polish-input text-xs font-semibold border border-polish-border rounded-xl px-4 py-2.5 cursor-pointer text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {pics.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Filter Status */}
        <div className="w-full md:w-48">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-polish-input text-xs font-semibold border border-polish-border rounded-xl px-4 py-2.5 cursor-pointer text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {['Semua Status', 'Open', 'Progress', 'Done', 'Cancel'].map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List / Table of Actions */}
      <div className="bg-polish-card border border-polish-border rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#1c1c1c] text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-polish-border">
              <tr>
                <th className="p-4 rounded-l-xl w-12 text-center">Status</th>
                <th className="p-4">Tindakan Lanjut</th>
                <th className="p-4">Rapat Acuan</th>
                <th className="p-4">PIC</th>
                <th className="p-4">Tenggat</th>
                <th className="p-4 rounded-r-xl text-center">Progres</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-polish-border/40">
              {filteredActions.map(item => {
                const meet = meetings.find(m => m.id === item.meetingId);
                const isOverdue = new Date(item.deadline) < new Date('2026-07-06') && item.status !== 'Done';

                return (
                  <tr key={item.id} className="hover:bg-polish-hover/40 transition-all">
                    {/* Status Checkbox */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => {
                          const next = item.status === 'Done' ? 'Open' : 'Done';
                          onUpdateActionStatus(item.id, next);
                        }}
                        className={`mx-auto h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                          item.status === 'Done' 
                            ? 'bg-blue-600 border-blue-600 text-white' 
                            : 'border-polish-border hover:border-slate-500'
                        }`}
                      >
                        {item.status === 'Done' && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </button>
                    </td>

                    {/* Task Title */}
                    <td className="p-4">
                      <span className={`font-semibold text-white ${item.status === 'Done' ? 'line-through text-slate-500' : ''}`}>
                        {item.title}
                      </span>
                      {isOverdue && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[9px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/15 px-1.5 py-0.5 rounded uppercase">
                          <AlertCircle className="h-3 w-3" /> Melewati Batas
                        </span>
                      )}
                    </td>

                    {/* Associated Meeting */}
                    <td className="p-4 text-slate-400 font-medium">
                      {meet?.title || 'Rapat Umum'}
                      <span className="block text-[10px] text-slate-500 font-mono mt-0.5">{meet?.category}</span>
                    </td>

                    {/* PIC Name */}
                    <td className="p-4 text-slate-300 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <div className="h-6 w-6 rounded-full bg-polish-input border border-polish-border flex items-center justify-center text-[10px] font-bold text-blue-400 uppercase">
                          {item.pic?.substring(0, 2)}
                        </div>
                        <span>{item.pic}</span>
                      </div>
                    </td>

                    {/* Deadline Date */}
                    <td className={`p-4 text-xs font-mono font-bold ${isOverdue ? 'text-rose-400' : 'text-slate-400'}`}>
                      {item.deadline}
                    </td>

                    {/* Progress Control Select */}
                    <td className="p-4 text-center">
                      <select
                        value={item.status}
                        onChange={(e) => onUpdateActionStatus(item.id, e.target.value as any)}
                        className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 border bg-polish-input focus:outline-none cursor-pointer ${
                          item.status === 'Done' ? 'text-emerald-400 border-emerald-500/15 bg-emerald-500/5' :
                          item.status === 'Progress' ? 'text-amber-400 border-amber-500/15 bg-amber-500/5' :
                          item.status === 'Cancel' ? 'text-rose-400 border-rose-500/15 bg-rose-500/5' :
                          'text-slate-400 border-polish-border'
                        }`}
                      >
                        <option value="Open">🔵 Open</option>
                        <option value="Progress">🟡 Progress</option>
                        <option value="Done">🟢 Done</option>
                        <option value="Cancel">🔴 Cancel</option>
                      </select>
                    </td>

                  </tr>
                );
              })}

              {filteredActions.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-500 text-xs">
                    <CheckSquare className="h-10 w-12 mx-auto mb-2 text-slate-700" />
                    Belum ada action item yang memenuhi kriteria pencarian/filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
