import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  XCircle, 
  IndianRupee, 
  Wrench, 
  ArrowRight, 
  Star, 
  Coffee, 
  Soup, 
  Flame, 
  Check, 
  UserPlus, 
  Sparkle as SparkleIcon 
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { MenuResponse, MealConfirmationItem, TenantProfile360, ComplaintSummary } from '../../types';
import { Link } from 'react-router-dom';

export const TenantTodayPage: React.FC = () => {
  const { user, propertyId } = useAuth();
  const [tenantProfile, setTenantProfile] = useState<TenantProfile360 | null>(null);
  const [todayMenu, setTodayMenu] = useState<MenuResponse | null>(null);
  const [confirmations, setConfirmations] = useState<MealConfirmationItem[]>([]);
  const [activeComplaints, setActiveComplaints] = useState<ComplaintSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Rating modal state
  const [ratingMeal, setRatingMeal] = useState<string | null>(null);
  const [starCount, setStarCount] = useState(5);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const tenantId = user?.tenantId;

  const fetchTodayData = async () => {
    if (!tenantId || !propertyId) return;
    try {
      setLoading(true);
      const todayStr = new Date().toISOString().split('T')[0];

      const [profileRes, menuRes, confRes, compRes] = await Promise.all([
        api.get(`/tenants/${tenantId}/360`),
        api.get(`/food/menu/${propertyId}?date=${todayStr}`),
        api.get(`/food/confirmations/tenant/${tenantId}?date=${todayStr}`),
        api.get(`/complaints/tenant/${tenantId}`)
      ]);

      if (profileRes.data.success) setTenantProfile(profileRes.data.data);
      if (menuRes.data.success) setTodayMenu(menuRes.data.data);
      if (confRes.data.success) setConfirmations(confRes.data.data);
      if (compRes.data.success) setActiveComplaints(compRes.data.data.filter((c: ComplaintSummary) => c.status !== 'CLOSED' && c.status !== 'RESOLVED'));
    } catch (err) {
      console.error('Failed to load tenant today dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayData();
  }, [tenantId, propertyId]);

  const handleAddGuestMeal = async (mealType: string) => {
    if (!tenantId) return;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await api.post('/rent/guest-meals', {
        tenantId,
        guestCount: 1,
        pricePerMeal: 100,
        mealType,
        mealDate: todayStr,
        notes: `Guest RSVP for ${mealType} on ${todayStr}`
      });
      if (res.data.success) {
        setNotification(`+1 Guest Meal added for ${mealType}! ₹100 added to your monthly rent invoice.`);
        setTimeout(() => setNotification(null), 5000);
        // Refresh profile to reflect new outstanding balance
        const profileRes = await api.get(`/tenants/${tenantId}/360`);
        if (profileRes.data.success) setTenantProfile(profileRes.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add guest meal');
    }
  };

  const handleToggleMeal = async (mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER', isAttending: boolean) => {
    if (!tenantId) return;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await api.post(`/food/confirmations/tenant/${tenantId}`, {
        date: todayStr,
        mealType,
        isAttending,
        guestCount: 0
      });
      if (res.data.success) {
        const updated = await api.get(`/food/confirmations/tenant/${tenantId}?date=${todayStr}`);
        if (updated.data.success) setConfirmations(updated.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update meal choice');
    }
  };

  const handleRateMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !ratingMeal) return;
    try {
      setIsSubmittingRating(true);
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await api.post(`/food/ratings/tenant/${tenantId}?date=${todayStr}`, {
        mealType: ratingMeal,
        rating: starCount,
        feedback: feedbackNotes
      });
      if (res.data.success) {
        alert('Thank you for rating your meal!');
        setRatingMeal(null);
        setFeedbackNotes('');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-600 font-medium text-sm">Preparing your daily overview...</p>
      </div>
    );
  }

  const getConfirmationForMeal = (mealType: string) => {
    return confirmations.find(c => c.mealType === mealType);
  };

  const hasPendingRent = (tenantProfile?.totalOutstandingBalance || 0) > 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Header Greeting Banner */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2 text-violet-200 text-xs font-black uppercase tracking-widest">
            <Sun className="w-4 h-4 text-amber-300" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white">
            Hello, {tenantProfile?.fullName || tenantProfile?.name || user?.fullName || 'Resident'}!
          </h1>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs sm:text-sm font-semibold">
            <span className="px-3.5 py-1.5 rounded-xl bg-white/20 text-white backdrop-blur-sm border border-white/20">
              Room {tenantProfile?.roomNumber || '101'} • Bed {tenantProfile?.bedLabel || 'A'}
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 flex items-center gap-1.5">
              <SparkleIcon className="w-4 h-4 text-emerald-200" />
              <span>Room Swept & Cleaned Today</span>
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-white/10 text-white/90 border border-white/10 font-medium">
              {tenantProfile?.propertyName || 'Sri Sai PG'}
            </span>
          </div>
        </div>
      </div>

      {/* Guest Meal Notification Toast */}
      {notification && (
        <div className="p-4 sm:p-5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-sm font-bold flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600 px-2">✕</button>
        </div>
      )}

      {/* Outstanding Rent Alert Card */}
      {hasPendingRent && (
        <div className="bg-rose-50 p-6 sm:p-7 rounded-3xl border border-rose-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start space-x-4 relative z-10">
            <div className="p-3.5 rounded-2xl bg-rose-100 text-rose-700 border border-rose-200 shrink-0">
              <IndianRupee className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-rose-700 block">Payment Due</span>
              <h3 className="text-xl sm:text-2xl font-black font-display text-slate-900 mt-0.5">
                Outstanding Balance: <span className="font-mono text-rose-600">₹{tenantProfile?.totalOutstandingBalance?.toLocaleString()}</span>
              </h3>
              <p className="text-sm text-slate-600 mt-1">Pay seamlessly via UPI QR code or verify offline receipts</p>
            </div>
          </div>
          <Link
            to="/tenant/rent"
            className="relative z-10 px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-black transition flex items-center justify-center space-x-2 shadow-sm active:scale-95 whitespace-nowrap"
          >
            <span>Pay Dues & Download Receipts</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Active Complaints Alert */}
      {activeComplaints.length > 0 && (
        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-800 block">Maintenance Ticket in Progress</span>
              <p className="text-sm font-semibold text-slate-800 truncate max-w-xs sm:max-w-md">{activeComplaints[0].title}</p>
            </div>
          </div>
          <Link
            to="/tenant/issues"
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-amber-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5 shrink-0 shadow-sm"
          >
            <span>Track Progress</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Meals of the Day Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 flex items-center space-x-2.5">
              <Soup className="w-6 h-6 text-emerald-600" />
              <span>Today's Dining & RSVP</span>
            </h2>
            <p className="text-sm text-slate-600 mt-1">Confirm attendance before meal cut-off time or add guest meal coupons</p>
          </div>
          <Link
            to="/tenant/meals"
            className="text-sm font-bold text-violet-600 hover:text-violet-700 flex items-center space-x-1"
          >
            <span>Weekly Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Breakfast */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-5">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                  <Coffee className="w-4 h-4" /> Breakfast
                </span>
                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  {todayMenu?.breakfastStart || '08:00'} - {todayMenu?.breakfastEnd || '10:00'}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm text-slate-800 leading-relaxed min-h-[72px] font-medium">
                {todayMenu?.breakfastItems || 'Idli, Medu Vada, Sambar, Coconut Chutney, Tea / Coffee'}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Your RSVP Status:</span>
                <span className={`font-black uppercase tracking-wider ${getConfirmationForMeal('BREAKFAST')?.isAttending ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {getConfirmationForMeal('BREAKFAST')?.isAttending ? 'Attending' : 'Skipping'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleToggleMeal('BREAKFAST', true)}
                  className={`py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center space-x-1.5 ${
                    getConfirmationForMeal('BREAKFAST')?.isAttending
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>I'm Eating</span>
                </button>
                <button
                  onClick={() => handleToggleMeal('BREAKFAST', false)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                    !getConfirmationForMeal('BREAKFAST')?.isAttending
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Skip Meal</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleAddGuestMeal('BREAKFAST')}
                  className="py-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 text-xs font-bold transition flex items-center justify-center gap-1 active:scale-95 shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" /> +1 Guest (₹100)
                </button>
                <button
                  onClick={() => setRatingMeal('BREAKFAST')}
                  className="py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition flex items-center justify-center gap-1 shadow-sm"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500" /> Rate Meal
                </button>
              </div>
            </div>
          </div>

          {/* Lunch */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-5">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <Soup className="w-4 h-4" /> Lunch
                </span>
                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  {todayMenu?.lunchStart || '12:30'} - {todayMenu?.lunchEnd || '14:30'}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm text-slate-800 leading-relaxed min-h-[72px] font-medium">
                {todayMenu?.lunchItems || 'Steamed Rice, Dal Tadka, Paneer Butter Masala, Curd, Papad'}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Your RSVP Status:</span>
                <span className={`font-black uppercase tracking-wider ${getConfirmationForMeal('LUNCH')?.isAttending ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {getConfirmationForMeal('LUNCH')?.isAttending ? 'Attending' : 'Skipping'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleToggleMeal('LUNCH', true)}
                  className={`py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center space-x-1.5 ${
                    getConfirmationForMeal('LUNCH')?.isAttending
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>I'm Eating</span>
                </button>
                <button
                  onClick={() => handleToggleMeal('LUNCH', false)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                    !getConfirmationForMeal('LUNCH')?.isAttending
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Skip Meal</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleAddGuestMeal('LUNCH')}
                  className="py-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 text-xs font-bold transition flex items-center justify-center gap-1 active:scale-95 shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" /> +1 Guest (₹100)
                </button>
                <button
                  onClick={() => setRatingMeal('LUNCH')}
                  className="py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition flex items-center justify-center gap-1 shadow-sm"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500" /> Rate Meal
                </button>
              </div>
            </div>
          </div>

          {/* Dinner */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-5">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-violet-700 flex items-center gap-1.5">
                  <Flame className="w-4 h-4" /> Dinner
                </span>
                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  {todayMenu?.dinnerStart || '19:30'} - {todayMenu?.dinnerEnd || '21:30'}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm text-slate-800 leading-relaxed min-h-[72px] font-medium">
                {todayMenu?.dinnerItems || 'Hot Phulka Rotis, Jeera Rice, Dal Fry, Mix Veg Curry, Salad'}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Your RSVP Status:</span>
                <span className={`font-black uppercase tracking-wider ${getConfirmationForMeal('DINNER')?.isAttending ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {getConfirmationForMeal('DINNER')?.isAttending ? 'Attending' : 'Skipping'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleToggleMeal('DINNER', true)}
                  className={`py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center space-x-1.5 ${
                    getConfirmationForMeal('DINNER')?.isAttending
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>I'm Eating</span>
                </button>
                <button
                  onClick={() => handleToggleMeal('DINNER', false)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                    !getConfirmationForMeal('DINNER')?.isAttending
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Skip Meal</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleAddGuestMeal('DINNER')}
                  className="py-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 text-xs font-bold transition flex items-center justify-center gap-1 active:scale-95 shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" /> +1 Guest (₹100)
                </button>
                <button
                  onClick={() => setRatingMeal('DINNER')}
                  className="py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition flex items-center justify-center gap-1 shadow-sm"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500" /> Rate Meal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meal Rating Modal */}
      {ratingMeal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 text-slate-900">
            <div>
              <h3 className="text-xl font-bold font-display text-slate-900">Rate Today's {ratingMeal}</h3>
              <p className="text-sm text-slate-600 mt-1">Share your thoughts directly with the hostel kitchen staff</p>
            </div>

            <div className="flex items-center justify-center gap-4 py-4 bg-slate-50 rounded-2xl border border-slate-200">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStarCount(star)}
                  className="p-1 transition transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-9 h-9 ${
                      star <= starCount ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              placeholder="e.g. Taste was delicious, tea could be a bit stronger..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-amber-500 resize-none placeholder:text-slate-400 font-medium"
            />

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setRatingMeal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRateMeal}
                disabled={isSubmittingRating}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-black shadow-sm transition active:scale-95"
              >
                {isSubmittingRating ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
