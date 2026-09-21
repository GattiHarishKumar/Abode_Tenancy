import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { 
  FireIcon, 
  LanguageIcon, 
  ArrowRightOnRectangleIcon, 
  SparklesIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

export const CookLayout: React.FC = () => {
  const { authData, logout } = useAuth();
  const [lang, setLang] = useState('en');

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased font-sans selection:bg-amber-400 selection:text-black">
      {/* High-Visibility Industrial Cook Top Bar */}
      <header className="h-22 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-md sticky top-0 z-30 border-b-4 border-amber-600">
        <div className="flex items-center space-x-3.5">
          <div className="w-14 h-14 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center font-black shadow-lg">
            <FireIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-black text-2xl sm:text-3xl tracking-tight text-slate-950 font-display">
              {lang === 'te' ? 'వంటగది బోర్డు' : lang === 'kn' ? 'ಅಡುಗೆ ಮನೆ' : lang === 'hi' ? 'रसोई डैशबोर्ड' : 'KITCHEN DISPLAY'}
            </h1>
            <p className="text-sm font-extrabold text-slate-900 tracking-wide">{authData?.propertyName || 'Sri Sai PG Kitchen'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Multi-Language Switcher */}
          <div className="flex items-center space-x-2 bg-white text-slate-900 px-4 py-2.5 rounded-2xl border-2 border-amber-600/30 shadow-md">
            <LanguageIcon className="w-5 h-5 text-amber-600 shrink-0" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent text-sm font-black text-slate-900 outline-none cursor-pointer font-sans"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code} className="bg-white text-slate-900 font-bold">
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={logout}
            className="p-3 rounded-2xl bg-slate-950 text-amber-400 font-extrabold hover:bg-slate-800 transition flex items-center space-x-1.5 shadow-md active:scale-95"
            title="Sign Out"
          >
            <ArrowRightOnRectangleIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main High-Contrast Kitchen View */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
        <Outlet context={{ lang }} />
      </main>
    </div>
  );
};
