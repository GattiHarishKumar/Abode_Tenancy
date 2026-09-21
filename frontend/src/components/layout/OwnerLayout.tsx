import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  CurrencyRupeeIcon, 
  CakeIcon, 
  WrenchScrewdriverIcon, 
  DocumentTextIcon, 
  QrCodeIcon, 
  ArrowRightOnRectangleIcon, 
  Squares2X2Icon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

export const OwnerLayout: React.FC = () => {
  const { user, authData, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/owner', label: 'Command Center', icon: Squares2X2Icon, end: true, badge: 'Live', badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { to: '/owner/rooms', label: 'Room Matrix', icon: BuildingOfficeIcon, end: false },
    { to: '/owner/tenants', label: 'Tenants 360°', icon: UserGroupIcon, end: false },
    { to: '/owner/rent', label: 'Rent Ledger', icon: CurrencyRupeeIcon, end: false, badge: 'Dues', badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200' },
    { to: '/owner/food', label: 'Food Command', icon: CakeIcon, end: false },
    { to: '/owner/complaints', label: 'Maintenance Helpdesk', icon: WrenchScrewdriverIcon, end: false },
    { to: '/owner/applications', label: 'Inbound Requests', icon: DocumentTextIcon, end: false, badge: 'New', badgeStyle: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { to: '/owner/qr', label: 'Gate QR & Flyer', icon: QrCodeIcon, end: false },
  ];

  const getPageTitle = () => {
    const current = navItems.find(item => item.end ? location.pathname === item.to : location.pathname.startsWith(item.to));
    return current ? current.label : 'Executive Command Center';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row antialiased font-sans selection:bg-indigo-500 selection:text-white">
      {/* Mobile Top Navigation Header */}
      <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center font-black text-white shadow-md shadow-indigo-500/20 p-2">
            <BuildingOfficeIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="font-black text-base text-slate-900 tracking-tight block font-display">Abode Tenancy</span>
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {authData?.propertyName || 'Sri Sai PG'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/p/sri-sai-pg-marathahalli')}
            className="p-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-indigo-600 hover:text-indigo-800 transition"
            title="Public Gate QR"
          >
            <QrCodeIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition"
          >
            {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu / Slide Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[65px] bottom-0 bg-white/98 backdrop-blur-2xl z-30 p-5 overflow-y-auto space-y-4 animate-fade-in border-b border-slate-200 shadow-xl">
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-base font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-black'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${item.badgeStyle}`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          <div className="pt-5 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-base font-display">
                {user?.fullName?.charAt(0) || 'O'}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 font-display">{user?.fullName || 'Property Owner'}</p>
                <p className="text-xs text-slate-500 font-mono">{user?.phone}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center space-x-1.5 active:scale-95 hover:bg-rose-100"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Permanent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white border-r border-slate-200 shrink-0 sticky top-0 h-screen overflow-y-auto scrollbar-none select-none z-20 shadow-sm">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-500/20">
              <BuildingOfficeIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-lg text-slate-900 tracking-tight flex items-center gap-1.5 font-display">
                Abode Tenancy
              </h1>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-slate-600 font-bold truncate max-w-[140px]">
                  {authData?.propertyName || 'Sri Sai PG'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Item List */}
        <div className="p-4 flex-1 space-y-1.5">
          <div className="px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-400">
            Workspace Hub
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-black'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${item.badgeStyle}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70">
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-sm text-white shadow-sm font-display">
                {user?.fullName?.charAt(0) || 'O'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 truncate font-display">{user?.fullName || 'Owner'}</p>
                <p className="text-xs text-slate-500 font-mono truncate">{user?.phone}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Command Center Stage */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen bg-slate-50">
        {/* Top Header Bar */}
        <header className="hidden md:flex h-18 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-6 lg:px-8 items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center space-x-3.5">
            <h2 className="text-xl font-black text-slate-900 tracking-tight font-display">{getPageTitle()}</h2>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold flex items-center gap-1.5">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
              <span>Property OS Active</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/p/sri-sai-pg-marathahalli')}
              className="px-4 py-2 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold text-indigo-700 flex items-center space-x-2 transition shadow-sm active:scale-95"
            >
              <QrCodeIcon className="w-4 h-4 text-indigo-600" />
              <span>Public Gate QR Flyer</span>
            </button>
          </div>
        </header>

        {/* Dynamic Route View */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
