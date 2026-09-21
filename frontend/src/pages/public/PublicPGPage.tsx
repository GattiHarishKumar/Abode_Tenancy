import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Sparkles, 
  ShieldCheck, 
  Wifi, 
  Flame, 
  X, 
  CheckCircle2, 
  Users, 
  Soup, 
  Zap, 
  Tv, 
  Car, 
  Droplets
} from 'lucide-react';
import api from '../../api/client';
import { PublicPropertyProfile } from '../../types';

export const PublicPGPage: React.FC = () => {
  const { slug = 'sri-sai-pg-marathahalli' } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<PublicPropertyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Application Modal State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    name: '',
    phone: '',
    email: '',
    preferredSharing: '2 Sharing',
    expectedMoveInDate: new Date().toISOString().split('T')[0],
    occupation: 'Professional',
    companyOrCollege: '',
    dietaryPreference: 'VEG',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/public/properties/${slug}`);
        if (res.data.success) {
          setProfile(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load public PG profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicProfile();
  }, [slug]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      setIsSubmitting(true);
      const res = await api.post('/public/applications', {
        propertyId: profile.id,
        ...applyForm
      });
      if (res.data.success) {
        setApplicationSubmitted(true);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-bold text-base">Loading PG & Room details...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-900">
        <div className="bg-white border border-slate-200 p-10 rounded-3xl shadow-sm text-center max-w-md">
          <Building2 className="w-14 h-14 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-display text-slate-900">Property Not Found</h2>
          <p className="text-sm text-slate-500 mt-2">Please verify the link or QR code you scanned.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-32">
      {/* Sticky Top Header */}
      <div className="bg-white/90 backdrop-blur-xl sticky top-0 z-30 border-b border-slate-200 px-4 sm:px-8 py-4 flex justify-between items-center max-w-4xl mx-auto shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-violet-600 flex items-center justify-center text-white font-black text-base shadow-sm">
            AT
          </div>
          <div>
            <span className="font-black text-base tracking-tight text-slate-900 block">Abode Tenancy</span>
            <span className="text-[11px] text-slate-500 font-semibold block -mt-0.5">Verified Luxury PG Stay</span>
          </div>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl text-xs font-black shadow-sm transition active:scale-95 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Book a Bed</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6 relative overflow-hidden">
          <div className="flex flex-wrap items-center gap-2.5 relative z-10">
            <span className="px-3.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Abode Verified PG
            </span>
            <span className="px-3.5 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-bold border border-violet-200">
              {profile.genderPolicy || 'CO-LIVING'}
            </span>
          </div>

          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-black font-display text-slate-900 tracking-tight">{profile.name}</h1>
            <div className="flex items-center gap-2 text-sm text-slate-600 mt-2 font-medium">
              <MapPin className="w-4 h-4 text-violet-600 shrink-0" />
              <span>{profile.address}, {profile.city}</span>
            </div>
          </div>

          <p className="relative z-10 text-sm sm:text-base text-slate-700 bg-slate-50 p-5 rounded-2xl border border-slate-100 leading-relaxed font-medium">
            {profile.description || 'Premium, secure, and fully-managed co-living PG with 3x daily home-cooked meals, 300 Mbps high-speed WiFi, daily housekeeping, 24/7 power backup, and top-tier amenities.'}
          </p>

          {/* Direct Call / WhatsApp Actions */}
          <div className="grid grid-cols-2 gap-4 pt-1 relative z-10">
            <a
              href="tel:+919876543210"
              className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
            >
              <Phone className="w-4 h-4" /> 
              <span>Call Owner</span>
            </a>
            <a
              href={`https://wa.me/919876543210?text=Hi,%20I%20am%20interested%20in%20staying%20at%20${encodeURIComponent(profile.name)}`}
              target="_blank"
              rel="noreferrer"
              className="py-3.5 px-4 bg-slate-50 hover:bg-slate-100 text-emerald-700 border border-emerald-200 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition active:scale-95 shadow-sm"
            >
              <MessageSquare className="w-4 h-4" /> 
              <span>WhatsApp Chat</span>
            </a>
          </div>
        </div>

        {/* Real-Time Bed Availability & Pricing Matrix */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 flex items-center gap-2.5">
              <Users className="w-6 h-6 text-violet-600" />
              <span>Real-Time Vacancy & Monthly Rates</span>
            </h2>
            <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black font-mono border border-emerald-200 w-fit shadow-sm">
              {profile.totalVacantBeds} Beds Vacant
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { type: 'Single Sharing', rent: '₹14,000 / mo', vacant: '2 Beds Left', highlight: false },
              { type: '2 Sharing (Popular)', rent: '₹8,500 / mo', vacant: `${Math.max(1, (profile.totalVacantBeds || 6) - 3)} Beds Left`, highlight: true },
              { type: '3 Sharing', rent: '₹6,500 / mo', vacant: '3 Beds Left', highlight: false }
            ].map((plan, i) => (
              <div 
                key={i} 
                className={`p-5 rounded-2xl border text-center flex flex-col justify-between space-y-3 transition-all ${
                  plan.highlight 
                    ? 'bg-violet-50/50 border-violet-200 shadow-sm' 
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-slate-500">{plan.type}</div>
                  <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 mt-1">{plan.rent}</div>
                </div>
                <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 py-1.5 px-2.5 rounded-xl inline-block border border-emerald-200 shadow-sm">
                  🟢 {plan.vacant}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 3x Daily Homely Food Highlights */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 flex items-center gap-2.5">
            <Soup className="w-6 h-6 text-amber-600" />
            <span>3 Times Homely Dining Included</span>
          </h2>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
              <span className="font-bold text-amber-900 block text-sm sm:text-base">Breakfast</span>
              <span className="text-amber-700 text-xs font-mono block mt-1 font-semibold">7:30 AM - 10 AM</span>
            </div>
            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200">
              <span className="font-bold text-emerald-900 block text-sm sm:text-base">Lunch</span>
              <span className="text-emerald-700 text-xs font-mono block mt-1 font-semibold">12:30 PM - 2:30 PM</span>
            </div>
            <div className="bg-violet-50/60 p-4 rounded-2xl border border-violet-200">
              <span className="font-bold text-violet-900 block text-sm sm:text-base">Dinner</span>
              <span className="text-violet-700 text-xs font-mono block mt-1 font-semibold">7:30 PM - 10 PM</span>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            • Daily rotating South & North Indian menu • Unlimited hot rotis & rice • RO purified drinking water stations on all floors
          </p>
        </div>

        {/* Included Amenities Grid */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-violet-600" />
            <span>Included Amenities & Perks</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs sm:text-sm font-semibold text-slate-700">
            {[
              { text: '300 Mbps Fiber WiFi', icon: <Wifi className="w-4 h-4 text-sky-600" /> },
              { text: 'Automatic Washing Machines', icon: <Droplets className="w-4 h-4 text-cyan-600" /> },
              { text: 'Daily Room Housekeeping', icon: <Sparkles className="w-4 h-4 text-teal-600" /> },
              { text: '24/7 Power Backup', icon: <Zap className="w-4 h-4 text-amber-600" /> },
              { text: '24/7 CCTV & Security', icon: <ShieldCheck className="w-4 h-4 text-emerald-600" /> },
              { text: 'Hot Water Geyser 24x7', icon: <Flame className="w-4 h-4 text-rose-600" /> },
              { text: 'Smart Keycard Entry', icon: <ShieldCheck className="w-4 h-4 text-violet-600" /> },
              { text: 'Floor Refrigerator', icon: <Tv className="w-4 h-4 text-purple-600" /> },
              { text: 'Covered 2-Wheeler Parking', icon: <Car className="w-4 h-4 text-blue-600" /> }
            ].map((amenity, idx) => (
              <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center space-x-2.5 shadow-sm">
                {amenity.icon}
                <span className="truncate">{amenity.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Bottom Apply CTA on Mobile/Tablet */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 p-4 z-40 max-w-4xl mx-auto shadow-2xl flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Bed Rates</span>
          <div className="text-lg font-black font-mono text-slate-900">Starts ₹6,500 <span className="text-xs font-normal font-sans text-slate-500">/ mo</span></div>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="px-7 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-black rounded-2xl text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>Apply & Book Bed</span>
        </button>
      </div>

      {/* Application Form Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto text-slate-900">
            {applicationSubmitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-black font-display text-slate-900">Application Received!</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  Thank you, <b className="text-slate-900">{applyForm.name}</b>. The property owner has received your details and will reach out via WhatsApp / Call at <b className="font-mono text-slate-900">{applyForm.phone}</b> shortly.
                </p>
                <button
                  onClick={() => {
                    setShowApplyModal(false);
                    setApplicationSubmitted(false);
                  }}
                  className="px-7 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl text-sm shadow-sm transition"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="font-black font-display text-slate-900 text-xl">Join {profile.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">Direct digital booking inquiry</p>
                  </div>
                  <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleApply} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Reddy"
                      value={applyForm.name}
                      onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Mobile Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit phone"
                        value={applyForm.phone}
                        onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Email</label>
                      <input
                        type="email"
                        placeholder="name@email.com"
                        value={applyForm.email}
                        onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Room Preference</label>
                      <select
                        value={applyForm.preferredSharing}
                        onChange={(e) => setApplyForm({ ...applyForm, preferredSharing: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-violet-500 font-bold"
                      >
                        <option value="Single Sharing">Single Sharing</option>
                        <option value="2 Sharing">2 Sharing</option>
                        <option value="3 Sharing">3 Sharing</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Move-in Date</label>
                      <input
                        type="date"
                        required
                        value={applyForm.expectedMoveInDate}
                        onChange={(e) => setApplyForm({ ...applyForm, expectedMoveInDate: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-violet-500 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Company / College Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Infosys, TCS, Manyata Tech Park"
                      value={applyForm.companyOrCollege}
                      onChange={(e) => setApplyForm({ ...applyForm, companyOrCollege: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 font-medium"
                    />
                  </div>

                  <div className="pt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowApplyModal(false)}
                      className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-black rounded-2xl text-sm shadow-sm transition disabled:opacity-50 active:scale-95"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
