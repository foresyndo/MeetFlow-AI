import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Mail, 
  Lock, 
  Building2, 
  Globe, 
  Phone, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  SendHorizontal
} from 'lucide-react';
import { User } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

const COMPANIES = [
  { id: 'kosdotel', name: 'PT Kosdotel Group Pratama' },
  { id: 'konstruksi', name: 'PT Konstruksi Perkasa Nusantara' },
  { id: 'marketing', name: 'Marketing Hub Asia' },
  { id: 'finance', name: 'Finance Partners Corp' },
];

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [loginMethod, setLoginMethod] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('sahrul.viona12@gmail.com');
  const [password, setPassword] = useState('password123');
  const [otpPhone, setOtpPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(COMPANIES[0].name);
  const [role, setRole] = useState<'Contractor' | 'Manager' | 'Director' | 'Employee'>('Contractor');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login
    setTimeout(() => {
      onLoginSuccess({
        id: Math.random().toString(36).substring(7),
        email: loginMethod === 'email' ? email : `${otpPhone}@otp.meetflow.ai`,
        name: email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
        company: selectedCompany,
        role: role,
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`
      });
      setIsLoading(false);
    }, 1200);
  };

  const handleSendOtp = () => {
    if (!otpPhone) return;
    setIsLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-polish-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Sparkles className="h-6 w-6 text-white animate-pulse" />
          </div>
          <span className="font-display font-bold text-3xl tracking-tight text-white">
            MeetFlow<span className="text-blue-500">AI</span>
          </span>
        </div>
        <h2 className="mt-6 text-center text-sm font-semibold tracking-wider text-slate-400 uppercase">
          Smart Meeting & Decision Management
        </h2>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <div className="bg-[#1e1e1e]/90 backdrop-blur-xl py-8 px-4 border border-polish-border shadow-2xl rounded-3xl sm:px-10">
          
          {/* Company & Role Selector */}
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-blue-400" /> Perusahaan / Unit Kerja
              </label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full bg-polish-input text-slate-200 border border-polish-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                {COMPANIES.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-400" /> Peran Akses (Role)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['Contractor', 'Manager', 'Director', 'Employee'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`text-xs py-2 rounded-lg border font-medium transition-all cursor-pointer ${
                      role === r 
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-semibold' 
                        : 'border-polish-border bg-polish-input text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r === 'Contractor' ? 'Kontraktor' : r === 'Director' ? 'Direktur' : r === 'Manager' ? 'Manajer' : 'Staf'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-polish-border my-5" />

          {/* Login Method Tab Selector */}
          <div className="flex border-b border-polish-border mb-6">
            <button
              onClick={() => { setLoginMethod('email'); setOtpSent(false); }}
              className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 text-center cursor-pointer ${
                loginMethod === 'email' 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Email & Sandi
            </button>
            <button
              onClick={() => setLoginMethod('otp')}
              className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 text-center cursor-pointer ${
                loginMethod === 'otp' 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              OTP WhatsApp/SMS
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {loginMethod === 'email' ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 bg-polish-input border border-polish-border rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="nama@perusahaan.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 bg-polish-input border border-polish-border rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-slate-500" />
                      </div>
                      <input
                        type="tel"
                        required={loginMethod === 'otp'}
                        value={otpPhone}
                        onChange={(e) => setOtpPhone(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 bg-polish-input border border-polish-border rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="08123456789"
                      />
                    </div>
                    {!otpSent && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={!otpPhone}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-polish-input disabled:text-slate-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                      >
                        Kirim OTP <SendHorizontal className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {otpSent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-1"
                  >
                    <label className="block text-xs font-medium text-slate-300">
                      Kode Verifikasi OTP (Ketik 123456)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="block w-full text-center tracking-widest text-lg font-mono py-2 bg-polish-input border border-polish-border rounded-xl text-blue-400 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="000000"
                    />
                    <p className="text-xs text-blue-400 mt-1">Kode OTP dikirim sukses via WhatsApp!</p>
                  </motion.div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={isLoading || (loginMethod === 'otp' && !otpSent)}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-500/10 cursor-pointer disabled:bg-polish-input disabled:text-slate-500 disabled:shadow-none"
            >
              {isLoading ? 'Menghubungkan...' : 'Masuk ke MeetFlow AI'}
            </button>
          </form>

          {/* SSO Options */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-polish-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-[#1e1e1e] text-slate-500">
                  Atau masuk dengan
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onLoginSuccess({
                    id: 'google-user',
                    email: email,
                    name: 'Sahrul Viona (Google)',
                    company: selectedCompany,
                    role: role,
                    avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=google'
                  });
                }}
                className="w-full inline-flex justify-center py-2.5 px-4 border border-polish-border rounded-xl bg-polish-input text-xs font-semibold text-slate-300 hover:bg-polish-hover transition-all gap-2 items-center cursor-pointer"
              >
                <Globe className="h-4 w-4 text-blue-400" />
                Google
              </button>

              <button
                onClick={() => {
                  onLoginSuccess({
                    id: 'ms-user',
                    email: email,
                    name: 'Sahrul Viona (Outlook)',
                    company: selectedCompany,
                    role: role,
                    avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ms'
                  });
                }}
                className="w-full inline-flex justify-center py-2.5 px-4 border border-polish-border rounded-xl bg-polish-input text-xs font-semibold text-slate-300 hover:bg-polish-hover transition-all gap-2 items-center cursor-pointer"
              >
                <Building2 className="h-4 w-4 text-blue-400" />
                Microsoft
              </button>
            </div>
          </div>

        </div>
      </motion.div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md mt-6 text-center text-xs text-slate-500 z-10 space-y-1">
        <p>Akses Terenkripsi &amp; Sesuai Regulasi K3 Proyek.</p>
        <p>&copy; 2026 MeetFlow AI Corp. All rights reserved.</p>
      </div>
    </div>
  );
}
