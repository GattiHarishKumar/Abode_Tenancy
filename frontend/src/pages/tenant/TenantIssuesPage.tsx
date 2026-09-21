import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Plus, 
  CheckCircle2, 
  X, 
  Droplets, 
  Zap, 
  Wifi, 
  Utensils, 
  Sparkle, 
  Volume2, 
  Check,
  LifeBuoy
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { ComplaintSummary } from '../../types';

export const TenantIssuesPage: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<ComplaintSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [category, setCategory] = useState('PLUMBING');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const tenantId = user?.tenantId;

  const fetchComplaints = async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const res = await api.get(`/complaints/tenant/${tenantId}`);
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
  }, [tenantId]);

  const handleRaiseTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    try {
      setIsSubmitting(true);
      const res = await api.post(`/complaints/tenant/${tenantId}`, {
        category,
        title,
        description,
        priority
      });
      if (res.data.success) {
        setNotification('Maintenance ticket submitted! The owner & staff have been alerted.');
        setTimeout(() => setNotification(null), 4000);
        setShowModal(false);
        setTitle('');
        setDescription('');
        fetchComplaints();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'PLUMBING': return <Droplets className="w-5 h-5 text-cyan-600" />;
      case 'ELECTRICAL': return <Zap className="w-5 h-5 text-amber-600" />;
      case 'WIFI': return <Wifi className="w-5 h-5 text-violet-600" />;
      case 'FOOD': return <Utensils className="w-5 h-5 text-emerald-600" />;
      case 'CLEANLINESS': return <Sparkle className="w-5 h-5 text-teal-600" />;
      case 'NOISE': return <Volume2 className="w-5 h-5 text-rose-600" />;
      default: return <Wrench className="w-5 h-5 text-violet-600" />;
    }
  };

  const categories = [
    { id: 'PLUMBING', label: 'Plumbing / Water', icon: <Droplets className="w-4 h-4 text-cyan-600" /> },
    { id: 'ELECTRICAL', label: 'Electrical / Geyser', icon: <Zap className="w-4 h-4 text-amber-600" /> },
    { id: 'WIFI', label: 'WiFi & Internet', icon: <Wifi className="w-4 h-4 text-violet-600" /> },
    { id: 'FOOD', label: 'Food / Dining', icon: <Utensils className="w-4 h-4 text-emerald-600" /> },
    { id: 'CLEANLINESS', label: 'Housekeeping', icon: <Sparkle className="w-4 h-4 text-teal-600" /> },
    { id: 'NOISE', label: 'Noise / Disturbance', icon: <Volume2 className="w-4 h-4 text-rose-600" /> },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 text-violet-700 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-violet-50 border border-violet-200 mb-3">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Support & Maintenance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">Maintenance Helpdesk</h1>
          <p className="text-base text-slate-600 mt-1 max-w-xl">
            Quickly raise repair requests for plumbing, electrical appliances, WiFi, or room cleanliness.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="relative z-10 flex items-center gap-2.5 px-6 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-black rounded-2xl text-sm shadow-sm transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          <span>Raise New Ticket</span>
        </button>
      </div>

      {notification && (
        <div className="p-4 sm:p-5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-sm font-bold flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <Check className="w-5 h-5 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Tickets List */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600 text-sm font-medium">Loading your maintenance tickets...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-slate-900 font-bold font-display text-xl">No Active Maintenance Tickets</h3>
          <p className="text-slate-600 text-base max-w-md mx-auto">
            Everything in your room is in great shape! If anything needs repair or attention, click "Raise New Ticket" above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {complaints.map((c) => (
            <div 
              key={c.id} 
              className="bg-white rounded-3xl border border-slate-200 hover:border-slate-300 transition-all shadow-sm p-6 sm:p-7 space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      {getCategoryIcon(c.category)}
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">{c.category}</span>
                      <span className="text-xs font-mono font-bold text-violet-700">#{c.complaintNumber || c.id.slice(0, 6)}</span>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-black ${
                    c.status === 'RESOLVED' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    c.status === 'IN_PROGRESS' 
                      ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                    c.status === 'ACKNOWLEDGED' 
                      ? 'bg-sky-50 text-sky-700 border border-sky-200' 
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {c.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold font-display text-slate-900">{c.title}</h3>
                  <p className="text-sm text-slate-700 mt-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed font-medium">
                    {c.description}
                  </p>
                </div>

                {c.resolutionNotes && (
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs text-emerald-800">
                    <span className="font-bold block mb-1 text-emerald-900">Staff Resolution Notes:</span>
                    {c.resolutionNotes}
                  </div>
                )}
              </div>

              <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span>Raised on <span className="font-mono text-slate-700 font-bold">{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></span>
                <span className="font-semibold text-slate-600">Priority: <span className="text-amber-700 font-bold">{c.priority}</span></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 text-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-violet-50 text-violet-700 border border-violet-200">
                  <Wrench className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold font-display text-slate-900">Raise Maintenance Request</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRaiseTicket} className="space-y-4">
              {/* Category Pills */}
              <div>
                <label className="block text-xs font-black text-slate-600 mb-2 uppercase tracking-wider">Select Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center space-x-2 ${
                        category === cat.id
                          ? 'bg-violet-50 border-violet-400 text-violet-900 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {cat.icon}
                      <span className="truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 mb-2 uppercase tracking-wider">Brief Summary</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Geyser in bathroom not heating water"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 mb-2 uppercase tracking-wider">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe when the issue started, exact location, or any specific details..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 resize-none font-medium"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-sm font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-black shadow-sm transition flex items-center space-x-2 active:scale-95"
                >
                  {isSubmitting ? <span>Submitting...</span> : <span>Submit Ticket</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
