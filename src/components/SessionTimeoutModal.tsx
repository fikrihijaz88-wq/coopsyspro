import React from 'react';
import { ShieldAlert, Clock, LogOut, RefreshCw, Lock, AlertTriangle } from 'lucide-react';

interface SessionTimeoutModalProps {
  remainingSeconds: number;
  onExtendSession: () => void;
  onLogout: () => void;
  language: 'BM' | 'EN';
}

export const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  remainingSeconds,
  onExtendSession,
  onLogout,
  language,
}) => {
  const isEN = language === 'EN';

  // Format seconds into MM:SS format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.max(0, seconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-5 overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center shrink-0 shadow-lg shadow-amber-950/60 animate-bounce">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              {isEN ? 'SECURITY AUTO-TIMEOUT WARNING' : 'PERINGATAN SELEPAS 14 MINIT TANPA AKTIVITI'}
            </div>
            <h3 className="text-lg font-bold text-white">
              {isEN ? 'Your Session is Expiring Soon' : 'Sesi Log Masuk Anda Hampir Tamat'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isEN
                ? 'To protect co-operative financial records, the system auto-logs out after 15 minutes of inactivity.'
                : 'Demi keselamatan data perakaunan & kewangan koperasi, sistem akan log keluar secara automatik jika tiada aktiviti.'}
            </p>
          </div>
        </div>

        {/* Live Countdown Clock Box */}
        <div className="bg-slate-950 border border-amber-800/80 rounded-2xl p-4 text-center space-y-2 relative">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400 animate-spin" />
            {isEN ? 'Auto-Logout Countdown' : 'Masa Sesi Log Masuk Tamat Dalam'}
          </span>
          
          <div className="text-4xl font-black font-mono text-amber-400 tracking-wider font-numeric">
            {formatTime(remainingSeconds)}
          </div>

          <p className="text-[11px] text-slate-400">
            {isEN
              ? 'Click "Extend Session" below to maintain active access.'
              : 'Klik "Kekalkan Log Masuk" di bawah untuk meneruskan kerja anda.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={onExtendSession}
            className="w-full sm:flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isEN ? 'Extend Session (Stay Logged In)' : 'Kekalkan Log Masuk'}</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full sm:w-auto px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>{isEN ? 'Logout Now' : 'Log Keluar'}</span>
          </button>
        </div>

        {/* Security Note */}
        <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1 pt-1">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>{isEN ? 'Akta Koperasi 1993 Secure Audit Protocol' : 'Protokol Audit Keselamatan Akta Koperasi 1993'}</span>
        </div>

      </div>
    </div>
  );
};
