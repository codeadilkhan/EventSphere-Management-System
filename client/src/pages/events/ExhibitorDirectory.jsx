import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { exhibitorService } from '../../services/exhibitorService';
import {
  Store,
  Search,
  Building,
  Globe,
  Mail,
  Phone,
  Layers,
  ArrowRight,
  Package,
  Loader2,
  ExternalLink,
  Sparkles,
  MessageSquare,
  MapPin
} from 'lucide-react';

export const ExhibitorDirectory = () => {
  const [exhibitors, setExhibitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const fetchExhibitors = async () => {
    try {
      setLoading(true);
      const res = await exhibitorService.searchExhibitors({
        q: searchQuery || undefined,
        category: selectedCategory === 'ALL' ? undefined : selectedCategory,
      });
      setExhibitors(res.data.exhibitors || []);
    } catch (err) {
      console.error('Failed to load exhibitors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExhibitors();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExhibitors();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Enterprise Directory
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Exhibitors & Sponsors
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Discover innovating companies, explore products, and locate their booths on the exhibition floor.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by company or products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-2xs"
          />
        </form>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          'ALL',
          'AI & Cloud Infrastructure',
          'Industrial & Service Robotics',
          'General Technology',
          'Smart Mobility',
        ].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Exhibitor Cards Grid */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Searching verified exhibitors...</p>
        </div>
      ) : exhibitors.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Store className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700">No Exhibitors Found</h4>
          <p className="text-xs text-slate-400">Try adjusting your search keywords or categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exhibitors.map((ex) => (
            <div
              key={ex._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft hover:shadow-xl transition-all flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold text-base flex items-center justify-center shadow-md shadow-purple-600/20">
                    {ex.companyName?.charAt(0) || 'E'}
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-purple-50 text-purple-700 border border-purple-200">
                    {ex.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-purple-600 transition-colors">
                    {ex.companyName}
                  </h3>
                  {ex.website && (
                    <a
                      href={ex.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-brand-600 font-semibold hover:underline mt-0.5"
                    >
                      <Globe className="w-3 h-3" />
                      {ex.website.replace('https://', '').replace('http://', '')}
                    </a>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {ex.description || 'Enterprise innovator presenting flagship solutions at EventSphere.'}
                </p>

                {/* Product Tags */}
                {ex.products && ex.products.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Showcase Highlights:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ex.products.slice(0, 3).map((prod, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-medium"
                        >
                          {prod.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Floor Plan Stall Badges */}
                {ex.allocatedBooths && ex.allocatedBooths.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Confirmed Floor Stall:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ex.allocatedBooths.map((b) => (
                        <Link
                          key={b._id}
                          to={`/events/${b.expoId?._id || b.expoId}?booth=${b.boothNumber}`}
                          className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-[10px] font-extrabold flex items-center gap-1 transition-colors"
                          title="View on Interactive Floor Map"
                        >
                          <MapPin className="w-3 h-3 text-purple-600" />
                          Stall {b.boothNumber} ({b.expoId?.title || 'Expo'})
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <Link
                  to={`/messages?userId=${ex.userId?._id || ex.userId}`}
                  className="flex-1 py-2.5 px-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Message / Inquire
                </Link>
                <Link
                  to={
                    ex.allocatedBooths && ex.allocatedBooths.length > 0
                      ? `/events/${ex.allocatedBooths[0].expoId?._id || ex.allocatedBooths[0].expoId}?booth=${ex.allocatedBooths[0].boothNumber}`
                      : '/events'
                  }
                  className="py-2.5 px-3.5 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 border border-slate-200"
                  title="Locate Stall on Floor Plan"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Locate Stall
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
