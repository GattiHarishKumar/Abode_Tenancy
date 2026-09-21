import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Phone, 
  ShieldCheck, 
  LogOut, 
  FileCheck, 
  Briefcase, 
  Mail, 
  AlertTriangle, 
  Receipt 
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { TenantProfile360 } from '../../types';

export const TenantProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TenantProfile360 | null>(null);
  const [loading, setLoading] = useState(true);

  // Vacate Modal State
  const [showVacateModal, setShowVacateModal] = useState(false);
  const [vacateNoticeSent, setVacateNoticeSent] = useState(false);

  const tenantId = user?.tenantId;

  const fetchProfile = async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const res = await api.get(`/tenants/${tenantId}/360`);
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [tenantId]);

  const handleSendVacateNotice = () => {
    setVacateNoticeSent(true);
    setShowVacateModal(false);
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-600 text-sm font-medium">Loading your profile & lease details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Profile Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left relative overflow-hidden">
        <div className="w-24 h-24 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white rounded-3xl flex items-center justify-center font-black font-display text-4xl shadow-sm shrink-0 border border-violet-400/30">
          {profile?.name?.charAt(0) || user?.fullName?.charAt(0) || 'T'}
        </div>

        <div className="space-y-2.5 flex-1 relative z-10">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <h1 className="text-2xl sm:text-4xl font-black font-display text-slate-900">{profile?.name || user?.fullName || 'Resident'}</h1>
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-4 h-4" /> KYC Verified
            </span>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-slate-600">
            <Briefcase className="w-4 h-4 text-violet-600" />
            <span>{profile?.companyOrCollege || 'Tech Professional'} • {profile?.city || 'Bangalore'}</span>
          </div>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-slate-700 justify-center sm:justify-start">
            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-semibold">
              <Phone className="w-3.5 h-3.5 text-violet-600" />
              +91 {profile?.phone || user?.phone}
            </span>
            {profile?.email && (
              <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-semibold">
                <Mail className="w-3.5 h-3.5 text-violet-600" />
                {profile.email}
              </span>
            )}
          </div>
        </div>
      </div>

      {vacateNoticeSent && (
        <div className="p-5 bg-amber-50 text-amber-900 border border-amber-200 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-sm">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
          <span>30-Day Move-out Notice active. PG owner will conduct standard room inspection and initiate security deposit settlement.</span>
        </div>
      )}

      {/* Tenancy & Room Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2.5">
            <Home className="w-5 h-5 text-violet-600" />
            <span>Room & Bed Allocation</span>
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Room Number</span>
              <div className="text-xl font-black font-display text-slate-900 mt-1">Room {profile?.roomNumber || '101'}</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Bed Slot</span>
              <div className="text-xl font-black font-display text-slate-900 mt-1">Bed {profile?.bedLabel || 'A'}</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Monthly Rent</span>
              <div className="text-xl font-black font-mono text-emerald-700 mt-1">₹{(profile?.rentAmount || 8500).toLocaleString()}</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Security Deposit</span>
              <div className="text-xl font-black font-mono text-slate-800 mt-1">₹{(profile?.depositAmount || 15000).toLocaleString()}</div>
            </div>
          </div>

          <div className="text-sm text-slate-600 pt-2 space-y-2">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span>Check-in Date</span>
              <span className="font-bold font-mono text-slate-900">{profile?.checkInDate || profile?.joiningDate || '2026-01-01'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Notice Period</span>
              <span className="font-bold text-slate-900">{profile?.noticePeriodDays || 30} Days</span>
            </div>
          </div>
        </div>

        {/* Verification & Security Info */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Emergency & Identity Info</span>
          </h2>

          <div className="space-y-3">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-sm">
              <div>
                <span className="text-slate-500 text-xs uppercase font-bold block">Emergency Contact</span>
                <span className="font-bold text-slate-900">{profile?.emergencyContactName || 'Parent / Guardian'}</span>
              </div>
              <span className="font-mono font-bold text-violet-700">{profile?.emergencyContactPhone || '+91 98765 00000'}</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-sm">
              <div>
                <span className="text-slate-500 text-xs uppercase font-bold block">Government ID Proof</span>
                <span className="font-bold text-slate-900">{profile?.idProofType || 'Aadhaar Card'}</span>
              </div>
              <span className="font-mono font-bold text-slate-500">XXXX-XXXX-4920</span>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-sm font-bold text-emerald-800">
              <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Digital Tenancy Agreement signed & securely stored on file</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setShowVacateModal(true)}
              className="w-full py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-sm font-bold transition flex items-center justify-center space-x-2 active:scale-95 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Submit 30-Day Vacating Notice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security Deposit Settlement Preview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Receipt className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold font-display text-slate-900">Security Deposit Move-Out Settlement Preview</h2>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-50 text-violet-700 border border-violet-200">
            Standard PG Policy
          </span>
        </div>

        <p className="text-sm text-slate-600">
          When you serve your 30-day notice and move out, your security deposit will be settled transparently according to this breakdown:
        </p>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-sm font-medium">
          <div className="flex justify-between text-slate-700">
            <span>Security Deposit Paid (Original)</span>
            <span className="font-bold font-mono text-slate-900">₹{(profile?.depositAmount || 15000).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-rose-700">
            <span>Standard Room Painting & Deep Cleaning</span>
            <span className="font-bold font-mono">- ₹2,000</span>
          </div>
          <div className="flex justify-between text-rose-700">
            <span>Unpaid Electricity & Rent Dues</span>
            <span className="font-bold font-mono">- ₹{(profile?.totalOutstandingBalance || 0).toLocaleString()}</span>
          </div>
          <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-black text-emerald-800">
            <span>Estimated Net Refund to your Bank / UPI:</span>
            <span className="font-mono text-xl font-bold text-emerald-700">₹{(Math.max(0, (profile?.depositAmount || 15000) - 2000 - (profile?.totalOutstandingBalance || 0))).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Vacate Notice Confirmation Modal */}
      {showVacateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200 text-slate-900">
            <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 w-fit">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-black font-display text-slate-900">Submit 30-Day Move-Out Notice?</h3>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                This initiates your 30-day notice period as per the rental agreement. The PG owner will schedule an inspection and settle your remaining security deposit upon vacating.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setShowVacateModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-sm font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendVacateNotice}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-black shadow-sm transition active:scale-95"
              >
                Confirm Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
