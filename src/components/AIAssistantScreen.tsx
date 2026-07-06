import React, { useState } from 'react';
import { Sparkles, Send, BrainCircuit, Bot, User, Trash2, HelpCircle } from 'lucide-react';
import { Meeting } from '../types';

interface AIAssistantScreenProps {
  meetings: Meeting[];
}

export default function AIAssistantScreen({ meetings }: AIAssistantScreenProps) {
  const [messages, setMessages] = useState<any[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Selamat pagi! Saya MeetFlow AI, asisten kognitif rapat Anda. Anda bisa menanyakan apa saja terkait keputusan, isi notulen, atau progress agenda dari seluruh rapat yang telah diselenggarakan.'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Send query directly to server-side Semantic Search/Chat logic
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = { id: Math.random().toString(), role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsAiLoading(true);

    try {
      // Formulate a request to analyze the database meetings in context
      const response = await fetch('/api/gemini/semantic-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg.content, meetings: meetings })
      });

      if (response.ok) {
        const data = await response.json();
        
        let reply = '';
        if (data.results && data.results.length > 0) {
          reply = `Berdasarkan analisis semantik terhadap seluruh berkas rapat Anda, berikut rincian pembahasan yang relevan:\n\n`;
          data.results.forEach((match: any, idx: number) => {
            const meetingDetails = meetings.find(m => m.id === match.id);
            if (meetingDetails) {
              reply += `### ${idx + 1}. ${meetingDetails.title}\n`;
              reply += `- **Perusahaan/Proyek**: ${meetingDetails.company}\n`;
              reply += `- **Kategori**: ${meetingDetails.category}\n`;
              reply += `- **Skor Relevansi**: ${match.relevanceScore}%\n`;
              reply += `- **Analisis AI**: ${match.reason}\n\n`;
            }
          });
        } else {
          reply = `Maaf, saya tidak menemukan pembahasan spesifik terkait "${userMsg.content}" di seluruh notulen rapat Anda. Coba tanyakan kata kunci lain seperti "RAB", "K3", atau "Kosdotel".`;
        }

        setMessages(prev => [...prev, {
          id: Math.random().toString(),
          role: 'assistant',
          content: reply
        }]);
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: 'assistant',
        content: `Maaf, terjadi kendala saat menghubungkan dengan Gemini AI. Namun dari basis data lokal, topik rapat "${userMsg.content}" dapat dicari di menu Manajemen Rapat menggunakan filter pencarian.`
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Selamat pagi! Saya MeetFlow AI, asisten kognitif rapat Anda. Anda bisa menanyakan apa saja terkait keputusan, isi notulen, atau progress agenda dari seluruh rapat yang telah diselenggarakan.'
      }
    ]);
  };

  return (
    <div className="p-8 h-full flex flex-col max-w-4xl mx-auto space-y-6 font-sans bg-polish-bg text-slate-100">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-polish-border pb-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-blue-400" /> MeetFlow AI Assistant
          </h1>
          <p className="text-xs text-slate-400 mt-1">Gunakan model Gemini untuk menganalisis notulen secara cerdas dan semantik.</p>
        </div>
        <button
          onClick={handleClearChat}
          className="p-2 bg-polish-card hover:bg-polish-hover border border-polish-border rounded-xl text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
          title="Hapus Percakapan"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Suggested Questions Bubble Shortcuts */}
      <div className="flex flex-wrap gap-2">
        {[
          'Apakah ada keputusan mengenai RAB?',
          'Siapa penanggung jawab K3 proyek Kosdotel?',
          'Tunjukkan ringkasan progress lantai 3',
          'Apa saja rencana tindak lanjut minggu ini?'
        ].map((q, idx) => (
          <button
            key={idx}
            onClick={() => { setInputMessage(q); }}
            className="px-3.5 py-1.5 bg-polish-card border border-polish-border text-slate-400 hover:text-blue-400 hover:border-blue-500/20 text-xs rounded-xl cursor-pointer transition-all"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 min-h-[400px] max-h-[500px] overflow-y-auto bg-polish-card/40 border border-polish-border rounded-3xl p-6 space-y-4">
        {messages.map((m) => {
          const isBot = m.role === 'assistant';
          return (
            <div key={m.id} className={`flex gap-3 items-start ${!isBot ? 'flex-row-reverse' : ''}`}>
              <div className={`p-2 rounded-xl flex items-center justify-center ${
                isBot ? 'bg-blue-500/10 text-blue-400' : 'bg-polish-hover text-slate-300 border border-polish-border'
              }`}>
                {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div className={`p-4 rounded-2xl max-w-lg text-sm leading-relaxed whitespace-pre-wrap border ${
                isBot ? 'bg-polish-input border-polish-border/60 text-slate-300' : 'bg-blue-600 border-transparent text-white font-medium'
              }`}>
                {m.content}
              </div>
            </div>
          );
        })}

        {isAiLoading && (
          <div className="flex gap-3 items-start">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center animate-bounce">
              <Bot className="h-4 w-4" />
            </div>
            <div className="p-4 rounded-2xl bg-polish-input border border-polish-border/60 text-slate-500 text-sm flex items-center gap-2">
              <span className="h-2 w-2 bg-blue-400 rounded-full animate-ping" />
              MeetFlow AI sedang menganalisis seluruh notulen rapat Anda...
            </div>
          </div>
        )}
      </div>

      {/* Form Input Bar */}
      <form onSubmit={handleSendMessage} className="bg-polish-card border border-polish-border rounded-2xl p-2.5 flex items-center gap-2.5 shadow-inner">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ketik pertanyaan Anda ke MeetFlow AI..."
          className="flex-1 bg-transparent border-none text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0 px-2"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isAiLoading}
          className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

    </div>
  );
}
