import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  CurrencyRupeeIcon, 
  CakeIcon, 
  WrenchScrewdriverIcon, 
  DocumentTextIcon, 
  ArrowTrendingUpIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  ArrowRightIcon,
  BellAlertIcon,
  ShieldCheckIcon,
  FireIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { OwnerDashboardData } from '../../types';

export const OwnerDashboard: React.FC = () => {
  const { propertyId, authData } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<OwnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!propertyId) return;
      try {
        setLoading(true);
        const res = await api.get(`/operations/dashboard/${propertyId}`);
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load owner dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto shadow-md" />
          <p className="text-base font-bold text-slate-700 font-display">Syncing Live Command Center...</p>
        </div>
      </div>
    );
  }

  const occupancyRate = data?.occupancyRate || 85.0;
  const pendingRent = data?.pendingRent || 47500;
  const openComplaints = data?.openComplaintsCount || 2;
  const pendingApps = data?.pendingApplicationsCount || 2;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in font-sans">
      {/* Top Welcome Hero Mission Control Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-indigo-100 bg-white/15 px-3 py-1 rounded-full backdrop-blur-md">
              <SparklesIcon className="w-4 h-4 text-amber-300" />
              <span>Executive Operations Matrix</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-display">
              {data?.propertyName || authData?.propertyName || 'Sri Sai PG for Men'}
            </h1>
            <p className="text-base text-indigo-100 font-medium leading-relaxed">
              {data?.city || 'Bengaluru'} • Real-time occupancy control, automated rent collections & automated kitchen operations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <button
              onClick={() => navigate('/owner/rent')}
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-emerald-900/20 flex items-center space-x-2 transition active:scale-95"
            >
              <CurrencyRupeeIcon className="w-5 h-5" />
              <span>Record Rent</span>
            </button>
            <button
              onClick={() => navigate('/owner/tenants')}
              className="px-6 py-3.5 bg-white hover:bg-indigo-50 text-indigo-900 font-black text-sm rounded-2xl shadow-lg flex items-center space-x-2 transition active:scale-95"
            >
              <UserGroupIcon className="w-5 h-5" />
              <span>Onboard Tenant</span>
            </button>
          </div>
        </div>
        <div className="absolute right-[-40px] top-[-40px] w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Main Multi-Color KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Occupancy */}
        <div 
          onClick={() => navigate('/owner/rooms')}
          className="bg-white border border-slate-200/90 hover:border-indigo-500 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer group hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">Total Occupancy</span>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition shadow-sm">
              <BuildingOfficeIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="text-4xl font-black text-slate-900 font-display tabular-nums">
            {occupancyRate.toFixed(1)}%
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full mt-4 overflow-hidden border border-slate-200">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-violet-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-slate-600 mt-3 font-semibold">
            <span>{data?.occupiedBeds || 38} Occupied</span>
            <span className="text-emerald-600 font-black bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">{data?.availableBeds || 6} Free</span>
          </div>
        </div>

        {/* Card 2: Pending Rent */}
        <div 
          onClick={() => navigate('/owner/rent')}
          className="bg-white border border-slate-200/90 hover:border-emerald-500 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer group hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">Pending Rent</span>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition shadow-sm">
              <CurrencyRupeeIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="text-4xl font-black text-emerald-600 font-display tabular-nums">
            ₹{pendingRent.toLocaleString()}
          </div>
          <p className="text-xs text-slate-600 mt-4 font-semibold">
            <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">{data?.pendingRentCount || 5} residents</span> overdue
          </p>
          <div className="mt-3 text-xs text-emerald-700 font-bold flex items-center gap-1">
            <span>Open collections ledger →</span>
          </div>
        </div>

        {/* Card 3: Kitchen Live Headcount */}
        <div 
          onClick={() => navigate('/owner/food')}
          className="bg-white border border-slate-200/90 hover:border-amber-500 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer group hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">Dinner Headcount</span>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition shadow-sm">
              <CakeIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="text-4xl font-black text-amber-600 font-display tabular-nums">
            {data?.dinner?.confirmed || 34} <span className="text-xl font-normal text-slate-400">/ {data?.totalTenants || 42}</span>
          </div>
          <p className="text-xs text-slate-600 mt-4 font-semibold">
            Status: <span className="text-amber-700 font-extrabold uppercase bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">{data?.dinner?.prepStatus || 'COOKING'}</span>
          </p>
          <div className="mt-3 text-xs text-amber-700 font-bold flex items-center gap-1">
            <span>Kitchen control board →</span>
          </div>
        </div>

        {/* Card 4: Open Maintenance */}
        <div 
          onClick={() => navigate('/owner/complaints')}
          className="bg-white border border-slate-200/90 hover:border-rose-500 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer group hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">Open Tickets</span>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 group-hover:scale-110 transition shadow-sm">
              <WrenchScrewdriverIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="text-4xl font-black text-slate-900 font-display tabular-nums">
            {openComplaints}
          </div>
          <p className="text-xs text-slate-600 mt-4 font-semibold">
            <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">{pendingApps} pending join requests</span>
          </p>
          <div className="mt-3 text-xs text-rose-700 font-bold flex items-center gap-1">
            <span>View maintenance SLA →</span>
          </div>
        </div>
      </div>

      {/* Action Center & Daily Operational Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left 2 Cols: Action Required Today */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center space-x-2.5">
              <BellAlertIcon className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-bold text-slate-900 font-display">Attention Required Today</h2>
            </div>
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">Live Queue</span>
          </div>

          <div className="space-y-3.5">
            <div 
              onClick={() => navigate('/owner/rent')}
              className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200 hover:border-amber-400 flex items-center justify-between transition cursor-pointer group hover:bg-amber-50"
            >
              <div className="flex items-center space-x-4">
                <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
                  <CurrencyRupeeIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-800 transition font-display">
                    5 Rent Payments Pending Collection
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">₹47,500 due for billing cycle. 1-Click WhatsApp payment reminders ready.</p>
                </div>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition shrink-0 ml-2" />
            </div>

            <div 
              onClick={() => navigate('/owner/applications')}
              className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200 hover:border-indigo-400 flex items-center justify-between transition cursor-pointer group hover:bg-indigo-50"
            >
              <div className="flex items-center space-x-4">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                  <DocumentTextIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-800 transition font-display">
                    2 Inbound Prospective Tenant Applications
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">Aditya Verma (2-Sharing) & Ganesh Hegde (3-Sharing) requested beds.</p>
                </div>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition shrink-0 ml-2" />
            </div>

            <div 
              onClick={() => navigate('/owner/rooms')}
              className="p-4 sm:p-5 rounded-2xl bg-purple-50/60 border border-purple-200 hover:border-purple-400 flex items-center justify-between transition cursor-pointer group hover:bg-purple-50"
            >
              <div className="flex items-center space-x-4">
                <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                  <ClockIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-800 transition font-display">
                    1 Bed Vacating Soon (30-Day Notice Period)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">Kiran Rao vacating Room 201 (Bed A) in 8 days. Ready for pre-booking.</p>
                </div>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition shrink-0 ml-2" />
            </div>

            <div 
              onClick={() => navigate('/owner/complaints')}
              className="p-4 sm:p-5 rounded-2xl bg-rose-50/60 border border-rose-200 hover:border-rose-400 flex items-center justify-between transition cursor-pointer group hover:bg-rose-50"
            >
              <div className="flex items-center space-x-4">
                <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                  <WrenchScrewdriverIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-800 transition font-display">
                    Plumbing Leak Ticket in Room 204
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">Washbasin tap leakage. 1-Click Dispatch via WhatsApp available.</p>
                </div>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition shrink-0 ml-2" />
            </div>
          </div>
        </div>

        {/* Right Col: Quick Shortcuts & Live Operations Matrix */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-5 flex flex-col justify-between shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-display mb-4">
              <SparklesIcon className="w-5 h-5 text-emerald-600" />
              <span>Workspace Shortcuts</span>
            </h2>

            <div className="grid grid-cols-2 gap-3.5">
              <button
                onClick={() => navigate('/owner/rooms')}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 text-left transition space-y-1.5 group active:scale-95"
              >
                <BuildingOfficeIcon className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition" />
                <div className="text-sm font-bold text-slate-900 font-display">Room Matrix</div>
                <div className="text-xs text-slate-500">18 Rooms • 44 Beds</div>
              </button>

              <button
                onClick={() => navigate('/owner/tenants')}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 text-left transition space-y-1.5 group active:scale-95"
              >
                <UserGroupIcon className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition" />
                <div className="text-sm font-bold text-slate-900 font-display">Tenants 360°</div>
                <div className="text-xs text-slate-500">38 Active • KYC</div>
              </button>

              <button
                onClick={() => navigate('/owner/food')}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200 hover:border-amber-300 text-left transition space-y-1.5 group active:scale-95"
              >
                <CakeIcon className="w-6 h-6 text-amber-600 group-hover:scale-110 transition" />
                <div className="text-sm font-bold text-slate-900 font-display">Meal Menu</div>
                <div className="text-xs text-slate-500">Weekly Planner</div>
              </button>

              <button
                onClick={() => navigate('/owner/qr')}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-cyan-50/70 border border-slate-200 hover:border-cyan-300 text-left transition space-y-1.5 group active:scale-95"
              >
                <DocumentTextIcon className="w-6 h-6 text-cyan-600 group-hover:scale-110 transition" />
                <div className="text-sm font-bold text-slate-900 font-display">Print Flyer</div>
                <div className="text-xs text-slate-500">Gate QR Check-in</div>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 mt-4">
            <div className="text-slate-500 font-black uppercase tracking-wider text-xs">Today's Dinner Menu</div>
            <div className="text-slate-900 font-bold text-sm line-clamp-2">
              Hot Phulka Rotis (unlimited), Paneer Butter Masala, Jeera Rice, Dal Fry, Salad
            </div>
            <div className="text-emerald-700 font-mono text-xs font-bold">Service: 7:30 PM - 9:30 PM</div>
          </div>
        </div>
      </div>
    </div>
  );
};
