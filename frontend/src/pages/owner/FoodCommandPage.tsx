import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CookDashboard, MenuResponse } from '../../types';
import api from '../../api/client';
import { 
  UtensilsCrossed, 
  Calendar, 
  Check, 
  Save, 
  Sparkles, 
  AlertCircle, 
  ChefHat, 
  Flame, 
  Clock, 
  Users, 
  TrendingUp, 
  Soup, 
  Coffee, 
  Scale
} from 'lucide-react';

export const FoodCommandPage: React.FC = () => {
  const { propertyId } = useAuth();
  const [menuDate, setMenuDate] = useState(new Date().toISOString().split('T')[0]);
  const [dashboard, setDashboard] = useState<CookDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  // Menu form state
  const [breakfastItems, setBreakfastItems] = useState('Idli, Medu Vada, Sambar, Coconut Chutney, Filter Coffee / Tea');
  const [breakfastStart, setBreakfastStart] = useState('08:00');
  const [breakfastEnd, setBreakfastEnd] = useState('10:00');

  const [lunchItems, setLunchItems] = useState('Steamed Sona Masoori Rice, Tomato Dal, Paneer Butter Masala, Curd, Roasted Papad, Pickle');
  const [lunchStart, setLunchStart] = useState('12:30');
  const [lunchEnd, setLunchEnd] = useState('14:30');

  const [dinnerItems, setDinnerItems] = useState('Hot Phulka Rotis (Unlimited), Mix Veg Kadai, Jeera Rice, Dal Tadka, Green Salad');
  const [dinnerStart, setDinnerStart] = useState('19:30');
  const [dinnerEnd, setDinnerEnd] = useState('21:30');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFoodData();
  }, [propertyId, menuDate]);

  const fetchFoodData = async () => {
    try {
      setLoading(true);
      if (propertyId) {
        const [dashRes, menuRes] = await Promise.all([
          api.get(`/food/cook/${propertyId}?date=${menuDate}`),
          api.get(`/food/menu/${propertyId}?date=${menuDate}`),
        ]);

        if (dashRes.data.success) {
          setDashboard(dashRes.data.data);
        }
        if (menuRes.data.success && menuRes.data.data.id) {
          const m: MenuResponse = menuRes.data.data;
          setBreakfastItems(m.breakfastItems || '');
          setBreakfastStart(m.breakfastStart || '08:00');
          setBreakfastEnd(m.breakfastEnd || '10:00');
          setLunchItems(m.lunchItems || '');
          setLunchStart(m.lunchStart || '12:30');
          setLunchEnd(m.lunchEnd || '14:30');
          setDinnerItems(m.dinnerItems || '');
          setDinnerStart(m.dinnerStart || '19:30');
          setDinnerEnd(m.dinnerEnd || '21:30');
        }
      }
    } catch (err) {
      console.error('Error fetching food command center data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.post(`/food/menu/${propertyId}`, {
        menuDate,
        breakfastItems,
        breakfastStart,
        breakfastEnd,
        lunchItems,
        lunchStart,
        lunchEnd,
        dinnerItems,
        dinnerStart,
        dinnerEnd,
        isPublished: true,
      });

      if (res.data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3500);
        fetchFoodData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save menu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 animate-fade-in font-sans">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-amber-600 text-xs font-black uppercase tracking-wider mb-1.5">
            <ChefHat className="w-4 h-4" />
            <span>Kitchen Command & Headcount</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
            Food & Dining Command
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Configure daily menus, monitor live pax headcounts, and optimize grocery procurement.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-300 p-2.5 rounded-2xl shadow-sm">
          <Calendar className="w-4 h-4 text-amber-600 ml-1.5" />
          <input
            type="date"
            value={menuDate}
            onChange={(e) => setMenuDate(e.target.value)}
            className="bg-transparent text-sm font-bold text-slate-900 outline-none cursor-pointer pr-2 font-mono"
          />
        </div>
      </div>

      {/* Live Kitchen Preparation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {(dashboard?.meals || []).map((meal) => {
          const isBreakfast = meal.mealType === 'BREAKFAST';
          const isLunch = meal.mealType === 'LUNCH';
          const icon = isBreakfast ? <Coffee className="w-5 h-5 text-amber-600" /> : isLunch ? <Soup className="w-5 h-5 text-emerald-600" /> : <Flame className="w-5 h-5 text-indigo-600" />;
          const accentBorder = isBreakfast ? 'border-amber-200' : isLunch ? 'border-emerald-200' : 'border-indigo-200';
          const badgeStyle = meal.status === 'COMPLETED' 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : meal.status === 'READY'
            ? 'bg-sky-50 text-sky-700 border-sky-200 animate-pulse'
            : meal.status === 'IN_PREPARATION'
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : 'bg-slate-100 text-slate-600 border-slate-200';

          return (
            <div
              key={meal.mealType}
              className={`p-6 rounded-3xl bg-white border ${accentBorder} shadow-sm space-y-4 hover:shadow-md transition-all`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
                    {icon}
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 uppercase tracking-wider font-display">{meal.title || meal.mealType}</h2>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium font-mono mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {meal.timing || 'Standard Timings'}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-xl border ${badgeStyle}`}>
                  {(meal.status || 'PLANNED').replace('_', ' ')}
                </span>
              </div>

              {/* Headcount Stat */}
              <div className="flex items-baseline justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-black text-slate-900 font-display tabular-nums">{meal.confirmedCount || 0}</span>
                    <span className="text-sm font-bold text-slate-500">/ {meal.expectedCount || 0} pax</span>
                  </div>
                  <p className="text-xs font-bold text-emerald-600 mt-1">Confirmed RSVP</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="flex items-center space-x-1.5 text-slate-700 text-xs font-bold">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Veg: {meal.vegCount || meal.confirmedCount || 0}</span>
                  </div>
                  <span className="text-xs text-rose-600 font-semibold mt-0.5">
                    Non-Veg: {meal.nonVegCount || 0}
                  </span>
                </div>
              </div>

              {/* Rule-Based Ingredient Estimates */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5"><Scale className="w-4 h-4 text-amber-600" /> Procurement Weight</span>
                  <span className="text-[11px] text-slate-400 font-mono">for {meal.expectedCount || 0} pax</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {(meal.ingredients || []).map((ing, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-700 font-medium truncate pr-1 text-xs">{ing.name}</span>
                      <span className="font-bold text-amber-700 text-xs whitespace-nowrap font-mono">{ing.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Menu Builder Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center space-x-2 text-emerald-600 text-xs font-black uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Live Notification Broadcast</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 font-display">Daily Menu Configurator ({menuDate})</h2>
            <p className="text-sm text-slate-600 mt-0.5 font-medium">Publishing the menu updates resident mobile apps in real-time</p>
          </div>

          {savedSuccess && (
            <div className="px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Menu Saved & Broadcasted!</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveMenu} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Breakfast Card */}
            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5 font-display">
                    <Coffee className="w-4 h-4 text-amber-600" /> Breakfast
                  </span>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-bold font-mono">
                    <input
                      type="text"
                      value={breakfastStart}
                      onChange={(e) => setBreakfastStart(e.target.value)}
                      className="w-16 bg-white border border-amber-300 rounded-xl px-2 py-1 text-center text-slate-900"
                    />
                    <span>-</span>
                    <input
                      type="text"
                      value={breakfastEnd}
                      onChange={(e) => setBreakfastEnd(e.target.value)}
                      className="w-16 bg-white border border-amber-300 rounded-xl px-2 py-1 text-center text-slate-900"
                    />
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={breakfastItems}
                  onChange={(e) => setBreakfastItems(e.target.value)}
                  placeholder="e.g. Idli, Vada, Sambar, Coconut Chutney, Coffee / Tea"
                  className="w-full bg-white border border-amber-200 rounded-2xl p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-600 resize-none leading-relaxed font-medium shadow-sm"
                />
              </div>
            </div>

            {/* Lunch Card */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 font-display">
                    <Soup className="w-4 h-4 text-emerald-600" /> Lunch
                  </span>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-bold font-mono">
                    <input
                      type="text"
                      value={lunchStart}
                      onChange={(e) => setLunchStart(e.target.value)}
                      className="w-16 bg-white border border-emerald-300 rounded-xl px-2 py-1 text-center text-slate-900"
                    />
                    <span>-</span>
                    <input
                      type="text"
                      value={lunchEnd}
                      onChange={(e) => setLunchEnd(e.target.value)}
                      className="w-16 bg-white border border-emerald-300 rounded-xl px-2 py-1 text-center text-slate-900"
                    />
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={lunchItems}
                  onChange={(e) => setLunchItems(e.target.value)}
                  placeholder="e.g. Rice, Dal Tadka, Paneer Butter Masala, Curd, Papad"
                  className="w-full bg-white border border-emerald-200 rounded-2xl p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 resize-none leading-relaxed font-medium shadow-sm"
                />
              </div>
            </div>

            {/* Dinner Card */}
            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-800 flex items-center gap-1.5 font-display">
                    <Flame className="w-4 h-4 text-indigo-600" /> Dinner
                  </span>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-bold font-mono">
                    <input
                      type="text"
                      value={dinnerStart}
                      onChange={(e) => setDinnerStart(e.target.value)}
                      className="w-16 bg-white border border-indigo-300 rounded-xl px-2 py-1 text-center text-slate-900"
                    />
                    <span>-</span>
                    <input
                      type="text"
                      value={dinnerEnd}
                      onChange={(e) => setDinnerEnd(e.target.value)}
                      className="w-16 bg-white border border-indigo-300 rounded-xl px-2 py-1 text-center text-slate-900"
                    />
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={dinnerItems}
                  onChange={(e) => setDinnerItems(e.target.value)}
                  placeholder="e.g. Phulka Rotis, Jeera Rice, Dal Fry, Kadai Paneer, Salad"
                  className="w-full bg-white border border-indigo-200 rounded-2xl p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 resize-none leading-relaxed font-medium shadow-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black rounded-2xl text-base transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 active:scale-[0.99] disabled:opacity-50"
          >
            {saving ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span className="tracking-wide uppercase font-display">SAVE & BROADCAST TODAY'S MENU TO ALL TENANTS</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
