import { Settings, Calendar, Bell, Shield, RefreshCw, Sparkles, Database } from 'lucide-react';
import { useState } from 'react';

export default function SettingsScreen() {
  const [workspaceName, setWorkspaceName] = useState('PT Kosdotel Group Pratama');
  const [calendarSync, setCalendarSync] = useState(true);
  const [waAlerts, setWaAlerts] = useState(true);
  const [tgAlerts, setTgAlerts] = useState(false);

  return (
    <div className="p-8 h-full overflow-y-auto max-w-4xl mx-auto space-y-8 font-sans bg-polish-bg text-slate-100">
      
      {/* Header */}
      <div className="border-b border-polish-border pb-6">
        <h1 className="font-display font-bold text-3xl text-white">Pengaturan Workspace <span className="text-blue-400">(Settings)</span></h1>
        <p className="text-sm text-slate-400 mt-1">Konfigurasi integrasi Google Calendar, notifikasi pengingat otomatis, dan profil perusahaan.</p>
      </div>

      <div className="space-y-6">
        
        {/* Workspace Profile */}
        <div className="bg-polish-card border border-polish-border rounded-3xl p-6 space-y-4">
          <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
            <Settings className="h-4.5 w-4.5 text-blue-400" /> Profil Perusahaan &amp; Workspace
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Nama Workspace</label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full px-4 py-2.5 bg-polish-input border border-polish-border rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Sync Integrations */}
        <div className="bg-polish-card border border-polish-border rounded-3xl p-6 space-y-4">
          <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
            <RefreshCw className="h-4.5 w-4.5 text-blue-400" /> Integrasi Sinkronisasi Eksternal
          </h3>
          <div className="space-y-4">
            
            <div className="flex items-center justify-between p-3.5 bg-polish-input border border-polish-border rounded-2xl">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-blue-400" /> Google Calendar &amp; Outlook Sync
                </h4>
                <p className="text-[10px] text-slate-500">Otomatis sinkronisasikan jadwal rapat ke kalender pribadi penanggung jawab.</p>
              </div>
              <input 
                type="checkbox" 
                checked={calendarSync} 
                onChange={(e) => setCalendarSync(e.target.checked)}
                className="h-4 w-4 bg-polish-bg rounded border-polish-border accent-blue-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-polish-input border border-polish-border rounded-2xl">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Bell className="h-4 w-4 text-blue-400" /> WhatsApp Reminders &amp; Alerts
                </h4>
                <p className="text-[10px] text-slate-500">Kirim tautan agenda rapat dan rekapitulasi action item langsung via WhatsApp.</p>
              </div>
              <input 
                type="checkbox" 
                checked={waAlerts} 
                onChange={(e) => setWaAlerts(e.target.checked)}
                className="h-4 w-4 bg-polish-bg rounded border-polish-border accent-blue-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-polish-input border border-polish-border rounded-2xl">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Bell className="h-4 w-4 text-sky-400" /> Telegram Bot Alerts
                </h4>
                <p className="text-[10px] text-slate-500">Aktifkan pengingat notulen tertunda langsung ke grup Telegram proyek.</p>
              </div>
              <input 
                type="checkbox" 
                checked={tgAlerts} 
                onChange={(e) => setTgAlerts(e.target.checked)}
                className="h-4 w-4 bg-polish-bg rounded border-polish-border accent-blue-500 cursor-pointer"
              />
            </div>

          </div>
        </div>

        {/* Database & Security */}
        <div className="bg-polish-card border border-polish-border rounded-3xl p-6 space-y-4">
          <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
            <Shield className="h-4.5 w-4.5 text-blue-400" /> Keamanan &amp; Penyimpanan Awan
          </h3>
          <div className="space-y-2 text-xs text-slate-400">
            <p className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Database className="h-4 w-4" /> Mode Database: Penyimpanan Hibrida Offline-Awan Aktif
            </p>
            <p>MeetFlow AI menyimpan data Anda dengan aman menggunakan cache offline yang disinkronkan secara real-time ke database PostgreSQL utama saat terhubung kembali.</p>
          </div>
        </div>

      </div>

    </div>
  );
}
