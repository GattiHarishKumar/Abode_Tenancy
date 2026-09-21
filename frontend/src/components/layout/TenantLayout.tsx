import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  CalendarDaysIcon, 
  CakeIcon, 
  CurrencyRupeeIcon, 
  WrenchScrewdriverIcon, 
  UserIcon, 
  HomeModernIcon, 
  ArrowRightOnRectangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

export const TenantLayout: React.FC = () => {
  const { user, authData, logout } = useAuth();

  const navItems = [
    { to: '/tenant/today', label: 'My Day', icon: CalendarDaysIcon },
    { to: '/tenant/meals', label: 'Dining', icon: CakeIcon },
    { to: '/tenant/rent', label: 'Rent Dues', icon: CurrencyRupeeIcon },
    { to: '/tenant/issues', label: 'Helpdesk', icon: WrenchScrewdriverIcon },
    { to: '/tenant/profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pb-24 md:pb-10 antialiased font-sans selection:bg-violet-500 selection:text-white">
      {/* Top Header */}
      <header className="h-18 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 flex items-center justify-center font-black text-white shadow-md shadow-violet-500/20">
            <HomeModernIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-base sm:text-lg text-slate-900 tracking-tight font-display">
              {authData?.propertyName || 'Sri Sai PG'}
            </h1>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs text-emerald-600 font-bold">Resident Living Hub</p>
            </div>
          </div>
        </div>

        {/* Desktop Tabs & User Controls */}
        <div className="flex items-center space-x-3">
          {/* Desktop inline navigation */}
          <nav className="hidden md:flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150 ${
                      isActive
                        ? 'bg-white text-indigo-700 shadow-sm font-black'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <button
            onClick={logout}
            className="p-2.5 rounded-2xl bg-slate-100 border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-600 transition-colors"
            title="Sign Out"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Responsive Screen Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
        <Outlet />
      </main>

      {/* Mobile-First Floating Bottom Bar */}
      <nav className="md:hidden fixed bottom-3 inset-x-3 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-3xl p-2 flex justify-around items-center z-40 shadow-xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/20 scale-105'
                    : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[11px] font-bold tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
