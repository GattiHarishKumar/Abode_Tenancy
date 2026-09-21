import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Printer, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  MapPin, 
  Wifi, 
  Utensils, 
  Bed
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { PropertySummary } from '../../types';

export const QRSettingsPage: React.FC = () => {
  const { propertyId } = useAuth();
  const [property, setProperty] = useState<PropertySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) return;
      try {
        setLoading(true);
        const res = await api.get(`/properties/${propertyId}`);
        if (res.data.success) {
          setProperty(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load property details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId]);

  const slug = property?.slug || 'sri-sai-pg-marathahalli';
  const publicUrl = `${window.location.origin}/p/${slug}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-600 font-medium text-sm">Generating Gate QR and Flyer...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner (hidden on print) */}
      <div className="print:hidden bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center space-x-2 text-violet-700 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-violet-50 border border-violet-200 mb-3">
            <QrCode className="w-3.5 h-3.5" />
            <span>Smart Entrance Automation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">Gate QR Code & Printable Flyer</h1>
          <p className="text-base text-slate-600 mt-1">
            Display this QR flyer at your reception or main gate for instant visitor inquiries, live room previews, and online paperless KYC onboarding.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            onClick={handleCopyUrl}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-800 text-sm font-bold rounded-2xl border border-slate-200 transition active:scale-95 shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
          </button>

          <a
            href={`/p/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-violet-50 hover:bg-violet-100 text-violet-700 text-sm font-bold rounded-2xl border border-violet-200 transition active:scale-95 shadow-sm"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Preview Page</span>
          </a>

          <button
            onClick={handlePrint}
            className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-black rounded-2xl shadow-sm transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Gate Flyer (A4)</span>
          </button>
        </div>
      </div>

      {/* Printable Poster Layout */}
      <div className="max-w-xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-lg border-2 border-slate-200 text-center space-y-6 print:shadow-none print:border-none print:m-0 print:p-6 print:max-w-none text-slate-900">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-violet-200">
          <Sparkles className="w-4 h-4 text-violet-600" />
          Abode Tenancy Verified PG
        </div>

        <div>
          <h2 className="text-3xl sm:text-4xl font-black font-display text-slate-900 tracking-tight">{property?.name || 'Sri Sai Luxury PG'}</h2>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-600 mt-2 font-medium">
            <MapPin className="w-4 h-4 text-violet-600 shrink-0" />
            <span>{property?.address || 'Marathahalli Main Road'}, {property?.city || 'Bangalore'}</span>
          </div>
        </div>

        {/* QR Code Card */}
        <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl inline-block border border-slate-200 shadow-inner">
          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 inline-block">
            <QRCodeSVG 
              value={publicUrl} 
              size={240} 
              level="H" 
              includeMargin={true}
            />
          </div>
          <p className="text-xs font-black text-slate-900 mt-4 uppercase tracking-wider">
            Scan with any Camera or QR App
          </p>
          <span className="text-xs text-slate-500 block mt-0.5 font-medium">Instant Vacancy Check • Apply Online</span>
        </div>

        {/* Highlight Badges */}
        <div className="grid grid-cols-3 gap-3 text-left max-w-lg mx-auto bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-slate-500 uppercase">
              <Bed className="w-4 h-4 text-violet-600" /> Sharing
            </div>
            <div className="text-sm font-black text-slate-900">Single, 2 & 3</div>
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-slate-500 uppercase">
              <Utensils className="w-4 h-4 text-emerald-600" /> Food
            </div>
            <div className="text-sm font-black text-slate-900">3x Daily Homely</div>
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-slate-500 uppercase">
              <Wifi className="w-4 h-4 text-sky-600" /> Internet
            </div>
            <div className="text-sm font-black text-slate-900">300 Mbps Fiber</div>
          </div>
        </div>

        {/* Step Guide for Walk-in Prospective Tenants */}
        <div className="pt-2 text-xs text-slate-600 space-y-2 max-w-md mx-auto">
          <p className="font-bold text-slate-900 text-sm">How to explore or book a bed:</p>
          <div className="grid grid-cols-3 gap-2 text-xs pt-1 text-slate-700">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-black text-violet-700 block">1. Scan</span>
              <span className="text-[11px]">Open camera & point at QR</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-black text-violet-700 block">2. View</span>
              <span className="text-[11px]">Check room photos & rates</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-black text-violet-700 block">3. Apply</span>
              <span className="text-[11px]">Submit details to book</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Powered by Abode Tenancy</span>
          <span className="font-mono text-[11px] truncate max-w-[240px]">{publicUrl}</span>
        </div>
      </div>
    </div>
  );
};
