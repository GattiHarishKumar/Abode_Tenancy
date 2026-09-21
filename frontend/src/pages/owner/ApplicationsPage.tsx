import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApplicationSummary } from '../../types';
import api from '../../api/client';
import { 
  FileText, 
  Phone, 
  MessageSquare, 
  Check, 
  X, 
  UserCheck, 
  Briefcase, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ApplicationsPage: React.FC = () => {
  const { propertyId } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState<ApplicationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  useEffect(() => {
    fetchApplications();
  }, [propertyId, filter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      if (propertyId) {
        const query = filter !== 'ALL' ? `?status=${filter}` : '';
        const res = await api.get(`/applications/property/${propertyId}${query}`);
        if (res.data.success) {
          setApps(res.data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching applications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await api.put(`/applications/${appId}/status`, { status });
      if (res.data.success) {
        fetchApplications();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update application');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-amber-50 text-amber-800 border border-amber-200 shadow-sm">
            Pending Review
          </span>
        );
      case 'APPROVED':
        return (
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
            Approved
          </span>
        );
      case 'ONBOARDED':
        return (
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-sky-50 text-sky-700 border border-sky-200 shadow-sm">
            Onboarded
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
            Rejected
          </span>
        );
      default:
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 text-violet-700 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-violet-50 border border-violet-200 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Inbound QR Leads & Walk-ins</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">Prospective Applications</h1>
          <p className="text-base text-slate-600 mt-1 max-w-xl">
            Review QR inquiries, verify candidate details, and effortlessly onboard approved leads into vacant beds.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="relative z-10 flex bg-slate-100 border border-slate-200 p-1.5 rounded-2xl">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                filter === tab 
                  ? 'bg-violet-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-24 text-center">
            <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-600 font-medium text-sm">Loading applications...</p>
          </div>
        ) : apps.length === 0 ? (
          <div className="col-span-full py-20 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-violet-50 border border-violet-200 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-violet-600" />
            </div>
            <h3 className="text-xl font-bold font-display text-slate-900">No Applications Found</h3>
            <p className="text-base text-slate-600 mt-2 max-w-md mx-auto">
              Display your Gate QR Code flyer to let prospective tenants scan and apply instantly online.
            </p>
            <button
              onClick={() => navigate('/owner/qr-flyer')}
              className="mt-6 px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all shadow-sm"
            >
              View Gate QR Flyer
            </button>
          </div>
        ) : (
          apps.map((app) => (
            <div
              key={app.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between space-y-5 shadow-sm"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold font-display text-slate-900 text-xl">{app.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-slate-600 mt-1">
                      <Briefcase className="w-4 h-4 text-violet-600 shrink-0" />
                      <span className="truncate">{app.occupation || 'Professional'} • {app.companyOrCollege || 'Tech Park'}</span>
                    </div>
                  </div>
                  {getStatusBadge(app.status)}
                </div>

                {/* Sharing Preference & Move-in */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Sharing Pref</span>
                    <span className="font-bold text-slate-900 mt-1 block">{app.preferredSharing || '2 Sharing'}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Move-in Date</span>
                    <span className="font-bold font-mono text-slate-900 mt-1 block">
                      {app.expectedMoveInDate ? new Date(app.expectedMoveInDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Immediate'}
                    </span>
                  </div>
                </div>

                {/* Dietary preference */}
                <div className="flex items-center justify-between text-sm px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-600 font-medium">Dietary Choice:</span>
                  <span className={`font-bold px-3 py-1 rounded-lg text-xs ${
                    app.dietaryPreference === 'NON_VEG' 
                      ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {app.dietaryPreference || 'VEG'}
                  </span>
                </div>

                {/* Phone & Contact Triggers */}
                <div className="pt-2 flex items-center gap-2">
                  <a
                    href={`tel:${app.phone}`}
                    className="flex-1 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-sm font-bold font-mono transition border border-slate-200 flex items-center justify-center space-x-2"
                  >
                    <Phone className="w-4 h-4 text-violet-600" />
                    <span>+91 {app.phone}</span>
                  </a>
                  <a
                    href={`https://wa.me/91${app.phone}?text=Hi%20${encodeURIComponent(app.name)},%20regarding%20your%20application%20for%20our%20PG...`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition flex items-center justify-center shadow-sm"
                    title="Chat on WhatsApp"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100">
                {app.status === 'PENDING' && (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'APPROVED')}
                      className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-black transition flex items-center justify-center space-x-1.5 shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Lead</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                      className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-sm font-bold transition border border-slate-200 flex items-center justify-center"
                      title="Reject Lead"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {app.status === 'APPROVED' && (
                  <button
                    onClick={() => navigate('/owner/tenants')}
                    className="w-full py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-black transition flex items-center justify-center space-x-2 shadow-sm"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Onboard to Room / Bed</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                )}

                {app.status === 'ONBOARDED' && (
                  <div className="w-full py-3 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200 text-sm font-bold text-center flex items-center justify-center space-x-2">
                    <Check className="w-4 h-4" />
                    <span>Active Tenant in PG</span>
                  </div>
                )}

                {app.status === 'REJECTED' && (
                  <div className="w-full py-3 rounded-2xl bg-slate-50 text-slate-500 border border-slate-200 text-sm font-bold text-center">
                    Application Rejected
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
