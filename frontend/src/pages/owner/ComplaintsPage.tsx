import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Filter, 
  X, 
  User, 
  Bed, 
  Check, 
  ArrowUpRight,
  Zap,
  Droplets,
  Wifi,
  Utensils,
  Sparkle,
  Send,
  Hammer
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { ComplaintSummary } from '../../types';

interface TechnicianPreset {
  name: string;
  role: string;
  phone: string;
  category: string;
}

const DEFAULT_TECHNICIANS: TechnicianPreset[] = [
  { name: 'Mohan (Plumber)', role: 'Plumber', phone: '919845011223', category: 'PLUMBING' },
  { name: 'Ramesh (Electrician)', role: 'Electrician', phone: '919845044556', category: 'ELECTRICAL' },
  { name: 'ACT Fibernet ISP Support', role: 'Wi-Fi Technician', phone: '919845077889', category: 'WIFI' },
  { name: 'Suresh (Carpenter)', role: 'Carpenter', phone: '919845099001', category: 'OTHER' },
  { name: 'Lakshmi (Housekeeping)', role: 'Housekeeping Lead', phone: '919845033445', category: 'CLEANLINESS' }
];

export const ComplaintsPage: React.FC = () => {
  const { propertyId } = useAuth();
  const [complaints, setComplaints] = useState<ComplaintSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Status update modal
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintSummary | null>(null);
  const [newStatus, setNewStatus] = useState<string>('IN_PROGRESS');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Technician Dispatch Modal
  const [dispatchComplaint, setDispatchComplaint] = useState<ComplaintSummary | null>(null);
  const [technicianPhone, setTechnicianPhone] = useState('');
  const [technicianName, setTechnicianName] = useState('');

  const fetchComplaints = async () => {
    if (!propertyId) return;
    try {
      setLoading(true);
      const res = await api.get(`/complaints/property/${propertyId}`);
      if (res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load complaints', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [propertyId]);

  const handleOpenStatusModal = (complaint: ComplaintSummary) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status === 'NEW' ? 'ACKNOWLEDGED' : complaint.status === 'ACKNOWLEDGED' ? 'IN_PROGRESS' : 'RESOLVED');
    setResolutionNotes(complaint.resolutionNotes || '');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      setIsUpdating(true);
      const res = await api.put(`/complaints/${selectedComplaint.id}/status`, {
        status: newStatus,
        resolutionNotes: resolutionNotes
      });
      if (res.data.success) {
        setNotification(`Ticket #${selectedComplaint.complaintNumber || selectedComplaint.id.slice(0, 6)} updated to ${newStatus}`);
        setTimeout(() => setNotification(null), 4000);
        setSelectedComplaint(null);
        fetchComplaints();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenDispatchModal = (complaint: ComplaintSummary) => {
    setDispatchComplaint(complaint);
    const match = DEFAULT_TECHNICIANS.find(t => t.category === complaint.category);
    if (match) {
      setTechnicianName(match.name);
      setTechnicianPhone(match.phone);
    } else {
      setTechnicianName(DEFAULT_TECHNICIANS[0].name);
      setTechnicianPhone(DEFAULT_TECHNICIANS[0].phone);
    }
  };

  const generateDispatchMessage = (c: ComplaintSummary) => {
    return `🔧 *MAINTENANCE DISPATCH - Sri Sai PG*\n\n` +
      `*Ticket ID:* #${c.complaintNumber || c.id.slice(0, 6)}\n` +
      `*Category:* ${c.category}\n` +
      `*Room Number:* Room ${c.roomNumber || '101'}\n` +
      `*Tenant:* ${c.tenantName || 'Resident'}\n` +
      `*Issue Title:* ${c.title}\n` +
      `*Description:* ${c.description}\n\n` +
      `Please inspect and resolve this ticket at the earliest. Reply with estimated visit time.`;
  };

  const handleSendWhatsAppDispatch = () => {
    if (!dispatchComplaint) return;
    const cleanPhone = technicianPhone.replace(/\D/g, '');
    const phone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const text = encodeURIComponent(generateDispatchMessage(dispatchComplaint));
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 shadow-sm">
            <AlertCircle className="w-3.5 h-3.5" /> New
          </span>
        );
      case 'ACKNOWLEDGED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1.5 shadow-sm">
            <Clock className="w-3.5 h-3.5" /> Acknowledged
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5 shadow-sm">
            <Wrench className="w-3.5 h-3.5" /> In Progress
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
          </span>
        );
      case 'CLOSED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">Closed</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'PLUMBING': return <Droplets className="w-4 h-4 text-cyan-600" />;
      case 'ELECTRICAL': return <Zap className="w-4 h-4 text-amber-600" />;
      case 'WIFI': return <Wifi className="w-4 h-4 text-indigo-600" />;
      case 'FOOD': return <Utensils className="w-4 h-4 text-emerald-600" />;
      case 'CLEANLINESS': return <Sparkle className="w-4 h-4 text-teal-600" />;
      default: return <Wrench className="w-4 h-4 text-purple-600" />;
    }
  };

  const counts = {
    total: complaints.length,
    open: complaints.filter(c => c.status === 'NEW' || c.status === 'ACKNOWLEDGED' || c.status === 'IN_PROGRESS').length,
    resolved: complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length,
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 animate-fade-in font-sans">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <div className="flex items-center space-x-2 text-rose-600 text-xs font-black uppercase tracking-wider mb-1.5">
            <Wrench className="w-4 h-4" />
            <span>Helpdesk & Service SLA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
            Maintenance & Complaints Board
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">Track issues, dispatch technicians via WhatsApp, and maintain SLA accountability.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-slate-900 font-bold"
            >
              <option value="ALL">All Categories</option>
              <option value="PLUMBING">Plumbing</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="WIFI">WiFi & Internet</option>
              <option value="FOOD">Food & Kitchen</option>
              <option value="CLEANLINESS">Cleanliness</option>
              <option value="NOISE">Noise</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-700">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-slate-900 font-bold"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Stat Highlights */}
      <div className="grid grid-cols-3 gap-4 sm:gap-6">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 text-center shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Tickets</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 font-display tabular-nums">{counts.total}</div>
        </div>
        <div className="p-5 rounded-3xl bg-amber-50/70 border border-amber-200 text-center shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Active / In Progress</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-900 mt-1 font-display tabular-nums">{counts.open}</div>
        </div>
        <div className="p-5 rounded-3xl bg-emerald-50/70 border border-emerald-200 text-center shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Resolved SLA</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-900 mt-1 font-display tabular-nums">{counts.resolved}</div>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-sm font-bold flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2.5">
            <Check className="w-5 h-5 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Complaints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {filteredComplaints.length === 0 ? (
          <div className="col-span-full py-20 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 font-display">Zero Pending Maintenance Issues</h3>
            <p className="text-xs text-slate-500 mt-1">All resident issues have been addressed or match no current filters.</p>
          </div>
        ) : (
          filteredComplaints.map((c) => (
            <div
              key={c.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
                      {getCategoryIcon(c.category)}
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">{c.category}</span>
                      <span className="text-xs font-mono font-bold text-slate-400">#{c.complaintNumber || c.id.slice(0, 6)}</span>
                    </div>
                  </div>
                  {getStatusBadge(c.status)}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug font-display">{c.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100 font-medium">
                    {c.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <div className="flex items-center space-x-2 font-medium">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-800 font-bold">{c.tenantName || 'Resident'}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200 font-display">
                    <Bed className="w-3.5 h-3.5" />
                    <span>Room {c.roomNumber || '101'}</span>
                  </div>
                </div>

                {c.resolutionNotes && (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                    <span className="font-bold block text-emerald-900 mb-0.5">Resolution Note:</span>
                    {c.resolutionNotes}
                  </div>
                )}
              </div>

              <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenDispatchModal(c)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition flex items-center space-x-1.5 active:scale-95 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch WhatsApp</span>
                </button>
                <button
                  onClick={() => handleOpenStatusModal(c)}
                  className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5 active:scale-95 border border-slate-200 shadow-sm"
                >
                  <span>Update Status</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* WhatsApp Dispatch Modal */}
      {dispatchComplaint && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200 text-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <Hammer className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-slate-900 font-display">Dispatch Ticket #{dispatchComplaint.complaintNumber || dispatchComplaint.id.slice(0, 6)}</h3>
              </div>
              <button onClick={() => setDispatchComplaint(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Select Contact / Technician</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DEFAULT_TECHNICIANS.map((tech) => (
                    <button
                      key={tech.name}
                      type="button"
                      onClick={() => {
                        setTechnicianName(tech.name);
                        setTechnicianPhone(tech.phone);
                      }}
                      className={`p-3 rounded-2xl border text-left transition ${
                        technicianName === tech.name
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs font-bold">{tech.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{tech.role}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">WhatsApp Phone Number</label>
                <input
                  type="text"
                  value={technicianPhone}
                  onChange={(e) => setTechnicianPhone(e.target.value)}
                  placeholder="e.g. 9845011223"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-base font-mono text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Message Preview</label>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto">
                  {generateDispatchMessage(dispatchComplaint)}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDispatchComplaint(null)}
                  className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendWhatsAppDispatch}
                  className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition shadow-sm flex items-center space-x-2 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Open WhatsApp Dispatch</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200 text-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
                  <Wrench className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-slate-900 font-display">Update Ticket #{selectedComplaint.complaintNumber || selectedComplaint.id.slice(0, 6)}</h3>
              </div>
              <button onClick={() => setSelectedComplaint(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Ticket Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                >
                  <option value="NEW">NEW (Received)</option>
                  <option value="ACKNOWLEDGED">ACKNOWLEDGED (Owner Notified)</option>
                  <option value="IN_PROGRESS">IN_PROGRESS (Technician Assigned)</option>
                  <option value="RESOLVED">RESOLVED (Fixed)</option>
                  <option value="CLOSED">CLOSED (Completed)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Resolution Notes / Feedback for Tenant</label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Electrician visited and replaced the fuse switch. Working fine now."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 resize-none font-medium"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition shadow-sm flex items-center space-x-2 active:scale-95 disabled:opacity-50"
                >
                  {isUpdating ? <span>Updating...</span> : <span>Save Changes</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
