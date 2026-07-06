import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Trash2, 
  Plus, 
  Play, 
  Square, 
  CheckCircle2, 
  User, 
  Calendar, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  ListOrdered, 
  FileCode, 
  Bold, 
  Italic, 
  Underline, 
  Paperclip, 
  Download, 
  Send,
  Eye,
  Check,
  UserCheck,
  FileSpreadsheet,
  FileText,
  Workflow,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { Meeting, AgendaItem, ActionItem, Attachment, ApprovalLog } from '../types';
import { exportToHtml, exportToMarkdown, exportToCsv, downloadFile } from '../utils/export';

interface NotionEditorProps {
  meeting: Meeting;
  agendas: AgendaItem[];
  attachments: Attachment[];
  approvalLogs: ApprovalLog[];
  onUpdateAgendas: (updated: AgendaItem[]) => void;
  onUpdateMeetingStatus: (status: 'Upcoming' | 'Ongoing' | 'Completed') => void;
  onUpdateMinutesStatus: (status: 'Draft' | 'Review' | 'Approved') => void;
  onAddAttachment: (name: string, type: string, size: string) => void;
  onAddApprovalLog: (log: Omit<ApprovalLog, 'id' | 'meetingId' | 'timestamp'>) => void;
  onBack: () => void;
}

export default function NotionEditor({
  meeting,
  agendas,
  attachments,
  approvalLogs,
  onUpdateAgendas,
  onUpdateMeetingStatus,
  onUpdateMinutesStatus,
  onAddAttachment,
  onAddApprovalLog,
  onBack
}: NotionEditorProps) {
  
  const [activeAgendaId, setActiveAgendaId] = useState<string | null>(agendas[0]?.id || null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSummaryResult, setAiSummaryResult] = useState<any | null>(null);
  
  // Voice Recording Simulator States
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [recordTranscript, setRecordTranscript] = useState<string | null>(null);
  const recordInterval = useRef<NodeJS.Timeout | null>(null);

  // File Upload states
  const [dragActive, setDragActive] = useState(false);

  // Active Agenda detail state access
  const activeAgenda = agendas.find(a => a.id === activeAgendaId);

  // Helper: Update a specific agenda property
  const updateActiveAgendaProp = (key: keyof AgendaItem, value: any) => {
    if (!activeAgendaId) return;
    const updated = agendas.map(a => {
      if (a.id === activeAgendaId) {
        return { ...a, [key]: value };
      }
      return a;
    });
    onUpdateAgendas(updated);
  };

  // Helper: Drag & drop agenda ordering (Simple click-to-move-up / down)
  const moveAgenda = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= agendas.length) return;
    
    const updated = [...agendas];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    
    // Recalculate orders
    const final = updated.map((item, idx) => ({ ...item, order: idx }));
    onUpdateAgendas(final);
  };

  // Helper: Add quick custom agenda
  const handleAddAgenda = () => {
    const newId = Math.random().toString(36).substring(7);
    const newAgenda: AgendaItem = {
      id: newId,
      meetingId: meeting.id,
      title: 'Agenda Baru',
      order: agendas.length,
      completed: false,
      notes: '<p>Tulis catatan pembahasan di sini...</p>',
      decisions: '<p>Keputusan yang diambil...</p>',
      pic: '',
      deadline: '',
      status: 'Open',
      actionItems: []
    };
    onUpdateAgendas([...agendas, newAgenda]);
    setActiveAgendaId(newId);
  };

  // Helper: Add action item under active agenda
  const handleAddActionItem = () => {
    if (!activeAgenda) return;
    const newItem: ActionItem = {
      id: Math.random().toString(36).substring(7),
      meetingId: meeting.id,
      agendaItemId: activeAgenda.id,
      title: 'Tindak Lanjut Baru',
      pic: 'Budi',
      deadline: '2026-07-10',
      status: 'Open'
    };
    const updatedActionItems = [...(activeAgenda.actionItems || []), newItem];
    updateActiveAgendaProp('actionItems', updatedActionItems);
  };

  // Helper: Update action item property
  const updateActionItemProp = (itemId: string, key: keyof ActionItem, value: any) => {
    if (!activeAgenda) return;
    const updatedItems = activeAgenda.actionItems.map(item => {
      if (item.id === itemId) {
        return { ...item, [key]: value };
      }
      return item;
    });
    updateActiveAgendaProp('actionItems', updatedItems);
  };

  // Helper: Remove action item
  const handleRemoveActionItem = (itemId: string) => {
    if (!activeAgenda) return;
    const updatedItems = activeAgenda.actionItems.filter(item => item.id !== itemId);
    updateActiveAgendaProp('actionItems', updatedItems);
  };

  // Trigger Gemini AI meeting assistant (Ringkas Meeting, Buat Action Item, Cari Keputusan)
  const triggerAiAssistant = async (type: 'summarize' | 'extract' | 'notulen') => {
    setIsAiLoading(true);
    try {
      if (type === 'summarize') {
        const response = await fetch('/api/gemini/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: meeting.title,
            company: meeting.company,
            category: meeting.category,
            date: meeting.date,
            agendas: agendas
          })
        });
        if (response.ok) {
          const summaryData = await response.json();
          setAiSummaryResult(summaryData);

          // Update active agenda with suggested actions if any
          if (summaryData.suggestedActionItems && activeAgenda) {
            const items = summaryData.suggestedActionItems.map((aiItem: any) => ({
              id: Math.random().toString(36).substring(7),
              meetingId: meeting.id,
              agendaItemId: activeAgenda.id,
              title: aiItem.title,
              pic: aiItem.pic || 'Budi',
              deadline: aiItem.deadline || '2026-07-15',
              status: aiItem.status || 'Progress'
            }));
            updateActiveAgendaProp('actionItems', [...(activeAgenda.actionItems || []), ...items]);
          }
        }
      } else if (type === 'extract' && activeAgenda) {
        const response = await fetch('/api/gemini/analyze-agenda', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: activeAgenda.title,
            notes: activeAgenda.notes
          })
        });
        if (response.ok) {
          const data = await response.json();
          // Update active agenda's decisions and action items
          if (data.decisions && data.decisions.length > 0) {
            const decHtml = data.decisions.map((d: string) => `<p>• ${d}</p>`).join('');
            updateActiveAgendaProp('decisions', decHtml);
          }
          if (data.actionItems && data.actionItems.length > 0) {
            const items = data.actionItems.map((aiItem: any) => ({
              id: Math.random().toString(36).substring(7),
              meetingId: meeting.id,
              agendaItemId: activeAgenda.id,
              title: aiItem.title,
              pic: aiItem.pic || 'Budi',
              deadline: aiItem.deadline || '2026-07-15',
              status: 'Progress'
            }));
            updateActiveAgendaProp('actionItems', [...(activeAgenda.actionItems || []), ...items]);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Audio recording simulation triggers
  const handleToggleRecording = async () => {
    if (isRecording) {
      // Stop recording and call Gemini for mock transcribing
      setIsRecording(false);
      if (recordInterval.current) clearInterval(recordInterval.current);
      
      setIsAiLoading(true);
      try {
        const response = await fetch('/api/gemini/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meetingContext: meeting.title,
            companyName: meeting.company
          })
        });
        if (response.ok) {
          const data = await response.json();
          setRecordTranscript(data.transcript);
          // If we have an active agenda, insert dialogue transcript to notes!
          if (activeAgenda) {
            const transcriptHtml = `<p><strong>[TRANSKRIP REKAMAN AI]:</strong></p><pre><code>${data.transcript}</code></pre>`;
            updateActiveAgendaProp('notes', activeAgenda.notes + transcriptHtml);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsAiLoading(false);
      }

    } else {
      // Start recording
      setIsRecording(true);
      setRecordDuration(0);
      setRecordTranscript(null);
      recordInterval.current = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);
    }
  };

  // Drag-and-drop attachments simulation
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const type = file.name.split('.').pop() || 'other';
      onAddAttachment(file.name, type, `${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    }
  };

  // Manual File Selector
  const triggerFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const type = file.name.split('.').pop() || 'other';
        onAddAttachment(file.name, type, `${(file.size / (1024 * 1024)).toFixed(2)} MB`);
      }
    };
    input.click();
  };

  // Approval log submission
  const submitForApproval = (status: 'Draft' | 'Review' | 'Approved', comment: string) => {
    onAddApprovalLog({
      from: currentUserRoleLabel(),
      to: status === 'Approved' ? 'Direktur Utama' : status === 'Review' ? 'Manajer Proyek' : 'Draft',
      roleFrom: meeting.minutesStatus,
      roleTo: status,
      status: status,
      notes: comment
    });
    onUpdateMinutesStatus(status);
  };

  const currentUserRoleLabel = () => {
    return 'User Kontraktor'; // Custom label
  };

  return (
    <div className="p-8 overflow-y-auto h-full max-w-7xl mx-auto space-y-8 font-sans bg-slate-950 text-slate-100">
      
      {/* Back & Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <button 
            onClick={onBack}
            className="text-xs text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 cursor-pointer transition-all mb-2"
          >
            &larr; Kembali ke Daftar Rapat
          </button>
          <h1 className="font-display font-extrabold text-2xl text-white tracking-tight">{meeting.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="font-bold text-teal-400 uppercase tracking-wider">{meeting.category}</span>
            <span>•</span>
            <span>{meeting.company}</span>
            <span>•</span>
            <span>{meeting.date} ({meeting.time})</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-2">
          {/* Record button */}
          <button
            onClick={handleToggleRecording}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
              isRecording 
                ? 'bg-rose-500 hover:bg-rose-600 text-white border-transparent animate-pulse' 
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800/80'
            }`}
          >
            {isRecording ? (
              <>
                <Square className="h-4 w-4" /> Stop Rekam ({recordDuration}s)
              </>
            ) : (
              <>
                <Play className="h-4 w-4 text-rose-500 fill-rose-500" /> Rekam Rapat (AI)
              </>
            )}
          </button>

          {/* Export options */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => {
                const html = exportToHtml(meeting, agendas);
                downloadFile(html, `Notulen_${meeting.title.replace(/\s+/g, '_')}.html`, 'text/html');
              }}
              className="p-2 hover:text-teal-400 text-slate-400 rounded-lg transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Ekspor ke PDF/HTML"
            >
              <Download className="h-3.5 w-3.5" /> PDF
            </button>
            <button
              onClick={() => {
                const md = exportToMarkdown(meeting, agendas);
                downloadFile(md, `Notulen_${meeting.title.replace(/\s+/g, '_')}.md`, 'text/plain');
              }}
              className="p-2 hover:text-teal-400 text-slate-400 rounded-lg transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Ekspor ke Word/Markdown"
            >
              <FileText className="h-3.5 w-3.5" /> Word
            </button>
            <button
              onClick={() => {
                const csv = exportToCsv(meeting, agendas);
                downloadFile(csv, `ActionItems_${meeting.title.replace(/\s+/g, '_')}.csv`, 'text/csv');
              }}
              className="p-2 hover:text-teal-400 text-slate-400 rounded-lg transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Ekspor Excel Checklist"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Sidebars & Notion Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Span 1: Notion-like Agendas list */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-5 space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Daftar Agenda</h3>
            <button 
              onClick={handleAddAgenda}
              className="p-1 hover:bg-slate-800 rounded-lg text-teal-400 hover:text-teal-300 transition-all cursor-pointer"
              title="Tambah Agenda"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1.5 max-h-96 overflow-y-auto">
            {agendas.map((agenda, index) => {
              const isActive = agenda.id === activeAgendaId;
              return (
                <div 
                  key={agenda.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group ${
                    isActive 
                      ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' 
                      : 'bg-slate-950/20 text-slate-400 border-transparent hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                  onClick={() => setActiveAgendaId(agenda.id)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = agendas.map(a => a.id === agenda.id ? { ...a, completed: !a.completed } : a);
                        onUpdateAgendas(updated);
                      }}
                      className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center transition-all ${
                        agenda.completed 
                          ? 'bg-teal-500 border-teal-500 text-slate-950' 
                          : 'border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {agenda.completed && <Check className="h-3 w-3 stroke-[3]" />}
                    </button>
                    <span className="text-xs truncate font-medium">{index + 1}. {agenda.title}</span>
                  </div>

                  {/* Drag and Drop Simple buttons */}
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); moveAgenda(index, 'up'); }}
                      disabled={index === 0}
                      className="p-1 hover:bg-slate-800 rounded text-slate-500 disabled:opacity-30 cursor-pointer"
                      title="Geser Atas"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); moveAgenda(index, 'down'); }}
                      disabled={index === agendas.length - 1}
                      className="p-1 hover:bg-slate-800 rounded text-slate-500 disabled:opacity-30 cursor-pointer"
                      title="Geser Bawah"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        const updated = agendas.filter(a => a.id !== agenda.id);
                        onUpdateAgendas(updated);
                        if (isActive) setActiveAgendaId(updated[0]?.id || null);
                      }}
                      className="p-1 hover:bg-rose-500/10 hover:text-rose-400 rounded text-slate-500 cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-800/80 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Timeline Alur Rapat</h4>
            <div className="space-y-3 pl-2">
              {agendas.map((agenda, index) => (
                <div key={agenda.id} className="flex items-start gap-3 text-xs">
                  <div className="flex flex-col items-center">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center border font-bold text-[10px] ${
                      agenda.completed 
                        ? 'bg-teal-500 border-teal-500 text-slate-950' 
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}>
                      {index + 1}
                    </div>
                    {index < agendas.length - 1 && <div className="w-0.5 bg-slate-800 h-8" />}
                  </div>
                  <div className="flex-1 py-0.5">
                    <p className={`font-semibold ${agenda.completed ? 'text-teal-400 line-through' : 'text-slate-300'}`}>{agenda.title}</p>
                    <span className="text-[10px] text-slate-500">PIC: {agenda.pic || 'Belum diisi'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Span 2: Notion Rich Text Editor & AI Tools */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Agenda Editor Panel */}
          {activeAgenda ? (
            <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 space-y-6">
              
              {/* Agenda Title and General Info */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800 pb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={activeAgenda.title}
                    onChange={(e) => updateActiveAgendaProp('title', e.target.value)}
                    className="w-full bg-transparent border-none text-xl font-bold font-display text-white focus:outline-none focus:ring-0 px-0"
                    placeholder="Judul Agenda..."
                  />
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                    <div className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-slate-500" />
                      <span>PIC:</span>
                      <input 
                        type="text" 
                        value={activeAgenda.pic}
                        onChange={(e) => updateActiveAgendaProp('pic', e.target.value)}
                        placeholder="Budi"
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-300 max-w-28 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      <span>Deadline:</span>
                      <input 
                        type="date" 
                        value={activeAgenda.deadline}
                        onChange={(e) => updateActiveAgendaProp('deadline', e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-300 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Progress toggle */}
                <div className="flex flex-col gap-1.5 self-start sm:self-auto">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Status Progres</span>
                  <select
                    value={activeAgenda.status}
                    onChange={(e) => updateActiveAgendaProp('status', e.target.value)}
                    className="bg-slate-950 text-xs font-semibold text-teal-400 border border-slate-800 rounded-xl px-3 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Open">🔵 Open</option>
                    <option value="Progress">🟡 Progress</option>
                    <option value="Done">🟢 Done</option>
                    <option value="Cancel">🔴 Cancel</option>
                  </select>
                </div>
              </div>

              {/* Rich Text Editor Simulation Panel (Notion Style) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Catatan Pembahasan (Notion-Style Editor)</label>
                  <button
                    onClick={() => triggerAiAssistant('extract')}
                    className="text-xs text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 cursor-pointer transition-all bg-teal-500/10 px-2 py-1 rounded"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Analisis AI Agenda
                  </button>
                </div>

                {/* Simulated Editor Toolbar */}
                <div className="flex flex-wrap gap-1 p-2 bg-slate-950 border border-slate-800 rounded-xl">
                  <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200" title="Bold" onClick={() => {}}><Bold className="h-3.5 w-3.5" /></button>
                  <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200" title="Italic" onClick={() => {}}><Italic className="h-3.5 w-3.5" /></button>
                  <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200" title="Underline" onClick={() => {}}><Underline className="h-3.5 w-3.5" /></button>
                  <div className="w-px bg-slate-800 mx-1" />
                  <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200" title="Numbered List" onClick={() => {}}><ListOrdered className="h-3.5 w-3.5" /></button>
                  <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200" title="Code Block" onClick={() => {}}><FileCode className="h-3.5 w-3.5" /></button>
                  <div className="w-px bg-slate-800 mx-1" />
                  <span className="text-[10px] text-slate-600 self-center font-mono select-none px-2">Ketik / untuk memicu block Notion</span>
                </div>

                {/* Editor Content editable text area */}
                <textarea
                  value={activeAgenda.notes.replace(/<[^>]+>/g, '')}
                  onChange={(e) => updateActiveAgendaProp('notes', `<p>${e.target.value}</p>`)}
                  className="w-full min-h-40 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono leading-relaxed"
                  placeholder="Ketik pembahasan agenda rapat..."
                />
              </div>

              {/* Decisions Aggregator Panel */}
              <div className="space-y-2 bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest">Keputusan Rapat yang Disepakati</h4>
                </div>
                <textarea
                  value={activeAgenda.decisions.replace(/<[^>]+>/g, '')}
                  onChange={(e) => updateActiveAgendaProp('decisions', `<p>${e.target.value}</p>`)}
                  className="w-full bg-transparent border-none text-sm text-amber-200 placeholder-amber-500/40 focus:outline-none focus:ring-0 p-0 resize-none"
                  placeholder="Ketik keputusan krusial rapat..."
                  rows={2}
                />
              </div>

              {/* Action Items List under this Agenda */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Action Items &amp; Penanggung Jawab</h4>
                  <button
                    onClick={handleAddActionItem}
                    className="text-xs text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <PlusCircle className="h-4 w-4" /> Tambah Action Item
                  </button>
                </div>

                <div className="space-y-2">
                  {activeAgenda.actionItems?.map((item) => (
                    <div 
                      key={item.id} 
                      className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl items-center"
                    >
                      {/* Checkbox */}
                      <div className="md:col-span-1 flex justify-center">
                        <button
                          onClick={() => {
                            const newStatus = item.status === 'Done' ? 'Open' : 'Done';
                            updateActionItemProp(item.id, 'status', newStatus);
                          }}
                          className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                            item.status === 'Done' 
                              ? 'bg-teal-500 border-teal-500 text-slate-950' 
                              : 'border-slate-800 hover:border-slate-600'
                          }`}
                        >
                          {item.status === 'Done' && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </button>
                      </div>

                      {/* Title input */}
                      <div className="md:col-span-4">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateActionItemProp(item.id, 'title', e.target.value)}
                          className="w-full bg-transparent border-none text-xs text-slate-200 focus:outline-none"
                        />
                      </div>

                      {/* PIC select */}
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          value={item.pic}
                          onChange={(e) => updateActionItemProp(item.id, 'pic', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-[11px] rounded p-1 focus:outline-none"
                          placeholder="PIC"
                        />
                      </div>

                      {/* Deadline date */}
                      <div className="md:col-span-3">
                        <input
                          type="date"
                          value={item.deadline}
                          onChange={(e) => updateActionItemProp(item.id, 'deadline', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-[11px] rounded p-1 focus:outline-none"
                        />
                      </div>

                      {/* Delete */}
                      <div className="md:col-span-2 flex justify-end">
                        <button
                          onClick={() => handleRemoveActionItem(item.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded transition-all cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {(!activeAgenda.actionItems || activeAgenda.actionItems.length === 0) && (
                    <p className="text-center text-xs text-slate-600 py-4">Belum ada tindakan lanjut. Klik Tambah Action Item.</p>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-12 text-center">
              <HelpCircle className="h-12 w-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Pilih agenda rapat dari panel sebelah kiri untuk mulai mengedit detail notulen.</p>
            </div>
          )}

          {/* AI Tools Workspace & Summarizer Block */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-teal-400" /> Ringkasan Rapat Eksekutif (AI MeetFlow)
              </h3>
              <button
                onClick={() => triggerAiAssistant('summarize')}
                disabled={isAiLoading}
                className="px-4 py-2 bg-teal-400 hover:bg-teal-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-teal-400/10 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" /> {isAiLoading ? 'Menyusun...' : 'Generate Notulen Rapat'}
              </button>
            </div>

            {aiSummaryResult ? (
              <div className="space-y-4 p-4 bg-slate-950 rounded-2xl border border-teal-500/10">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Executive Summary</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{aiSummaryResult.executiveSummary}</p>
                </div>
                
                {aiSummaryResult.keyDecisions && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Keputusan Utama</span>
                    <ul className="list-disc pl-4 text-xs text-slate-300 space-y-1">
                      {aiSummaryResult.keyDecisions.map((dec: string, idx: number) => (
                        <li key={idx}>{dec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Gunakan asisten AI untuk merangkum seluruh agenda rapat, mengekstrak keputusan krusial, dan merumuskan draf action item secara cerdas.</p>
            )}
          </div>

          {/* Attachments Section */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 space-y-4">
            <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2">
              <Paperclip className="h-4.5 w-4.5 text-teal-400" /> Lampiran Berkas Rapat (PDF, Word, RAB, DWG)
            </h3>

            {/* Drag & Drop simulated area */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`p-6 border-2 border-dashed rounded-2xl text-center transition-all ${
                dragActive 
                  ? 'border-teal-400 bg-teal-500/5' 
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/20'
              }`}
            >
              <Paperclip className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-semibold">Tarik &amp; lepas berkas rancangan di sini, atau</p>
              <button 
                type="button"
                onClick={triggerFileSelect}
                className="mt-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
              >
                Pilih Berkas Lampiran
              </button>
            </div>

            {/* Attachments List */}
            <div className="grid grid-cols-2 gap-2">
              {attachments.filter(a => a.meetingId === meeting.id).map(a => (
                <div key={a.id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center font-bold text-[10px] text-teal-400">
                      {a.type.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">{a.name}</p>
                      <span className="text-[10px] text-slate-500">{a.size}</span>
                    </div>
                  </div>
                  <a href="#" className="p-1 text-slate-500 hover:text-teal-400">
                    <Download className="h-3.5 w-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Approval Workflow & Minutes Approval */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2">
                <Workflow className="h-4.5 w-4.5 text-teal-400" /> Alur Kerja Persetujuan (Approval)
              </h3>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                meeting.minutesStatus === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' :
                meeting.minutesStatus === 'Review' ? 'bg-amber-500/10 text-amber-400 animate-pulse' :
                'bg-slate-800 text-slate-400'
              }`}>
                {meeting.minutesStatus}
              </span>
            </div>

            <div className="space-y-3">
              {approvalLogs.filter(log => log.meetingId === meeting.id).map((log) => (
                <div key={log.id} className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                    <span className="text-teal-400">{log.from} &rarr; {log.to}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <p className="text-slate-300">{log.notes}</p>
                  <span className="inline-block text-[9px] font-bold text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded uppercase">
                    Status: {log.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Change Status / Trigger approval action */}
            {meeting.minutesStatus === 'Draft' && (
              <div className="space-y-2">
                <p className="text-xs text-slate-400">Selesai menyusun notulen? Ajukan ke Manajer Proyek untuk ditinjau.</p>
                <button
                  onClick={() => submitForApproval('Review', 'Draf notulen selesai disusun, mohon ditinjau agar dapat diteruskan ke Direktur Utama.')}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Ajukan untuk Ditinjau (Submit to Manager)
                </button>
              </div>
            )}

            {meeting.minutesStatus === 'Review' && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => submitForApproval('Draft', 'Mohon lakukan revisi rincian anggaran semen di agenda RAB.')}
                  className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Revisi (Reject)
                </button>
                <button
                  onClick={() => submitForApproval('Approved', 'Notulen disetujui tanpa catatan tambahan. Selamat melanjutkan pengerjaan proyek!')}
                  className="py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Setujui Rapat (Approve)
                </button>
              </div>
            )}

            {meeting.minutesStatus === 'Approved' && (
              <div className="p-4 bg-emerald-500/15 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 flex-shrink-0" />
                <p className="text-xs text-emerald-200">Notulen rapat ini telah **Disetujui secara Resmi** (Approved). Versi dokumen ini terkunci dan telah terkirim via Email/WhatsApp ke seluruh direksi.</p>
              </div>
            )}
          </div>

        </div>
        
      </div>

    </div>
  );
}
