import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { expoService } from '../../services/expoService';
import { Calendar, MapPin, Layers, Users, ArrowRight, Sparkles, Search, Loader2 } from 'lucide-react';

export const EventsList = () => {
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fallback sample expos in case API is not seeded yet
  const sampleExpos = [
    {
      _id: 'sample-1',
      title: 'Global Tech & Innovation Expo 2026',
      theme: 'Emerging Technologies, AI & Robotics',
      startDate: new Date(Date.now() + 10 * 86400000).toISOString(),
      endDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      location: { venue: 'Metropolitan Convention Center', city: 'Karachi' },
      boothsTotal: 24,
      boothsBooked: 2,
      bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60',
    },
    {
      _id: 'sample-2',
      title: 'International Industrial & Engineering Trade Fair',
      theme: 'Sustainable Engineering & Smart Infrastructure',
      startDate: new Date(Date.now() + 25 * 86400000).toISOString(),
      endDate: new Date(Date.now() + 29 * 86400000).toISOString(),
      location: { venue: 'Expo Pavilion Center', city: 'Lahore' },
      boothsTotal: 40,
      boothsBooked: 18,
      bannerImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=60',
    },
    {
      _id: 'sample-3',
      title: 'Healthcare & Biotech World Summit',
      theme: 'Medical Automation & Genomics',
      startDate: new Date(Date.now() + 60 * 86400000).toISOString(),
      endDate: new Date(Date.now() + 64 * 86400000).toISOString(),
      location: { venue: 'Serena Expo Complex', city: 'Islamabad' },
      boothsTotal: 30,
      boothsBooked: 12,
      bannerImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=60',
    },
  ];

  const fetchExpos = async () => {
    try {
      setLoading(true);
      const res = await expoService.getExpos({ q: searchQuery || undefined });
      if (res.data?.expos && res.data.expos.length > 0) {
        setExpos(res.data.expos);
      } else {
        setExpos(sampleExpos);
      }
    } catch (err) {
      console.warn('API expos fallback triggered', err.message);
      setExpos(sampleExpos);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpos();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExpos();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Public Directory
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Browse Active & Upcoming Expos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Discover scheduled trade exhibitions, examine booth floor plans, and reserve keynotes.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search exhibitions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-2xs"
          />
        </form>
      </div>

      {/* Expo Cards Grid */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Fetching scheduled exhibitions...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {expos.map((expo) => (
            <div
              key={expo._id}
              className="rounded-3xl bg-white border border-slate-200/80 shadow-soft overflow-hidden hover:shadow-xl transition-all flex flex-col group"
            >
              <div className="h-48 overflow-hidden relative">
                <img
                  src={
                    expo.bannerImage ||
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
                  }
                  alt={expo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                  Active Expo
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-brand-600 uppercase tracking-wide">
                    {expo.theme}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                    {expo.title}
                  </h3>
                  <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {new Date(expo.startDate).toLocaleDateString()} &ndash;{' '}
                        {new Date(expo.endDate).toLocaleDateString()}
                      </span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {expo.location?.venue}, {expo.location?.city}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Booth Occupancy</span>
                    <span className="font-bold text-slate-800">
                      {expo.boothsBooked || 0} / {expo.boothsTotal || 24} Stalls
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-600 to-indigo-600 rounded-full"
                      style={{
                        width: `${
                          ((expo.boothsBooked || 0) / (expo.boothsTotal || 24)) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to={`/events/${expo._id}`}
                    className="w-full py-2.5 px-4 bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-700 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border border-slate-200"
                  >
                    View Floor Plan & Stalls
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
