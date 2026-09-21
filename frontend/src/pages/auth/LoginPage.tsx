import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { 
  BuildingOffice2Icon, 
  PhoneIcon, 
  LockClosedIcon, 
  ArrowRightIcon, 
  ShieldCheckIcon, 
  CakeIcon, 
  UserIcon, 
  SparklesIcon,
  CheckCircleIcon,
  KeyIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

export const LoginPage: React.FC = () => {
  const { login, loginWithOtp, requestOtp, loginAsRole } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'password' | 'otp'>('password');
  const [identifier, setIdentifier] = useState('9876543210');
  const [password, setPassword] = useState('Owner@123');
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('123456');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(identifier, password);
      redirectAfterLogin();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await requestOtp(phone);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to dispatch OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginWithOtp(phone, otp);
      redirectAfterLogin();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP passcode.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRole = async (role: Role) => {
    setLoading(true);
    setError(null);
    try {
      await loginAsRole(role);
      if (role === 'OWNER') navigate('/owner');
      else if (role === 'COOK') navigate('/cook');
      else if (role === 'TENANT') navigate('/tenant/today');
    } catch (err: any) {
      setError('Evaluation switch failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const redirectAfterLogin = () => {
    const saved = localStorage.getItem('abode_auth');
    if (saved) {
      const auth = JSON.parse(saved);
      if (auth.role === 'OWNER' || auth.role === 'SUPER_ADMIN') {
        navigate('/owner');
      } else if (auth.role === 'COOK') {
        navigate('/cook');
      } else {
        navigate('/tenant/today');
      }
    } else {
      navigate('/owner');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Radiant Bright Gradient Meshes */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-indigo-200/50 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-violet-200/50 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-sky-100/60 rounded-full blur-[140px] pointer-events-none" />

      {/* Brand Hero Header */}
      <div className="text-center mb-8 relative z-10 animate-fade-in max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-500/25 p-4 mb-4 ring-4 ring-indigo-50">
          <BuildingOffice2Icon className="w-10 h-10" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 font-display">
          Abode Tenancy
        </h1>
        <p className="text-base text-slate-600 mt-2 font-medium leading-relaxed">
          The next-generation operating platform for PG & Hostel owners, residents, and kitchen cooks.
        </p>
      </div>

      {/* Main Bright Auth Card */}
      <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-200/60 p-6 sm:p-8 relative z-10 animate-slide-up">
        {/* Modern Segmented Tab Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 border border-slate-200">
          <button
            type="button"
            onClick={() => { setMode('password'); setError(null); }}
            className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
              mode === 'password'
                ? 'bg-white text-indigo-700 shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyIcon className="w-4 h-4" />
            <span>Password Login</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('otp'); setError(null); }}
            className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
              mode === 'otp'
                ? 'bg-white text-indigo-700 shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DevicePhoneMobileIcon className="w-4 h-4" />
            <span>Instant Phone OTP</span>
          </button>
        </div>

        {error && (
          <div className="p-4 mb-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-center gap-2.5 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {mode === 'password' ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Phone or Email</label>
              <div className="relative">
                <PhoneIcon className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-12 pr-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition font-mono font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <LockClosedIcon className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-12 pr-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-base rounded-2xl transition-all duration-200 shadow-xl shadow-indigo-600/25 flex items-center justify-center space-x-2 mt-4 active:scale-[0.98] disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </form>
        ) : (
          <form onSubmit={otpSent ? handleVerifyOtp : handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Mobile Phone Number</label>
              <div className="relative">
                <PhoneIcon className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-12 pr-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition font-mono font-medium"
                  required
                />
              </div>
            </div>

            {otpSent && (
              <div className="animate-fade-in">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Enter 6-Digit OTP (Dev Passcode: 123456)</label>
                <div className="relative">
                  <ShieldCheckIcon className="w-5 h-5 text-emerald-600 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-emerald-50 border border-emerald-400 rounded-2xl pl-12 pr-4 py-3.5 text-xl text-emerald-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 tracking-widest text-center font-bold font-mono"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base rounded-2xl transition-all duration-200 shadow-xl shadow-emerald-600/25 flex items-center justify-center space-x-2 mt-4 active:scale-[0.98] disabled:opacity-50"
            >
              <span>{loading ? 'Processing...' : otpSent ? 'Verify Passcode & Enter' : 'Send One-Time Passcode'}</span>
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </form>
        )}

        {/* 1-Click Role Switcher Demo Cards */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex items-center space-x-2 mb-3.5">
            <SparklesIcon className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">1-Click Fast Evaluation Login</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleQuickRole('OWNER')}
              className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 hover:border-indigo-500 flex flex-col items-center justify-center text-center transition-all group hover:shadow-md active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-1.5 group-hover:scale-110 transition shadow-md shadow-indigo-500/20">
                <BuildingOffice2Icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-slate-900 font-display">Owner</span>
              <span className="text-[11px] font-semibold text-slate-500">Command</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickRole('COOK')}
              className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 hover:border-amber-500 flex flex-col items-center justify-center text-center transition-all group hover:shadow-md active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-1.5 group-hover:scale-110 transition shadow-md shadow-amber-500/20">
                <CakeIcon className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-slate-900 font-display">Cook</span>
              <span className="text-[11px] font-semibold text-slate-500">Kitchen</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickRole('TENANT')}
              className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 hover:border-emerald-500 flex flex-col items-center justify-center text-center transition-all group hover:shadow-md active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-1.5 group-hover:scale-110 transition shadow-md shadow-emerald-500/20">
                <UserIcon className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-slate-900 font-display">Tenant</span>
              <span className="text-[11px] font-semibold text-slate-500">My Day</span>
            </button>
          </div>
        </div>

        {/* Public Mini Listing Link */}
        <div className="mt-6 text-center">
          <a
            href="/p/sri-sai-pg-marathahalli"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-indigo-50 border border-indigo-200"
          >
            <span>Scan Gate QR / Public PG Preview</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
