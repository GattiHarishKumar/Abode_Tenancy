import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  Download, 
  CheckCircle2, 
  Clock, 
  QrCode, 
  Copy, 
  Check, 
  Receipt
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { TenantProfile360 } from '../../types';

export const TenantRentPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TenantProfile360 | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedUpi, setCopiedUpi] = useState(false);

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
      console.error('Failed to load rent profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [tenantId]);

  const handleDownloadPdf = async (paymentId: string, receiptNum: string) => {
    try {
      const res = await api.get(`/rent/receipts/${paymentId}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Receipt_${receiptNum || paymentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download receipt PDF.');
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-600 font-medium text-sm">Loading rent ledger & receipts...</p>
      </div>
    );
  }

  const calculatedOutstanding = profile?.recentInvoices
    ? profile.recentInvoices
        .filter(inv => inv.status !== 'PAID')
        .reduce((acc, inv) => acc + (inv.amount - (inv.paidAmount || 0)), 0)
    : 0;
  const outstanding = profile?.totalOutstandingBalance !== undefined 
    ? profile.totalOutstandingBalance 
    : calculatedOutstanding;
  const upiId = profile?.upiId || 'srisaipg@okhdfcbank';
  const propertyName = profile?.propertyName || 'Sri Sai PG';
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(propertyName)}&am=${outstanding}&cu=INR`;

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 text-emerald-700 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 mb-3">
            <IndianRupee className="w-3.5 h-3.5" />
            <span>Billing & Invoicing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">Rent Ledger & Tax Receipts</h1>
          <p className="text-base text-slate-600 mt-1 max-w-xl">
            Track your monthly dues, make instant UPI payments with QR codes, and download certified rent receipts.
          </p>
        </div>
      </div>

      {/* Due Banner & Payment Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">Current Outstanding Balance</span>
            <div className="text-4xl sm:text-5xl font-black font-mono text-slate-900 mt-2 flex items-baseline gap-2">
              <span>₹{outstanding.toLocaleString()}</span>
              {outstanding === 0 && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  All Cleared
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Your monthly rent includes your room stay, 300 Mbps high-speed WiFi, 3 daily home-cooked meals, daily housekeeping, and electricity maintenance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Monthly Base Rent</span>
              <div className="text-lg font-black font-mono text-slate-900 mt-1">₹{(profile?.rentAmount || 8500).toLocaleString()}</div>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Security Deposit</span>
              <div className="text-lg font-black font-mono text-slate-900 mt-1">₹{(profile?.depositAmount || 15000).toLocaleString()}</div>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Billing Cycle</span>
              <div className="text-lg font-black text-emerald-700 mt-1">5th of every month</div>
            </div>
          </div>

          {outstanding > 0 ? (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-sm font-bold text-amber-900">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Payment due for current billing period</span>
              </div>
              <span className="text-xs font-black uppercase tracking-wider px-4 py-1.5 bg-amber-500 text-slate-950 rounded-xl shadow-sm text-center">
                Pay Before 5th
              </span>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3 text-sm font-bold text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Great news! You have zero outstanding dues for this cycle.</span>
            </div>
          )}
        </div>

        {/* Instant UPI Payment Box */}
        <div className="bg-slate-50 rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center space-y-4 relative overflow-hidden">
          <div className="bg-white p-4 rounded-2xl shadow-sm inline-block border border-slate-200">
            <QRCodeSVG value={upiUri} size={160} level="M" />
          </div>

          <div>
            <div className="text-xs font-black uppercase tracking-wider text-violet-700 flex items-center justify-center gap-1.5">
              <QrCode className="w-4 h-4" /> Instant Scan & Pay
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Scan with Google Pay, PhonePe, Paytm, or BHIM</p>
          </div>

          <button
            onClick={copyUpiId}
            className="w-full flex items-center justify-between text-xs font-mono bg-white px-4 py-3 rounded-xl text-slate-700 border border-slate-200 hover:bg-slate-100 transition shadow-sm"
          >
            <span className="truncate font-semibold">{upiId}</span>
            <span className="text-xs text-violet-700 font-bold ml-2 shrink-0 flex items-center gap-1">
              {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedUpi ? 'Copied' : 'Copy'}
            </span>
          </button>
        </div>
      </div>

      {/* Payment Receipts History */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2.5">
            <Receipt className="w-5 h-5 text-violet-600" />
            <span>Payment History & Tax Receipts</span>
          </h2>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            PDF Invoices Available
          </span>
        </div>

        {(!profile?.recentInvoices || profile.recentInvoices.length === 0) ? (
          <div className="py-14 text-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-sm font-medium">
            No payments recorded yet. Future paid invoices will appear here with downloadable receipts.
          </div>
        ) : (
          <div className="space-y-3">
            {profile.recentInvoices.map((inv) => (
              <div
                key={inv.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-violet-700">#{inv.invoiceNumber || inv.id.slice(0, 8)}</span>
                    <span className={`px-2.5 py-0.5 text-xs font-black uppercase rounded-full ${
                      inv.status === 'PAID' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                  <div className="text-base font-bold text-slate-900 font-mono">
                    ₹{inv.amount?.toLocaleString()} <span className="text-slate-500 font-sans font-normal text-sm">• {inv.billingMonth || 'Current Billing Cycle'}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-2 sm:pt-0">
                  <button
                    onClick={() => handleDownloadPdf(inv.id, inv.invoiceNumber || inv.id)}
                    className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition flex items-center space-x-2 border border-slate-200 shadow-sm active:scale-95"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>Download PDF Receipt</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
