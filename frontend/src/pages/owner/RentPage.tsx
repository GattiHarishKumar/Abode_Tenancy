import React, { useState, useEffect } from 'react';
import { 
  CurrencyRupeeIcon, 
  ArrowDownTrayIcon, 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { MessageSquare } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { RentDashboardSummary, RentSummaryItem } from '../../types';

export const RentPage: React.FC = () => {
  const { propertyId } = useAuth();
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [dashboard, setDashboard] = useState<RentDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Record Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<RentSummaryItem | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMode: 'UPI',
    referenceNumber: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchRentData = async () => {
    if (!propertyId) return;
    try {
      setLoading(true);
      const res = await api.get(`/rent/dashboard/${propertyId}?monthYear=${currentMonth}`);
      if (res.data.success) {
        setDashboard(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load rent dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentData();
  }, [propertyId, currentMonth]);

  const handleGenerateInvoices = async () => {
    if (!propertyId) return;
    try {
      setIsGenerating(true);
      const res = await api.post('/rent/invoices/generate', {
        propertyId,
        monthYear: currentMonth,
        dueDay: 5
      });
      if (res.data.success) {
        setNotification({ type: 'success', message: `Invoices generated successfully for ${currentMonth}!` });
        fetchRentData();
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to generate invoices' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenPayment = (item: RentSummaryItem) => {
    setSelectedInvoice(item);
    setPaymentForm({
      amount: String(item.balanceAmount > 0 ? item.balanceAmount : item.totalAmount),
      paymentMode: 'UPI',
      referenceNumber: '',
      notes: ''
    });
    setShowPaymentModal(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      setIsSubmitting(true);
      const res = await api.post('/rent/payments/offline', {
        invoiceId: selectedInvoice.invoiceId,
        amount: parseFloat(paymentForm.amount),
        paymentMode: paymentForm.paymentMode,
        referenceNumber: paymentForm.referenceNumber,
        notes: paymentForm.notes
      });
      if (res.data.success) {
        setNotification({ type: 'success', message: 'Payment recorded and digital receipt issued!' });
        setShowPaymentModal(false);
        fetchRentData();
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to record payment' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPdf = async (paymentId: string, receiptNum: string) => {
    try {
      const response = await api.get(`/rent/receipts/${paymentId}/pdf`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Receipt_${receiptNum || paymentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download PDF receipt. Ensure payment is recorded.');
    }
  };

  const filteredItems = (dashboard?.items || []).filter(item => {
    const matchesSearch = item.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 animate-fade-in font-sans">
      {/* Top Header & Month Controls */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 text-xs font-black uppercase tracking-wider mb-1.5">
            <CurrencyRupeeIcon className="w-4 h-4" />
            <span>Financial Operations Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
            Rent & Payment Ledger
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Automated monthly invoicing, offline cash/UPI payment collection, and tax receipts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <input 
            type="month" 
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 font-mono"
          />
          <button
            onClick={handleGenerateInvoices}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-sm font-extrabold shadow-md shadow-emerald-600/20 transition disabled:opacity-50 active:scale-95"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>{isGenerating ? 'Generating...' : 'Batch Generate'}</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-2xl text-sm font-bold flex items-center justify-between animate-fade-in ${
          notification.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="p-1 text-slate-400 hover:text-slate-600">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* 4 Multi-Color Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">Total Expected</span>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-2 font-display tabular-nums">
            ₹{(dashboard?.totalExpected || 0).toLocaleString()}
          </div>
          <span className="text-xs text-slate-500 mt-2 block font-medium">Month of {dashboard?.monthYear || currentMonth}</span>
        </div>

        <div className="bg-white border border-emerald-200 rounded-3xl p-6 shadow-sm">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-700">Total Collected</span>
          <div className="text-3xl sm:text-4xl font-black text-emerald-600 mt-2 font-display tabular-nums">
            ₹{(dashboard?.totalCollected || 0).toLocaleString()}
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full mt-3 overflow-hidden border border-slate-200">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(dashboard?.collectionRate || 0, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-amber-200 rounded-3xl p-6 shadow-sm">
          <span className="text-xs font-black uppercase tracking-wider text-amber-700">Pending Dues</span>
          <div className="text-3xl sm:text-4xl font-black text-amber-600 mt-2 font-display tabular-nums">
            ₹{(dashboard?.totalPending || 0).toLocaleString()}
          </div>
          <span className="text-xs text-amber-700 mt-2 block font-medium">Awaiting collections</span>
        </div>

        <div className="bg-white border border-indigo-200 rounded-3xl p-6 shadow-sm">
          <span className="text-xs font-black uppercase tracking-wider text-indigo-700">Collection Rate</span>
          <div className="text-3xl sm:text-4xl font-black text-indigo-600 mt-2 font-display tabular-nums">
            {dashboard?.collectionRate?.toFixed(1) || 0}%
          </div>
          <span className="text-xs text-slate-500 mt-2 block font-medium">Target: 100% by 5th</span>
        </div>
      </div>

      {/* Filter & Table / Cards Container */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/70">
          <div className="relative w-full sm:w-80">
            <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input 
              type="text"
              placeholder="Search tenant, room, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 font-medium"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto text-xs">
            <span className="text-slate-500 font-bold hidden sm:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none cursor-pointer focus:border-indigo-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="PAID">Paid</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PENDING">Pending</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 text-sm font-medium">Loading rent ledger records...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <CurrencyRupeeIcon className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <p className="font-bold text-base text-slate-800">No invoice records found for this month.</p>
            <p className="text-xs text-slate-500 mt-1">Click "Batch Generate" above to initialize monthly rent records.</p>
          </div>
        ) : (
          <div>
            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <div key={item.invoiceId} className="p-5 space-y-3.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 font-display">{item.tenantName}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">Room {item.roomNumber} ({item.bedLabel}) • {item.phone}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${
                      item.status === 'PAID'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div>Due: <b className="text-slate-900 font-mono block mt-0.5">₹{item.totalAmount.toLocaleString()}</b></div>
                    <div>Paid: <b className="text-emerald-600 font-mono block mt-0.5">₹{item.paidAmount.toLocaleString()}</b></div>
                    <div>Bal: <b className="text-rose-600 font-mono block mt-0.5">₹{item.balanceAmount.toLocaleString()}</b></div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    {item.balanceAmount > 0 && (
                      <button
                        onClick={() => {
                          const upiId = 'harish.pg@okhdfcbank';
                          const text = `Hi ${item.tenantName}, this is a reminder from Sri Sai PG. Your rent of ₹${item.balanceAmount || item.totalAmount} for Room ${item.roomNumber} (${item.bedLabel}) is pending for ${currentMonth}. Kindly pay via UPI: ${upiId} and share the confirmation receipt. Thank you!`;
                          window.open(`https://wa.me/91${item.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
                        }}
                        className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition active:scale-95"
                        title="Send WhatsApp Reminder"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp Reminder</span>
                      </button>
                    )}
                    {item.balanceAmount > 0 ? (
                      <button
                        onClick={() => handleOpenPayment(item)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md active:scale-95"
                      >
                        Record Payment
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDownloadPdf(item.invoiceId, item.roomNumber)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-200"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" /> Receipt PDF
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-4 px-6 font-bold">Tenant Details</th>
                    <th className="py-4 px-6 font-bold">Room & Bed</th>
                    <th className="py-4 px-6 font-bold">Total Invoiced</th>
                    <th className="py-4 px-6 font-bold">Amount Paid</th>
                    <th className="py-4 px-6 font-bold">Outstanding Balance</th>
                    <th className="py-4 px-6 font-bold">Status</th>
                    <th className="py-4 px-6 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => (
                    <tr key={item.invoiceId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 text-base font-display">{item.tenantName}</div>
                        <div className="text-slate-500 font-mono text-xs mt-0.5">{item.phone}</div>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900 font-display">
                        Room {item.roomNumber}
                        <span className="ml-2 text-xs font-normal text-slate-500 font-sans">({item.bedLabel})</span>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900 font-mono text-base">
                        ₹{item.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 font-bold text-emerald-600 font-mono text-base">
                        ₹{item.paidAmount.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 font-bold text-rose-600 font-mono text-base">
                        ₹{item.balanceAmount.toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${
                          item.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          {item.balanceAmount > 0 && (
                            <button
                              onClick={() => {
                                const upiId = 'harish.pg@okhdfcbank';
                                const text = `Hi ${item.tenantName}, this is a reminder from Sri Sai PG. Your rent of ₹${item.balanceAmount || item.totalAmount} for Room ${item.roomNumber} (${item.bedLabel}) is pending for ${currentMonth}. Kindly pay via UPI: ${upiId} and share the confirmation receipt. Thank you!`;
                                window.open(`https://wa.me/91${item.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
                              }}
                              className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold transition flex items-center gap-1.5 text-xs active:scale-95"
                              title="Send WhatsApp payment reminder"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </button>
                          )}
                          {item.balanceAmount > 0 ? (
                            <button
                              onClick={() => handleOpenPayment(item)}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition active:scale-95"
                            >
                              Record Payment
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDownloadPdf(item.invoiceId, item.roomNumber)}
                              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition flex items-center gap-1.5 text-xs border border-slate-200"
                            >
                              <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                              <span>PDF Receipt</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200 text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-xl font-black font-display text-slate-900">Record Offline Payment</h3>
                <p className="text-xs text-slate-500">{selectedInvoice.tenantName} • Room {selectedInvoice.roomNumber}</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-xl">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Payment Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3.5 text-lg font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Payment Method</label>
                <select
                  value={paymentForm.paymentMode}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3.5 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
                >
                  <option value="UPI">UPI (GooglePay / PhonePe / Paytm)</option>
                  <option value="CASH">Cash in Hand</option>
                  <option value="BANK_TRANSFER">Bank IMPS / NEFT Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">UPI / Bank Reference Number</label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref 402910482019"
                  value={paymentForm.referenceNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Received via GPay from father"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs shadow-md shadow-emerald-600/20 transition disabled:opacity-50 active:scale-95"
                >
                  {isSubmitting ? 'Recording...' : 'Generate Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
