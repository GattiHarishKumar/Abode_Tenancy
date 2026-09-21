import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  RefreshCw, 
  LogOut, 
  ShieldCheck, 
  X, 
  FileText, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  MessageSquare,
  Calculator,
  IndianRupee,
  Check,
  AlertTriangle,
  UserPlus
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { TenantSummary, Tenant360, RoomSummary, SettlementResponse } from '../../types';

export const TenantsPage: React.FC = () => {
  const { propertyId } = useAuth();
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected Tenant 360 Drawer
  const [selectedTenant360, setSelectedTenant360] = useState<Tenant360 | null>(null);
  const [loading360, setLoading360] = useState(false);

  // Transfer Modal
  const [transferTenant, setTransferTenant] = useState<TenantSummary | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedBedId, setSelectedBedId] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  // Deposit Settlement & Move-Out Modal
  const [settlementTenant, setSettlementTenant] = useState<TenantSummary | null>(null);
  const [settlementDeposit, setSettlementDeposit] = useState<number>(10000);
  const [paintingDeduction, setPaintingDeduction] = useState<number>(2000);
  const [unpaidDues, setUnpaidDues] = useState<number>(0);
  const [damageDeductions, setDamageDeductions] = useState<number>(0);
  const [deductionNotes, setDeductionNotes] = useState('');
  const [isSettling, setIsSettling] = useState(false);
  const [settlementResult, setSettlementResult] = useState<SettlementResponse | null>(null);

  // Onboard Modal
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [onboardForm, setOnboardForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    roomId: '',
    bedId: '',
    rentAmount: '9500',
    depositAmount: '10000',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });
  const [isOnboarding, setIsOnboarding] = useState(false);

  const fetchTenantsAndRooms = async () => {
    if (!propertyId) return;
    try {
      setLoading(true);
      const [tenantsRes, roomsRes] = await Promise.all([
        api.get(`/tenants/property/${propertyId}`),
        api.get(`/rooms/property/${propertyId}`)
      ]);
      if (tenantsRes.data.success) setTenants(tenantsRes.data.data);
      if (roomsRes.data.success) setRooms(roomsRes.data.data);
    } catch (err) {
      console.error('Failed to load tenants', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantsAndRooms();
  }, [propertyId]);

  const handleOpen360 = async (tenantId: string) => {
    try {
      setLoading360(true);
      const res = await api.get(`/tenants/${tenantId}/360`);
      if (res.data.success) {
        setSelectedTenant360(res.data.data);
      }
    } catch (err) {
      alert('Failed to load 360 profile');
    } finally {
      setLoading360(false);
    }
  };

  const handleOpenSettlement = (tenant: TenantSummary) => {
    setSettlementTenant(tenant);
    setSettlementDeposit(tenant.depositAmount || 10000);
    setUnpaidDues(tenant.currentMonthRentStatus === 'PENDING' ? tenant.rentAmount : 0);
    setPaintingDeduction(2000);
    setDamageDeductions(0);
    setDeductionNotes('');
    setSettlementResult(null);
  };

  const handleExecuteSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlementTenant) return;
    try {
      setIsSettling(true);
      const deductions = [
        { deductionType: 'PAINTING', amount: paintingDeduction, description: 'Standard room painting & deep cleaning' },
        { deductionType: 'UNPAID_RENT', amount: unpaidDues, description: 'Outstanding EB / Rent dues' },
        { deductionType: 'DAMAGE', amount: damageDeductions, description: deductionNotes || 'Property damage deductions' }
      ].filter(d => d.amount > 0);

      const res = await api.post(`/tenants/${settlementTenant.id}/settle`, {
        settlementDate: new Date().toISOString().split('T')[0],
        refundMode: 'UPI',
        deductions
      });
      if (res.data.success) {
        setSettlementResult(res.data.data);
        fetchTenantsAndRooms();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to process move-out settlement');
    } finally {
      setIsSettling(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTenant || !selectedBedId) return;
    try {
      setIsTransferring(true);
      const res = await api.put(`/tenants/${transferTenant.id}/transfer`, {
        targetBedId: selectedBedId,
        transferDate: new Date().toISOString().split('T')[0]
      });
      if (res.data.success) {
        alert('Tenant transferred to new bed successfully!');
        setTransferTenant(null);
        setSelectedRoomId('');
        setSelectedBedId('');
        fetchTenantsAndRooms();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Transfer failed');
    } finally {
      setIsTransferring(false);
    }
  };

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId || !onboardForm.bedId) return;
    try {
      setIsOnboarding(true);
      const res = await api.post(`/tenants/property/${propertyId}/onboard`, {
        fullName: onboardForm.fullName,
        phone: onboardForm.phone,
        email: onboardForm.email,
        roomId: onboardForm.roomId,
        bedId: onboardForm.bedId,
        joiningDate: new Date().toISOString().split('T')[0],
        rentAmount: parseFloat(onboardForm.rentAmount) || 9500,
        depositAmount: parseFloat(onboardForm.depositAmount) || 10000,
        emergencyContactName: onboardForm.emergencyContactName,
        emergencyContactPhone: onboardForm.emergencyContactPhone
      });
      if (res.data.success) {
        alert('New resident onboarded successfully!');
        setShowOnboardModal(false);
        setOnboardForm({
          fullName: '',
          phone: '',
          email: '',
          roomId: '',
          bedId: '',
          rentAmount: '9500',
          depositAmount: '10000',
          emergencyContactName: '',
          emergencyContactPhone: ''
        });
        fetchTenantsAndRooms();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to onboard tenant');
    } finally {
      setIsOnboarding(false);
    }
  };

  const handleSendWhatsAppReminder = (tenant: TenantSummary) => {
    const upiId = 'harish.pg@okhdfcbank';
    const text = `Hi ${tenant.fullName}, gentle reminder from Sri Sai PG. Your rent of ₹${tenant.rentAmount} for Room ${tenant.roomNumber} (${tenant.bedLabel}) is pending. Please pay via UPI: ${upiId} and share the confirmation receipt. Thank you!`;
    window.open(`https://wa.me/91${tenant.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch = t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.phone.includes(searchTerm) ||
                          (t.roomNumber && t.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const availableBedsForSelectedRoom = rooms.find(r => r.id === onboardForm.roomId)?.beds.filter(b => b.status === 'AVAILABLE') || [];
  const availableBedsForTransfer = rooms.find(r => r.id === selectedRoomId)?.beds.filter(b => b.status === 'AVAILABLE') || [];

  const calculatedTotalDeductions = paintingDeduction + unpaidDues + damageDeductions;
  const calculatedNetRefund = Math.max(0, settlementDeposit - calculatedTotalDeductions);

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 animate-fade-in font-sans">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 text-xs font-black uppercase tracking-wider mb-1.5">
            <Users className="w-4 h-4" />
            <span>Active Resident Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
            Tenant 360° Management
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Manage onboarding, KYC verification, room transfers, WhatsApp reminders, and move-out settlements.
          </p>
        </div>

        <button
          onClick={() => setShowOnboardModal(true)}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black rounded-2xl text-sm shadow-md shadow-indigo-600/20 transition-all active:scale-95 whitespace-nowrap"
        >
          <UserPlus className="w-5 h-5" />
          <span>Onboard New Tenant</span>
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search tenant name, phone, room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto text-xs">
          <span className="text-slate-500 font-bold hidden sm:inline">Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 font-bold rounded-xl px-4 py-2.5 text-xs outline-none cursor-pointer focus:border-indigo-600 focus:bg-white"
          >
            <option value="ALL">All Statuses ({tenants.length})</option>
            <option value="ACTIVE">Active Tenancies</option>
            <option value="ON_NOTICE">On 30-Day Notice</option>
            <option value="VACATED">Vacated</option>
          </select>
        </div>
      </div>

      {/* Tenants List Grid (Mobile Cards + Desktop Table) */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-sm font-medium">Loading tenant directory...</p>
        </div>
      ) : filteredTenants.length === 0 ? (
        <div className="py-20 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <Users className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <p className="font-bold text-base text-slate-800">No tenants found matching your query.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Mobile Card List */}
          <div className="md:hidden space-y-3.5">
            {filteredTenants.map((t) => (
              <div key={t.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 font-display">{t.fullName}</h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{t.phone}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${
                    t.currentMonthRentStatus === 'PAID'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {t.currentMonthRentStatus === 'PAID' ? 'Paid' : 'Rent Due'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700">
                  <div>Room: <b className="text-slate-900 font-display">Room {t.roomNumber || 'N/A'}</b></div>
                  <div>Bed: <b className="text-slate-900 font-display">{t.bedLabel || 'N/A'}</b></div>
                  <div>Rent: <b className="text-emerald-600 font-mono">₹{t.rentAmount.toLocaleString()}</b></div>
                  <div>Status: <b className={t.status === 'ON_NOTICE' ? 'text-amber-700' : 'text-slate-900'}>{t.status}</b></div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {t.currentMonthRentStatus !== 'PAID' && (
                    <button
                      onClick={() => handleSendWhatsAppReminder(t)}
                      className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded-xl text-xs flex items-center gap-1.5 active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleOpen360(t.id)}
                    className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold rounded-xl text-xs transition active:scale-95"
                  >
                    360° Profile
                  </button>
                  <button
                    onClick={() => setTransferTenant(t)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition border border-slate-200"
                  >
                    Transfer
                  </button>
                  <button
                    onClick={() => handleOpenSettlement(t)}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Settle</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6 font-bold">Tenant Name</th>
                  <th className="py-4 px-6 font-bold">Room & Bed</th>
                  <th className="py-4 px-6 font-bold">Monthly Rent</th>
                  <th className="py-4 px-6 font-bold">Rent Status</th>
                  <th className="py-4 px-6 font-bold">Tenancy Status</th>
                  <th className="py-4 px-6 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 text-base font-display">{t.fullName}</div>
                      <div className="text-slate-500 font-mono text-xs mt-0.5">{t.phone}</div>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 font-display">
                      Room {t.roomNumber || 'N/A'}
                      <span className="ml-2 text-xs font-normal text-slate-500 font-sans">({t.bedLabel || 'N/A'})</span>
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-600 font-mono text-base">
                      ₹{t.rentAmount.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${
                        t.currentMonthRentStatus === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {t.currentMonthRentStatus === 'PAID' ? 'Paid' : 'Rent Due'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${
                        t.status === 'ON_NOTICE' 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        {t.currentMonthRentStatus !== 'PAID' && (
                          <button
                            onClick={() => handleSendWhatsAppReminder(t)}
                            className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold transition flex items-center gap-1.5 text-xs active:scale-95"
                            title="Send WhatsApp payment reminder"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpen360(t.id)}
                          className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl font-bold transition text-xs active:scale-95"
                        >
                          360° Profile
                        </button>
                        <button
                          onClick={() => setTransferTenant(t)}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl font-bold transition text-xs"
                        >
                          Transfer
                        </button>
                        <button
                          onClick={() => handleOpenSettlement(t)}
                          className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold transition flex items-center gap-1.5 text-xs active:scale-95"
                          title="Calculate security deposit refund & vacate"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                          <span>Settle</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Security Deposit Settlement & Vacate Modal */}
      {settlementTenant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200 text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600">
                  <Calculator className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 font-display">Security Deposit Settlement</h3>
                  <p className="text-xs text-slate-500">Move-out for {settlementTenant.fullName} (Room {settlementTenant.roomNumber})</p>
                </div>
              </div>
              <button onClick={() => setSettlementTenant(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            {settlementResult ? (
              <div className="space-y-4 text-center py-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
                <h4 className="text-2xl font-black text-slate-900 font-display">Deposit Settled & Bed Freed!</h4>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-sm text-left max-w-sm mx-auto font-medium text-slate-700">
                  <div className="flex justify-between"><span>Deposit Held:</span><b className="text-slate-900 font-mono">₹{settlementResult.depositHeld.toLocaleString()}</b></div>
                  <div className="flex justify-between"><span>Total Deductions:</span><b className="text-rose-600 font-mono">- ₹{settlementResult.totalDeductions.toLocaleString()}</b></div>
                  <div className="flex justify-between pt-2.5 border-t border-slate-200 font-black text-base">
                    <span className="text-emerald-700">Net Refund Due:</span>
                    <span className="text-emerald-700 font-mono">₹{settlementResult.netRefundAmount.toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => { setSettlementTenant(null); setSettlementResult(null); }}
                  className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-md shadow-indigo-600/20 transition active:scale-95"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleExecuteSettlement} className="space-y-4">
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Deposit Held (₹)</label>
                    <input
                      type="number"
                      required
                      value={settlementDeposit}
                      onChange={(e) => setSettlementDeposit(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-base font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Painting/Cleaning (₹)</label>
                    <input
                      type="number"
                      value={paintingDeduction}
                      onChange={(e) => setPaintingDeduction(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-base font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Unpaid Dues (₹)</label>
                    <input
                      type="number"
                      value={unpaidDues}
                      onChange={(e) => setUnpaidDues(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-base font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Damage Fee (₹)</label>
                    <input
                      type="number"
                      value={damageDeductions}
                      onChange={(e) => setDamageDeductions(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-base font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 font-mono"
                    />
                  </div>
                </div>

                {/* Live Settlement Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-medium text-slate-700">
                  <div className="flex justify-between">
                    <span>Deposit Held:</span>
                    <span className="font-mono font-bold text-slate-900">₹{settlementDeposit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Deductions:</span>
                    <span className="font-mono font-bold text-rose-600">- ₹{calculatedTotalDeductions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black">
                    <span className="text-emerald-700">Net Refund to Resident:</span>
                    <span className="text-emerald-700 font-mono">₹{calculatedNetRefund.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Settlement Notes</label>
                  <input
                    type="text"
                    value={deductionNotes}
                    onChange={(e) => setDeductionNotes(e.target.value)}
                    placeholder="e.g. ₹2000 deducted for standard repainting & room deep clean"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSettlementTenant(null)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSettling}
                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl text-xs shadow-md shadow-rose-600/20 transition disabled:opacity-50 active:scale-95"
                  >
                    {isSettling ? 'Settling...' : 'Confirm & Free Bed'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Tenant 360 Profile Modal Drawer */}
      {selectedTenant360 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 text-slate-900 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start border-b border-slate-200 pb-5">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-indigo-600/20 font-display">
                  {selectedTenant360.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-black font-display text-slate-900">{selectedTenant360.fullName}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedTenant360.phone} • {selectedTenant360.email || 'No email'}</p>
                </div>
              </div>
              <button onClick={() => setSelectedTenant360(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-center">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-xs uppercase font-bold text-slate-500">Room & Bed</span>
                <div className="text-base font-black text-slate-900 mt-1 font-display">Room {selectedTenant360.roomNumber} ({selectedTenant360.bedLabel})</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-xs uppercase font-bold text-slate-500">Monthly Rent</span>
                <div className="text-base font-black text-emerald-600 mt-1 font-mono">₹{selectedTenant360.rentAmount.toLocaleString()}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-xs uppercase font-bold text-slate-500">Deposit</span>
                <div className="text-base font-black text-slate-900 mt-1 font-mono">₹{selectedTenant360.depositAmount.toLocaleString()}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-xs uppercase font-bold text-slate-500">Joining Date</span>
                <div className="text-sm font-black text-slate-900 mt-1 font-mono">{selectedTenant360.joiningDate}</div>
              </div>
            </div>

            {/* Emergency & Verification */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-sm font-medium text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Emergency Contact:</span>
                <span className="font-bold text-slate-900">{selectedTenant360.emergencyContactName || 'Parent'} ({selectedTenant360.emergencyContactPhone || '9844556677'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">KYC Status:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Aadhaar Verified
                </span>
              </div>
            </div>

            {/* Activity History */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Activity Timeline</h4>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {(selectedTenant360.activityTimeline || []).map((event, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{event.title}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{event.description}</div>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">{event.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Transfer Modal */}
      {transferTenant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200 text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-xl font-black font-display text-slate-900">Transfer Room</h3>
                <p className="text-xs text-slate-500">{transferTenant.fullName} (Currently Room {transferTenant.roomNumber})</p>
              </div>
              <button onClick={() => setTransferTenant(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Select Target Room</label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 font-bold"
                >
                  <option value="">-- Choose Room --</option>
                  {rooms.filter(r => r.occupiedBeds < r.totalBeds).map(r => (
                    <option key={r.id} value={r.id}>
                      Room {r.roomNumber} (Floor {r.floorNumber} - {r.availableBeds} beds free)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Select Target Bed</label>
                <select
                  value={selectedBedId}
                  onChange={(e) => setSelectedBedId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 font-bold"
                >
                  <option value="">-- Choose Free Bed --</option>
                  {availableBedsForTransfer.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.bedLabel} (Available)
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setTransferTenant(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTransferring || !selectedBedId}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl text-xs shadow-md shadow-indigo-600/20 transition disabled:opacity-50 active:scale-95"
                >
                  {isTransferring ? 'Transferring...' : 'Execute Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Onboard Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200 text-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-xl font-black font-display text-slate-900">Onboard Resident</h3>
                <p className="text-xs text-slate-500">Allocate room, set rent and record security deposit</p>
              </div>
              <button onClick={() => setShowOnboardModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleOnboard} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Nair"
                  value={onboardForm.fullName}
                  onChange={(e) => setOnboardForm({ ...onboardForm, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit number"
                    value={onboardForm.phone}
                    onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="email@domain.com"
                    value={onboardForm.email}
                    onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Room</label>
                  <select
                    value={onboardForm.roomId}
                    onChange={(e) => setOnboardForm({ ...onboardForm, roomId: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 font-bold"
                  >
                    <option value="">-- Select Room --</option>
                    {rooms.filter(r => r.occupiedBeds < r.totalBeds).map(r => (
                      <option key={r.id} value={r.id}>
                        Room {r.roomNumber}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Bed Slot</label>
                  <select
                    value={onboardForm.bedId}
                    onChange={(e) => setOnboardForm({ ...onboardForm, bedId: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 font-bold"
                  >
                    <option value="">-- Select Bed --</option>
                    {availableBedsForSelectedRoom.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.bedLabel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    required
                    value={onboardForm.rentAmount}
                    onChange={(e) => setOnboardForm({ ...onboardForm, rentAmount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Security Deposit (₹)</label>
                  <input
                    type="number"
                    required
                    value={onboardForm.depositAmount}
                    onChange={(e) => setOnboardForm({ ...onboardForm, depositAmount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isOnboarding || !onboardForm.bedId}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 transition active:scale-95"
                >
                  {isOnboarding ? 'Onboarding...' : 'Confirm Tenancy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
