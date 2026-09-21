import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Trash2, 
  Scale, 
  X, 
  Coffee, 
  Soup, 
  ChefHat
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { CookDashboard } from '../../types';

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    title: 'Kitchen Command Board',
    subtitle: 'Live meal headcount, ingredient planning, and preparation status',
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    eating: 'People Eating Today',
    veg: 'Veg',
    nonveg: 'Non-Veg',
    ingredients: 'Automated Ingredients (Pax Plan)',
    startCooking: '🔥 START COOKING',
    foodReady: '🔔 MARK FOOD READY',
    mealDone: '✅ MEAL COMPLETED',
    logWaste: 'Log Leftover Waste',
    rice: 'Rice',
    dal: 'Dal / Lentils',
    veggies: 'Vegetables',
    oil: 'Cooking Oil',
    salt: 'Spices & Salt',
    wasteTitle: 'Record Leftover Food Waste',
    wasteSub: 'Helps owner optimize tomorrow\'s grocery procurement'
  },
  te: {
    title: 'వంటగది బోర్డు (Kitchen Board)',
    subtitle: 'ఈరోజు భోజనం చేసేవారి సంఖ్య & తయారీ స్థితి',
    breakfast: 'ఉదయం అల్పాహారం (Breakfast)',
    lunch: 'మధ్యాహ్న భోజనం (Lunch)',
    dinner: 'రాత్రి భోజనం (Dinner)',
    eating: 'తినేవారి సంఖ్య (Headcount)',
    veg: 'శాకాహారం (Veg)',
    nonveg: 'మాంసాహారం (Non-Veg)',
    ingredients: 'కావలసిన సరుకుల అంచనా',
    startCooking: '🔥 వంట ప్రారంభించండి',
    foodReady: '🔔 ఆహారం సిద్ధంగా ఉంది',
    mealDone: '✅ భోజనం పూర్తయింది',
    logWaste: 'మిగిలిన ఆహారాన్ని నమోదు చేయండి',
    rice: 'బియ్యం (Rice)',
    dal: 'పప్పు (Dal)',
    veggies: 'కూరగాయలు (Veggies)',
    oil: 'నూనె (Oil)',
    salt: 'ఉప్పు & మసాలాలు',
    wasteTitle: 'మిగిలిన ఆహార నమోదు',
    wasteSub: 'వృధాను తగ్గించడానికి సహాయపడుతుంది'
  },
  kn: {
    title: 'ಅಡುಗೆ ಮನೆ ಬೋರ್ಡ್ (Kitchen Board)',
    subtitle: 'ಇಂದು ಊಟ ಮಾಡುವವರ ಸಂಖ್ಯೆ ಮತ್ತು ತಯಾರಿ ಸ್ಥಿತಿ',
    breakfast: 'ಬೆಳಗಿನ ಉಪಹಾರ (Breakfast)',
    lunch: 'ಮಧ್ಯಾಹ್ನದ ಊಟ (Lunch)',
    dinner: 'ರಾತ್ರಿಯ ಊಟ (Dinner)',
    eating: 'ಊಟ ಮಾಡುವವರ ಸಂಖ್ಯೆ',
    veg: 'ಸಸ್ಯಾಹಾರಿ (Veg)',
    nonveg: 'ಮಾಂಸಾಹಾರಿ (Non-Veg)',
    ingredients: 'ಅಗತ್ಯವಿರುವ ಸಾಮಗ್ರಿಗಳ ಅಂದಾಜು',
    startCooking: '🔥 ಅಡುಗೆ ಪ್ರಾರಂಭಿಸಿ',
    foodReady: '🔔 ಆಹಾರ ಸಿದ್ಧವಾಗಿದೆ',
    mealDone: '✅ ಊಟ ಮುಕ್ತಾಯವಾಯಿತು',
    logWaste: 'ಉಳಿದ ಆಹಾರವನ್ನು ದಾಖಲಿಸಿ',
    rice: 'ಅಕ್ಕಿ (Rice)',
    dal: 'ಬೇಳೆ (Dal)',
    veggies: 'ತರಕಾರಿಗಳು (Veggies)',
    oil: 'ಎಣ್ಣೆ (Oil)',
    salt: 'ಉಪ್ಪು ಮತ್ತು ಮಸಾಲೆ',
    wasteTitle: 'ಉಳಿದ ಆಹಾರ ದಾಖಲೆ',
    wasteSub: 'ವ್ಯರ್ಥವಾಗುವುದನ್ನು ತಡೆಯಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ'
  },
  hi: {
    title: 'रसोई डैशबोर्ड (Kitchen Board)',
    subtitle: 'आज भोजन करने वालों की लाइव संख्या और तैयारी',
    breakfast: 'सुबह का नाश्ता (Breakfast)',
    lunch: 'दोपहर का भोजन (Lunch)',
    dinner: 'रात का खाना (Dinner)',
    eating: 'खाने वाले लोग',
    veg: 'शाकाहारी (Veg)',
    nonveg: 'मांसाहारी (Non-Veg)',
    ingredients: 'सामग्री का अनुमान',
    startCooking: '🔥 खाना बनाना शुरू करें',
    foodReady: '🔔 खाना तैयार है',
    mealDone: '✅ भोजन समाप्त',
    logWaste: 'बचा हुआ खाना दर्ज करें',
    rice: 'चावल (Rice)',
    dal: 'दाल (Dal)',
    veggies: 'सब्जियां (Veggies)',
    oil: 'तेल (Oil)',
    salt: 'मसाले और नमक',
    wasteTitle: 'बचे हुए भोजन का रिकॉर्ड',
    wasteSub: 'खाने की बर्बादी रोकने के लिए'
  },
  ta: {
    title: 'சமையலறை பலகை (Kitchen Board)',
    subtitle: 'இன்று சாப்பிடுபவர்களின் எண்ணிக்கை மற்றும் நிலை',
    breakfast: 'காலை உணவு (Breakfast)',
    lunch: 'மதிய உணவு (Lunch)',
    dinner: 'இரவு உணவு (Dinner)',
    eating: 'சாப்பிடுபவர்கள் எண்ணிக்கை',
    veg: 'சைவம் (Veg)',
    nonveg: 'அசைவம் (Non-Veg)',
    ingredients: 'தேவையான பொருட்கள் மதிப்பீடு',
    startCooking: '🔥 சமையலைத் தொடங்குங்கள்',
    foodReady: '🔔 உணவு தயார்',
    mealDone: '✅ உணவு முடிந்தது',
    logWaste: 'மீதமுள்ள உணவை பதிவு செய்',
    rice: 'அரிசி (Rice)',
    dal: 'பருப்பு (Dal)',
    veggies: 'காய்கறிகள் (Veggies)',
    oil: 'எண்ணெய் (Oil)',
    salt: 'மசாலா & உப்பு',
    wasteTitle: 'மீதமுள்ள உணவு பதிவு',
    wasteSub: 'உணவு வீணாவதைத் தடுக்க உதவுகிறது'
  }
};

export const CookDashboardPage: React.FC = () => {
  const { propertyId } = useAuth();
  const [dashboard, setDashboard] = useState<CookDashboard | null>(null);
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(true);

  // Food Waste Modal State
  const [selectedMealForWaste, setSelectedMealForWaste] = useState<string | null>(null);
  const [wasteLevel, setWasteLevel] = useState<'ZERO' | 'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
  const [wasteQuantityKg, setWasteQuantityKg] = useState<string>('0.5');
  const [wasteNotes, setWasteNotes] = useState('');
  const [isSubmittingWaste, setIsSubmittingWaste] = useState(false);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const fetchDashboard = async () => {
    if (!propertyId) return;
    try {
      setLoading(true);
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await api.get(`/food/cook/${propertyId}?date=${todayStr}&lang=${language}`);
      if (res.data.success) {
        setDashboard(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load cook dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [propertyId, language]);

  const handleUpdateStatus = async (mealType: string, newStatus: string) => {
    if (!propertyId) return;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await api.put(`/food/cook/${propertyId}/status/${mealType}?date=${todayStr}`, {
        status: newStatus,
        notes: `Status changed to ${newStatus}`
      });
      if (res.data.success) {
        fetchDashboard();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update cooking status');
    }
  };

  const handleRecordWaste = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId || !selectedMealForWaste) return;
    try {
      setIsSubmittingWaste(true);
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await api.post(`/food/cook/${propertyId}/waste?date=${todayStr}`, {
        mealType: selectedMealForWaste,
        wasteLevel,
        estimatedKg: parseFloat(wasteQuantityKg) || 0,
        notes: wasteNotes
      });
      if (res.data.success) {
        alert('Food waste observation saved successfully!');
        setSelectedMealForWaste(null);
        setWasteNotes('');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record waste');
    } finally {
      setIsSubmittingWaste(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-14 h-14 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-amber-600 font-black text-xl font-display">Loading Kitchen Live Board...</p>
      </div>
    );
  }

  const meals = [
    { key: 'BREAKFAST', label: t.breakfast, data: dashboard?.breakfast, icon: <Coffee className="w-7 h-7 text-amber-600" /> },
    { key: 'LUNCH', label: t.lunch, data: dashboard?.lunch, icon: <Soup className="w-7 h-7 text-emerald-600" /> },
    { key: 'DINNER', label: t.dinner, data: dashboard?.dinner, icon: <Flame className="w-7 h-7 text-violet-600" /> }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* High-Contrast Top Banner & Multi-language selector */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight flex items-center gap-3">
            <ChefHat className="w-9 h-9 text-slate-950" />
            <span>{t.title}</span>
          </h1>
          <p className="text-sm sm:text-base font-bold text-slate-950/90 mt-1">{t.subtitle}</p>
        </div>

        {/* Large Touch Language Switcher */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950/20 p-2 rounded-2xl backdrop-blur-sm">
          {[
            { code: 'en', label: 'English' },
            { code: 'te', label: 'తెలుగు' },
            { code: 'kn', label: 'ಕನ್ನಡ' },
            { code: 'hi', label: 'हिन्दी' },
            { code: 'ta', label: 'தமிழ்' }
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`px-4 py-2.5 rounded-xl text-sm sm:text-base font-black transition-all active:scale-95 ${
                language === lang.code 
                  ? 'bg-slate-950 text-amber-400 shadow-sm scale-105' 
                  : 'text-slate-950 hover:bg-slate-950/10'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3 Giant Meal Cards for Cooks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {meals.map((m) => {
          const count = m.data?.confirmedCount || 0;
          const status = m.data?.prepStatus || 'PLANNED';
          const menuText = m.data?.menuText || 'Menu items configured by owner';

          // Rule-based ingredient calculations
          const riceKg = (count * 0.12).toFixed(1);
          const dalKg = (count * 0.04).toFixed(1);
          const vegKg = (count * 0.15).toFixed(1);
          const oilLtr = (count * 0.02).toFixed(1);

          return (
            <div 
              key={m.key} 
              className={`rounded-3xl border-2 p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6 transition-all ${
                status === 'READY' 
                  ? 'bg-emerald-50/80 border-emerald-400 text-slate-900' 
                  : status === 'COOKING' 
                  ? 'bg-amber-50/80 border-amber-400 text-slate-900' 
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="space-y-5">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
                      {m.icon}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black font-display tracking-wide text-slate-900">{m.label}</h2>
                  </div>
                  <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${
                    status === 'READY' ? 'bg-emerald-600 text-white animate-pulse shadow-sm' :
                    status === 'COOKING' ? 'bg-amber-500 text-slate-950 shadow-sm' :
                    status === 'COMPLETED' ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {status}
                  </span>
                </div>

                {/* Big Headcount Box */}
                <div className="text-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-black uppercase text-slate-500 tracking-wider block">
                    {t.eating}
                  </span>
                  <div className="text-6xl sm:text-7xl font-black text-amber-700 my-2 font-mono tracking-tight">
                    {count}
                  </div>
                  <div className="flex justify-center gap-3 text-xs sm:text-sm font-bold text-slate-700 mt-3">
                    <span className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200">
                      🟢 {t.veg}: <span className="font-mono font-bold">{m.data?.vegCount || count}</span>
                    </span>
                    <span className="bg-rose-50 text-rose-800 px-3 py-1.5 rounded-xl border border-rose-200">
                      🔴 {t.nonveg}: <span className="font-mono font-bold">{m.data?.nonVegCount || 0}</span>
                    </span>
                  </div>
                </div>

                {/* Menu Description */}
                <div className="text-sm font-semibold text-slate-800 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm leading-relaxed">
                  {menuText}
                </div>

                {/* Rule-Based Ingredient Estimates */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <span className="text-xs font-black uppercase text-amber-800 tracking-wider flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-600" />
                    {t.ingredients}
                  </span>
                  <div className="grid grid-cols-2 gap-2.5 text-xs font-bold text-slate-700 pt-1">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                      <span>🍚 {t.rice}:</span>
                      <span className="text-amber-800 font-mono font-black text-sm">{riceKg} kg</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                      <span>🥣 {t.dal}:</span>
                      <span className="text-amber-800 font-mono font-black text-sm">{dalKg} kg</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                      <span>🥕 {t.veggies}:</span>
                      <span className="text-amber-800 font-mono font-black text-sm">{vegKg} kg</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                      <span>🛢️ {t.oil}:</span>
                      <span className="text-amber-800 font-mono font-black text-sm">{oilLtr} L</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Touch Friendly Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                {status === 'PLANNED' && (
                  <button
                    onClick={() => handleUpdateStatus(m.key, 'COOKING')}
                    className="w-full py-4 sm:py-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-lg rounded-2xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>{t.startCooking}</span>
                  </button>
                )}

                {status === 'COOKING' && (
                  <button
                    onClick={() => handleUpdateStatus(m.key, 'READY')}
                    className="w-full py-4 sm:py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg rounded-2xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>{t.foodReady}</span>
                  </button>
                )}

                {status === 'READY' && (
                  <button
                    onClick={() => handleUpdateStatus(m.key, 'COMPLETED')}
                    className="w-full py-4 sm:py-5 bg-violet-600 hover:bg-violet-500 text-white font-black text-lg rounded-2xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>{t.mealDone}</span>
                  </button>
                )}

                {status === 'COMPLETED' && (
                  <div className="w-full py-3.5 bg-slate-100 border border-slate-200 text-slate-600 font-bold text-center text-sm rounded-2xl">
                    ✅ {t.mealDone}
                  </div>
                )}

                {/* Waste log modal trigger */}
                <button
                  onClick={() => setSelectedMealForWaste(m.key)}
                  className="w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition active:scale-95 shadow-sm"
                >
                  <Trash2 className="w-4 h-4 text-amber-600" />
                  <span>{t.logWaste}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Food Waste Log Modal */}
      {selectedMealForWaste && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div>
                <h3 className="font-bold font-display text-amber-700 text-xl">{t.wasteTitle}</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">{t.wasteSub}</p>
              </div>
              <button onClick={() => setSelectedMealForWaste(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleRecordWaste} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Leftover Volume Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['ZERO', 'LOW', 'MEDIUM', 'HIGH'] as const).map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setWasteLevel(lvl)}
                      className={`py-3 text-xs font-black rounded-xl border transition-all ${
                        wasteLevel === lvl
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm scale-105'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1.5">Estimated Leftover Weight (Kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={wasteQuantityKg}
                  onChange={(e) => setWasteQuantityKg(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xl font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1.5">Cook Observation Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Rice was finished completely, dal had 0.5kg extra"
                  value={wasteNotes}
                  onChange={(e) => setWasteNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-sm focus:outline-none focus:border-amber-500 placeholder:text-slate-400 font-medium"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMealForWaste(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWaste}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm shadow-sm transition active:scale-95"
                >
                  {isSubmittingWaste ? 'Saving...' : 'Save Waste Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
