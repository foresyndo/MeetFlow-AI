import { Folder, Download, Paperclip, Search, FileText, Image, Film, FileSpreadsheet, Plus } from 'lucide-react';
import { useState } from 'react';
import { Attachment, Meeting } from '../types';

interface DocumentsScreenProps {
  attachments: Attachment[];
  meetings: Meeting[];
  onAddAttachmentGlobal: (name: string, type: string, size: string, meetingId: string) => void;
}

export default function DocumentsScreen({ attachments, meetings, onAddAttachmentGlobal }: DocumentsScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeetingId, setSelectedMeetingId] = useState(meetings[0]?.id || '');

  const filteredDocs = attachments.filter(doc => {
    return doc.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t === 'pdf') return <FileText className="h-5 w-5 text-rose-500" />;
    if (t === 'xls' || t === 'xlsx' || t === 'csv' || t === 'rab') return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
    if (t === 'jpg' || t === 'png' || t === 'jpeg') return <Image className="h-5 w-5 text-blue-500" />;
    if (t === 'mp4' || t === 'mov') return <Film className="h-5 w-5 text-amber-500" />;
    return <Folder className="h-5 w-5 text-blue-400" />;
  };

  const handleManualUpload = () => {
    const name = prompt("Ketik nama file lampiran:");
    if (!name) return;
    const ext = name.split('.').pop() || 'pdf';
    onAddAttachmentGlobal(name, ext, "1.24 MB", selectedMeetingId);
  };

  return (
    <div className="p-8 h-full overflow-y-auto max-w-7xl mx-auto space-y-8 font-sans bg-polish-bg text-slate-100">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-polish-border pb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">Pusat Dokumen <span className="text-blue-400">(Documents)</span></h1>
          <p className="text-sm text-slate-400 mt-1">Konsolidasi seluruh berkas rancangan, gambar kerja DWG, anggaran RAB, dan lampiran rapat.</p>
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedMeetingId}
            onChange={(e) => setSelectedMeetingId(e.target.value)}
            className="bg-polish-input text-xs border border-polish-border rounded-xl px-3 py-2 text-slate-300 focus:ring-1 focus:ring-blue-500"
          >
            {meetings.map(m => (
              <option key={m.id} value={m.id}>{m.title.substring(0, 30)}...</option>
            ))}
          </select>
          <button
            onClick={handleManualUpload}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Unggah Berkas
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Cari nama berkas lampiran..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-polish-input border border-polish-border rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredDocs.map(doc => {
          const associatedMeeting = meetings.find(m => m.id === doc.meetingId);
          return (
            <div 
              key={doc.id} 
              className="bg-polish-card border border-polish-border rounded-2xl p-4 flex flex-col justify-between hover:border-blue-500/30 transition-all space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-polish-input rounded-xl border border-polish-border flex-shrink-0">
                  {getIcon(doc.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-200 truncate" title={doc.name}>{doc.name}</h4>
                  <span className="text-[10px] text-slate-500 font-medium">{doc.size}</span>
                  <p className="text-[10px] text-slate-400 truncate mt-1.5 font-semibold">Ref: {associatedMeeting?.title || 'Rapat Umum'}</p>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-polish-border/60 pt-3">
                <span className="text-[10px] font-mono text-slate-500">Afd. {doc.uploadedAt}</span>
                <a 
                  href="#" 
                  className="p-1.5 bg-polish-input text-slate-400 hover:text-blue-400 hover:bg-polish-hover rounded-lg border border-polish-border transition-all"
                  onClick={(e) => { e.preventDefault(); console.log(`Downloading ${doc.name}...`); }}
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          );
        })}

        {filteredDocs.length === 0 && (
          <div className="col-span-full text-center py-16 bg-polish-card border border-polish-border rounded-3xl">
            <Folder className="h-12 w-12 text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Belum ada berkas lampiran yang diunggah.</p>
          </div>
        )}
      </div>

    </div>
  );
}
