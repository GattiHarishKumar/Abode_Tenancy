import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Check, 
  X, 
  Coffee, 
  Soup, 
  Flame, 
  Clock, 
  Sliders
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { MenuResponse, MealConfirmationItem } from '../../types';

export const TenantMealsPage: React.FC = () => {
  const { user, propertyId } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [menu, setMenu] = useState<MenuResponse | null>(null);
  const [confirmations, setConfirmations] = useState<MealConfirmationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto preferences state
  const [autoWeekdayLunch, setAutoWeekdayLunch] = useState(false);
  const [dietaryPreference, setDietaryPreference] = useState<'VEG' | 'NON_VEG'>('VEG');

  const tenantId = user?.tenantId;

  const fetchMenuAndConfirmations = async () => {
    if (!propertyId || !tenantId) return;
    try {
      setLoading(true);
      const [menuRes, confRes] = await Promise.all([
        api.get(`/food/menu/${propertyId}?date=${selectedDate}`),
        api.get(`/food/confirmations/tenant/${tenantId}?date=${selectedDate}`)
      ]);
      if (menuRes.data.success) setMenu(menuRes.data.data);
      if (confRes.data.success) setConfirmations(confRes.data.data);
    } catch (err) {
      console.error('Failed to load menu data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuAndConfirmations();
  }, [selectedDate, propertyId, tenantId]);

  const handleToggleMeal = async (mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER', isAttending: boolean) => {
    if (!tenantId) return;
    try {
      const res = await api.post(`/food/confirmations/tenant/${tenantId}`, {
        date: selectedDate,
        mealType,
        isAttending,
        guestCount: 0
      });
      if (res.data.success) {
        const updated = await api.get(`/food/confirmations/tenant/${tenantId}?date=${selectedDate}`);
        if (updated.data.success) setConfirmations(updated.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update meal confirmation');
    }
  };

  // Generate next 7 days dates helper
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const getConfirmation = (mealType: string) => {
    return confirmations.find(c => c.mealType === mealType);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 text-emerald-700 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <span>Dining Schedule & RSVP</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">Weekly Menu & Meal Planner</h1>
          <p className="text-base text-slate-600 mt-1 max-w-xl">
            Plan your dining ahead to help the kitchen procure fresh ingredients and prevent unnecessary food wastage.
          </p>
        </div>
      </div>

      {/* Date Horizontal Selector */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {dates.map((dStr, idx) => {
          const d = new Date(dStr);
          const isSelected = dStr === selectedDate;
          const dayName = idx === 0 ? 'Today' : idx === 1 ? 'Tmrw' : d.toLocaleDateString('en-US', { weekday: 'short' });
          const dayDate = d.getDate();
          const monthName = d.toLocaleDateString('en-US', { month: 'short' });

          return (
            <button
              key={dStr}
              onClick={() => setSelectedDate(dStr)}
              className={`flex-1 min-w-[90px] py-4 px-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center active:scale-95 shadow-sm ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 font-black scale-105 shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              <span className={`text-[11px] font-black uppercase tracking-wider ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                {dayName}
              </span>
              <span className={`text-2xl font-black font-mono mt-0.5 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                {dayDate}
              </span>
              <span className={`text-xs font-bold ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                {monthName}
              </span>
            </button>
          );
        })}
      </div>

      {/* Meals Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600 text-sm font-medium">Loading meal schedule...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              type: 'BREAKFAST' as const, 
              label: 'Breakfast', 
              start: menu?.breakfastStart || '08:00', 
              end: menu?.breakfastEnd || '10:00', 
              items: menu?.breakfastItems || 'Idli, Medu Vada, Sambar, Coconut Chutney, Coffee / Tea', 
              icon: <Coffee className="w-5 h-5 text-amber-600" />
            },
            { 
              type: 'LUNCH' as const, 
              label: 'Lunch', 
              start: menu?.lunchStart || '12:30', 
              end: menu?.lunchEnd || '14:30', 
              items: menu?.lunchItems || 'Steamed Sona Masoori Rice, Dal Tadka, Paneer Butter Masala, Curd, Roasted Papad', 
              icon: <Soup className="w-5 h-5 text-emerald-600" />
            },
            { 
              type: 'DINNER' as const, 
              label: 'Dinner', 
              start: menu?.dinnerStart || '19:30', 
              end: menu?.dinnerEnd || '21:30', 
              items: menu?.dinnerItems || 'Hot Phulka Rotis (Unlimited), Mix Veg Curry, Jeera Rice, Dal Fry, Fresh Salad', 
              icon: <Flame className="w-5 h-5 text-violet-600" />
            }
          ].map((meal) => {
            const conf = getConfirmation(meal.type);
            const isAttending = conf ? conf.isAttending : true;

            return (
              <div 
                key={meal.type} 
                className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-5 hover:border-slate-300 transition-all"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        {meal.icon}
                      </div>
                      <div>
                        <span className="text-base font-black font-display uppercase text-slate-900 tracking-wider block">{meal.label}</span>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 font-mono mt-0.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{meal.start} - {meal.end}</span>
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Homely Prep
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 min-h-[85px] text-sm font-medium text-slate-800 leading-relaxed">
                    {meal.items}
                  </div>
                </div>

                {/* RSVP Controls */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Your RSVP Status:</span>
                    <span className={`font-black uppercase tracking-wider ${isAttending ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {isAttending ? 'Attending' : 'Skipping'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleToggleMeal(meal.type, true)}
                      className={`py-3 rounded-xl text-xs font-black transition flex items-center justify-center space-x-1.5 active:scale-95 ${
                        isAttending
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>I'm Eating</span>
                    </button>
                    <button
                      onClick={() => handleToggleMeal(meal.type, false)}
                      className={`py-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 active:scale-95 ${
                        !isAttending
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <X className="w-4 h-4" />
                      <span>Skip Meal</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Auto Preference Settings Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-violet-50 border border-violet-200 text-violet-700">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-slate-900">Dietary & Automated Skip Preferences</h3>
            <p className="text-sm text-slate-600">Set recurring preferences to automate RSVPs for regular weekday office schedules</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 text-sm block">Auto-Skip Weekday Lunch (Mon-Fri)</span>
              <span className="text-xs text-slate-500 mt-0.5 block">For working professionals dining at office cafeteria</span>
            </div>
            <button
              onClick={() => setAutoWeekdayLunch(!autoWeekdayLunch)}
              className={`w-14 h-7 flex items-center rounded-full p-1 transition duration-300 ${
                autoWeekdayLunch ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="bg-white w-5 h-5 rounded-full shadow-md transform transition" />
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 text-sm block">Standard Dietary Choice</span>
              <span className="text-xs text-slate-500 mt-0.5 block">Shared automatically with kitchen headcounts</span>
            </div>
            <div className="flex bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
              <button
                onClick={() => setDietaryPreference('VEG')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                  dietaryPreference === 'VEG' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm' : 'text-slate-600'
                }`}
              >
                Veg
              </button>
              <button
                onClick={() => setDietaryPreference('NON_VEG')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                  dietaryPreference === 'NON_VEG' ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-sm' : 'text-slate-600'
                }`}
              >
                Non-Veg
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
