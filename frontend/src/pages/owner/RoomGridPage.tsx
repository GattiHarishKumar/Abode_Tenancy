import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Filter, 
  Search, 
  CheckCircle2, 
  X, 
  UserPlus, 
  Home, 
  Sparkles,
  Snowflake,
  Wind,
  Sun,
  ShowerHead,
  Clock,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Check,
  Sparkle
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { RoomSummary, BedItem, NoticePeriodItem } from '../../types';

export const RoomGridPage: React.FC = () => {
  const { propertyId } = useAuth();
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [noticeTenants, setNoticeTenants] = useState<NoticePeriodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFloor, setSelectedFloor] = useState<number | 'ALL'>('ALL');
  const [featureFilter, setFeatureFilter] = useState<'ALL' | 'AC' | 'NON_AC' | 'BALCONY' | 'CLEANING_DUE'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Bed allocation modal
  const [selectedBed, setSelectedBed] = useState<{ room: RoomSummary; bed: BedItem } | null>(null);
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [isAllocating, setIsAllocating] = useState(false);

  const fetchRoomsAndNotice = async () => {
    if (!propertyId) return;
    try {
      setLoading(true);
      const [roomsRes, noticeRes] = await Promise.all([
        api.get(`/rooms/property/${propertyId}`),
        api.get(`/tenants/property/${propertyId}/notice-period`)
      ]);
      if (roomsRes.data.success) {
        setRooms(roomsRes.data.data);
      }
      if (noticeRes.data.success) {
        setNoticeTenants(noticeRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load rooms and notice period data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomsAndNotice();
  }, [propertyId]);

  const handleToggleCleaning = async (roomId: string, currentCleaned?: boolean) => {
    try {
      const res = await api.put(`/rooms/${roomId}/cleaning-status?isCleaned=${!currentCleaned}`);
      if (res.data.success) {
        fetchRoomsAndNotice();
      }
    } catch (err: any) {
      alert('Failed to update cleaning status');
    }
  };

  const handleAllocateBed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBed || !propertyId) return;
    try {
      setIsAllocating(true);
      const res = await api.post(`/tenants/property/${propertyId}/onboard`, {
        fullName: tenantName,
        phone: tenantPhone,
        roomId: selectedBed.room.id,
        bedId: selectedBed.bed.id,
        joiningDate: new Date().toISOString().split('T')[0],
        rentAmount: selectedBed.room.baseRent,
        depositAmount: 10000
      });
      if (res.data.success) {
        alert('Tenant allocated to bed successfully!');
        setSelectedBed(null);
        setTenantName('');
        setTenantPhone('');
        fetchRoomsAndNotice();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to allocate bed');
    } finally {
      setIsAllocating(false);
    }
  };

  const filteredRooms = rooms.filter((r) => {
    const matchesFloor = selectedFloor === 'ALL' || r.floorNumber === selectedFloor;
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesSearch = r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFeature = true;
    if (featureFilter === 'AC') matchesFeature = Boolean(r.isAc);
    else if (featureFilter === 'NON_AC') matchesFeature = !r.isAc;
    else if (featureFilter === 'BALCONY') matchesFeature = Boolean(r.hasBalcony);
    else if (featureFilter === 'CLEANING_DUE') matchesFeature = !r.isCleanedToday;

    return matchesFloor && matchesStatus && matchesSearch && matchesFeature;
  });

  const floors = Array.from(new Set(rooms.map((r) => r.floorNumber))).sort((a, b) => a - b);
  const totalCleaned = rooms.filter((r) => r.isCleanedToday).length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in font-sans">
      {/* Top Header Controls */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 text-xs font-black uppercase tracking-wider mb-1.5">
            <Building2 className="w-4 h-4" />
            <span>Digital Bed & Room Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
            Interactive Room Matrix
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Real-time floor inventory, AC/Balcony filters, daily housekeeping status, and 1-click bed allocations.
          </p>
        </div>

        {/* Floor Switcher Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            onClick={() => setSelectedFloor('ALL')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
              selectedFloor === 'ALL'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            All Floors ({rooms.length})
          </button>
          {floors.map((floor) => (
            <button
              key={floor}
              onClick={() => setSelectedFloor(floor)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
                selectedFloor === floor
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Floor {floor}
            </button>
          ))}
        </div>
      </div>

      {/* Housekeeping Summary & Notice Period Pipeline Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Housekeeping tracker banner */}
        <div className="p-6 rounded-3xl bg-teal-50/70 border border-teal-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-black uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Daily Housekeeping
            </span>
            <div className="text-3xl font-black text-slate-900 font-display tabular-nums">
              {totalCleaned} <span className="text-sm font-semibold text-slate-500">/ {rooms.length} Cleaned</span>
            </div>
            <p className="text-xs text-slate-600 font-medium">Click the sparkle badge on any room to toggle housekeeping</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-xl shadow-md font-display tabular-nums">
            {rooms.length > 0 ? Math.round((totalCleaned / rooms.length) * 100) : 0}%
          </div>
        </div>

        {/* Notice Period Pipeline Widget */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-amber-50/70 border border-amber-200 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Notice Period Pipeline ({noticeTenants.length} Vacating Soon)
            </span>
            <span className="text-xs text-amber-800 font-black bg-amber-200/60 px-3 py-1 rounded-full">Open for Pre-booking</span>
          </div>

          {noticeTenants.length === 0 ? (
            <div className="text-sm text-slate-600 py-1">No active vacating notices. All tenancies stable.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {noticeTenants.map((item) => (
                <div key={item.tenantId} className="p-3.5 rounded-2xl bg-white border border-amber-300 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-900 block font-display">
                      Room {item.roomNumber} ({item.bedLabel}) • {item.tenantName}
                    </span>
                    <span className="text-xs text-amber-700 font-bold block mt-0.5">
                      ⏳ Vacating in {item.daysRemaining} days ({item.vacatingDate})
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 text-xs font-black uppercase border border-amber-300">
                    On Notice
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feature Filter Pills & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'All Rooms' },
            { id: 'AC', label: 'AC ❄️' },
            { id: 'NON_AC', label: 'Non-AC 🌀' },
            { id: 'BALCONY', label: 'Balcony 🌅' },
            { id: 'CLEANING_DUE', label: 'Cleaning Due 🧹' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFeatureFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                featureFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-black'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search room number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 font-medium"
          />
        </div>
      </div>

      {/* Room Matrix Cards Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-sm font-medium">Loading visual room inventory...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="py-20 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <Building2 className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <p className="font-bold text-base text-slate-800">No rooms matching the selected filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {filteredRooms.map((room) => {
            const isFull = room.occupiedBeds === room.totalBeds;
            const isFree = room.occupiedBeds === 0;

            return (
              <div 
                key={room.id}
                className={`bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-200 space-y-4 border ${
                  isFull 
                    ? 'border-slate-200' 
                    : isFree 
                    ? 'border-emerald-300 hover:border-emerald-500' 
                    : 'border-indigo-300 hover:border-indigo-500'
                }`}
              >
                {/* Room Header */}
                <div className="flex items-start justify-between border-b border-slate-200 pb-3.5">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-500">Floor {room.floorNumber}</span>
                      {room.isAc ? (
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
                          <Snowflake className="w-3 h-3" /> AC
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600">Non-AC</span>
                      )}
                      {room.hasBalcony && (
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Balcony
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mt-1.5 font-display">Room {room.roomNumber}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-emerald-600 block font-mono">₹{room.baseRent.toLocaleString()}</span>
                    <span className="text-xs text-slate-500 font-semibold">{room.sharingType} Sharing</span>
                  </div>
                </div>

                {/* Bed Slots */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-500">
                    <span>Bed Slots ({room.occupiedBeds}/{room.totalBeds})</span>
                    <button
                      onClick={() => handleToggleCleaning(room.id, room.isCleanedToday)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition active:scale-95 ${
                        room.isCleanedToday 
                          ? 'bg-teal-50 text-teal-700 border border-teal-200' 
                          : 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                      }`}
                      title="Click to toggle room housekeeping status"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{room.isCleanedToday ? 'Cleaned' : 'Cleaning Due'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {room.beds.map((bed) => {
                      const isOccupied = bed.status === 'OCCUPIED';
                      return (
                        <div
                          key={bed.id}
                          onClick={() => !isOccupied && setSelectedBed({ room, bed })}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            isOccupied
                              ? bed.isOnNotice 
                                ? 'bg-amber-50 border-amber-300 text-amber-900'
                                : 'bg-slate-50 border-slate-200 text-slate-800'
                              : 'bg-emerald-50 hover:bg-emerald-100/70 border-emerald-300 hover:border-emerald-500 cursor-pointer text-emerald-800 shadow-sm active:scale-95'
                          }`}
                        >
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="font-display">Bed {bed.bedLabel}</span>
                            <span className={`w-2.5 h-2.5 rounded-full ${
                              isOccupied 
                                ? bed.isOnNotice ? 'bg-amber-500 animate-pulse' : 'bg-slate-400' 
                                : 'bg-emerald-500 animate-pulse'
                            }`} />
                          </div>
                          <div className="text-xs truncate mt-1 text-slate-600 font-medium">
                            {isOccupied 
                              ? bed.isOnNotice 
                                ? `⚠️ ${bed.currentTenantName}` 
                                : (bed.currentTenantName || 'Occupied') 
                              : '+ Allocate Bed'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Room Footer Status */}
                <div className="pt-2.5 flex items-center justify-between text-xs font-semibold text-slate-500 border-t border-slate-200">
                  <span>Status:</span>
                  <span className={`font-black ${
                    isFull ? 'text-slate-500' : isFree ? 'text-emerald-600' : 'text-indigo-600'
                  }`}>
                    {isFull ? 'Fully Occupied' : isFree ? 'All Beds Vacant' : `${room.availableBeds} Beds Free`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bed Allocation Modal */}
      {selectedBed && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200 text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-xl font-black font-display text-slate-900">Allocate Bed</h3>
                <p className="text-xs text-slate-500 font-mono">Room {selectedBed.room.roomNumber} - Bed {selectedBed.bed.bedLabel}</p>
              </div>
              <button onClick={() => setSelectedBed(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAllocateBed} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Tenant Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Sharma"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Mobile Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={tenantPhone}
                  onChange={(e) => setTenantPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 font-mono"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between text-slate-700">
                  <span>Monthly Base Rent:</span>
                  <span className="font-bold text-emerald-600 font-mono">₹{selectedBed.room.baseRent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Security Deposit:</span>
                  <span className="font-bold text-slate-900 font-mono">₹10,000</span>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedBed(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAllocating}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl text-xs shadow-md shadow-indigo-600/20 transition disabled:opacity-50 active:scale-95"
                >
                  {isAllocating ? 'Allocating...' : 'Confirm Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
