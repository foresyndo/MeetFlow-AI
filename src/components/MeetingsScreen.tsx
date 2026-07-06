import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Sparkles, 
  FileText, 
  Building2, 
  Calendar, 
  Clock, 
  Users, 
  Briefcase,
  ChevronRight,
  Filter,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Meeting, User } from '../types';

interface MeetingsScreenProps {
  meetings: Meeting[];
  onCreateMeeting: (newMeeting: Omit<Meeting, 'id' | 'status' | 'minutesStatus'>) => void;
  onSelectMeeting: (meetingId: string) => void;
  currentUser: User | null;
}

const CATEGORIES = [
  'Semua Kategori',
  'Meeting Kontraktor',
  'Meeting Direksi',
  'Meeting Marketing',
  'Meeting Finance',
  'Weekly Project',
  'Monthly Review'
];

export default function MeetingsScreen({ 
  meetings, 
  onCreateMeeting, 
  onSelectMeeting,
  currentUser
}: MeetingsScreenProps) {
  
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
  
  // Semantic Search AI States
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);
  const [semanticResults, setSemanticResults] = useState<any[] | null>(null);

  // Form states for creating a new meeting
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState(currentUser?.company || 'PT Kosdotel Group Pratama');
  const [newDate, setNewDate] = useState('2026-07-06');
  const [newTime, setNewTime] = useState('09:00');
  const [newCategory, setNewCategory] = useState('Meeting Kontraktor');
  const [newParticipants, setNewParticipants] = useState('Budi, Siti, Rudi, Joko');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    onCreateMeeting({
      title: newTitle,
      company: newCompany,
      date: newDate,
      time: newTime,
      category: newCategory,
      participants: newParticipants.split(',').map(p => p.trim()).filter(Boolean),
      duration: 60
    });

    setIsNewMeetingOpen(false);
    // Reset form
    setNewTitle('');
  };

  // Trigger Gemini AI Semantic Search
  const handleSemanticSearch = async () => {
    if (!searchQuery) {
      setSemanticResults(null);
      return;
    }
    setIsSemanticSearching(true);
    try {
      const response = await fetch('/api/gemini/semantic-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, meetings: meetings })
      });
      if (response.ok) {
        const data = await response.json();
        setSemanticResults(data.results || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSemanticSearching(false);
    }
  };

  // Clear search and reset
  const handleClearSearch = () => {
    setSearchQuery('');
    setSemanticResults(null);
  };

  // Filter meetings based on category & search query (incorporating semantic results if available)
  const filteredMeetings = meetings.filter(m => {
    // 1. Category filter
    if (selectedCategory !== 'Semua Kategori' && m.category !== selectedCategory) {
      return false;
    }

    // 2. Semantic Search Filter override
    if (semanticResults) {
      return semanticResults.some(res => res.id === m.id);
    }

    // 3. Keyword Search fallback
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.company.toLowerCase().includes(q) ||
        m.participants.some(p => p.toLowerCase().includes(q)) ||
        m.category.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="p-8 h-full overflow-y-auto max-w-7xl mx-auto space-y-8 font-sans bg-polish-bg text-slate-100">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-polish-border pb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">Manajemen Rapat</h1>
          <p className="text-sm text-slate-400 mt-1">Kelola agenda rapat, buat notulen, dan pantau keputusan secara real-time.</p>
        </div>
        <button
          onClick={() => setIsNewMeetingOpen(true)}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Tambah Rapat Baru
        </button>
      </div>

      {/* Grid: Left category list, Right main area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Column: Categories List */}
        <div className="bg-polish-card border border-polish-border rounded-3xl p-5 space-y-4 lg:col-span-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-blue-400" /> Kategori Rapat
          </h3>
          <div className="space-y-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSemanticResults(null);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex justify-between items-center cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-polish-hover border border-transparent'
                }`}
              >
                <span>{cat}</span>
                <span className="text-[10px] bg-polish-input px-2 py-0.5 rounded-full font-mono text-slate-500">
                  {cat === 'Semua Kategori' 
                    ? meetings.length 
                    : meetings.filter(m => m.category === cat).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Columns: Meetings List & Semantic Search */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Advanced Search Bar (supports Semantic Intelligence) */}
          <div className="bg-polish-card border border-polish-border rounded-3xl p-4 flex flex-col md:flex-row gap-3 shadow-inner">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSemanticSearch()}
                className="block w-full pl-10 pr-3 py-2.5 bg-polish-input border border-polish-border rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Cari kata kunci, topik rapat, atau ketik pertanyaan pencarian (cth: 'Anggaran RAB semen')..."
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleSemanticSearch}
                disabled={isSemanticSearching || !searchQuery}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" /> {isSemanticSearching ? 'Searching...' : 'Pencarian AI'}
              </button>
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="px-3 py-2.5 bg-polish-input text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-xl border border-polish-border transition-all cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Semantic Search Explainer Bar */}
          {semanticResults && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-between text-xs text-blue-400">
              <span className="flex items-center gap-2 font-semibold">
                <Sparkles className="h-4 w-4" /> Menampilkan hasil pencarian semantik cerdas untuk: "{searchQuery}"
              </span>
              <button onClick={handleClearSearch} className="underline hover:text-white cursor-pointer font-bold">Reset Pencarian</button>
            </div>
          )}

          {/* Meetings Cards Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMeetings.map((meeting) => {
              // Find matching semantic justification if any
              const semanticMatch = semanticResults?.find(r => r.id === meeting.id);

              return (
                <div 
                  key={meeting.id}
                  onClick={() => onSelectMeeting(meeting.id)}
                  className="bg-polish-card border border-polish-border hover:border-blue-500/40 rounded-3xl p-6 flex flex-col justify-between hover:shadow-xl transition-all cursor-pointer relative overflow-hidden group"
                >
                  <div className="space-y-4">
                    {/* Header line */}
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/15 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {meeting.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        meeting.minutesStatus === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        meeting.minutesStatus === 'Review' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-polish-input text-slate-400 border border-polish-border'
                      }`}>
                        {meeting.minutesStatus === 'Approved' ? 'Disetujui' : meeting.minutesStatus === 'Review' ? 'Menunggu Review' : 'Draft Notulen'}
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="font-display font-bold text-lg text-white group-hover:text-blue-400 transition-all">
                        {meeting.title}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-400 text-xs mt-1">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>{meeting.company}</span>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 border-t border-polish-border pt-3.5">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        <span>{meeting.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        <span>{meeting.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <Users className="h-3.5 w-3.5 text-slate-500" />
                        <span className="truncate">Peserta: {meeting.participants.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Justification tooltip if semantic search hit */}
                  {semanticMatch && (
                    <div className="mt-4 p-3 bg-blue-950/40 border border-blue-900 rounded-2xl space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> Relevansi AI
                        </span>
                        <span className="text-[10px] font-black text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded">{semanticMatch.relevanceScore}%</span>
                      </div>
                      <p className="text-[11px] text-blue-200/90 leading-relaxed italic">"{semanticMatch.reason}"</p>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <span className="text-xs text-blue-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-all">
                      Buka Rapat <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>

                </div>
              );
            })}

            {filteredMeetings.length === 0 && (
              <div className="col-span-full text-center py-16 bg-polish-card border border-polish-border rounded-3xl">
                <FileText className="h-12 w-12 text-slate-700 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-300">Rapat Tidak Ditemukan</h3>
                <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau ganti kategori.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Modal: New Meeting Form */}
      {isNewMeetingOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-polish-card border border-polish-border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-polish-border flex justify-between items-center bg-[#1c1c1c]">
              <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-400" /> Jadwalkan Rapat Baru
              </h2>
              <button 
                onClick={() => setIsNewMeetingOpen(false)}
                className="text-slate-400 hover:text-slate-100 text-sm cursor-pointer"
              >
                Batal
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Topik Rapat / Pembahasan</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pembahasan Progres RAB Kosdotel 7 Lantai"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-polish-input border border-polish-border rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Perusahaan / Proyek</label>
                  <input
                    type="text"
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-polish-input border border-polish-border rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kategori</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-polish-input border border-polish-border rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {CATEGORIES.slice(1).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-polish-input border border-polish-border rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Waktu</label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-polish-input border border-polish-border rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Daftar Peserta (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  placeholder="Andi, Siti, Joko, Rudi"
                  value={newParticipants}
                  onChange={(e) => setNewParticipants(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-polish-input border border-polish-border rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="border-t border-polish-border pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewMeetingOpen(false)}
                  className="px-4 py-2 bg-polish-hover hover:opacity-90 text-slate-300 font-semibold text-xs rounded-xl border border-polish-border transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Mulai Rapat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
