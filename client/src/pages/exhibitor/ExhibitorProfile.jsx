import React, { useState, useEffect } from 'react';
import { exhibitorService } from '../../services/exhibitorService';
import {
  Building,
  Upload,
  Globe,
  Mail,
  Phone,
  MapPin,
  Package,
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Layers
} from 'lucide-react';

export const ExhibitorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [allocatedBooths, setAllocatedBooths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [category, setCategory] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactAddress, setContactAddress] = useState('');

  // Products and Staff arrays
  const [products, setProducts] = useState([]);
  const [staff, setStaff] = useState([]);

  // Modals for adding product and staff
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Hardware', description: '' });

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', role: 'Booth Representative', email: '', phone: '' });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await exhibitorService.getMyProfile();
      const p = res.data.profile;
      setProfile(p);
      setAllocatedBooths(res.data.allocatedBooths || []);

      setCompanyName(p.companyName || '');
      setCategory(p.category || 'General Technology');
      setWebsite(p.website || '');
      setDescription(p.description || '');
      setLogo(p.logo || '');
      setContactEmail(p.contact?.email || '');
      setContactPhone(p.contact?.phone || '');
      setContactAddress(p.contact?.address || '');
      setProducts(p.products || []);
      setStaff(p.staff || []);
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Save profile changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    const payload = {
      companyName,
      category,
      website,
      description,
      logo,
      contact: {
        email: contactEmail,
        phone: contactPhone,
        address: contactAddress,
      },
      products,
      staff,
    };

    try {
      await exhibitorService.updateMyProfile(payload);
      setStatusMessage({ type: 'success', text: 'Exhibitor showcase profile saved successfully!' });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save changes.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Add product to list
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name.trim()) return;
    setProducts([...products, { ...newProduct }]);
    setNewProduct({ name: '', category: 'Hardware', description: '' });
    setIsProductModalOpen(false);
  };

  // Remove product from list
  const handleRemoveProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  // Add staff member
  const handleAddStaff = (e) => {
    e.preventDefault();
    if (!newStaff.name.trim()) return;
    setStaff([...staff, { ...newStaff }]);
    setNewStaff({ name: '', role: 'Booth Representative', email: '', phone: '' });
    setIsStaffModalOpen(false);
  };

  // Remove staff member
  const handleRemoveStaff = (index) => {
    setStaff(staff.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Company Profile & Showcase Management
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your brand assets, commercial catalog, and booth staff representatives.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading exhibitor showcase...</p>
        </div>
      ) : (
        <form onSubmit={handleSaveProfile} className="space-y-8">
          {/* Active Allocated Stalls Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-600" />
              Secured Booth Locations
            </h3>

            {allocatedBooths.length === 0 ? (
              <p className="text-xs text-slate-400">
                You do not have any stalls reserved yet. Head over to{' '}
                <a href="/exhibitor/booths" className="text-brand-600 font-bold underline">
                  Floor Plans
                </a>{' '}
                to select a booth.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allocatedBooths.map((b) => (
                  <div
                    key={b._id}
                    className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-indigo-950">
                        {b.expoId?.title || 'Exhibition'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {b.size} &bull; {b.category} Stall
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-brand-600 text-white font-extrabold text-xs">
                      Booth {b.boothNumber}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Core Company Details Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-5">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building className="w-5 h-5 text-purple-600" />
              Brand & Corporate Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Industry / Category *
                </label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. AI & Robotics, Cloud Computing"
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Website URL
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://company.com"
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Logo Image URL
                </label>
                <input
                  type="url"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="https://..."
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Company Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief bio for attendees browsing your stall..."
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Contact Phone</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Office Address</label>
                <input
                  type="text"
                  value={contactAddress}
                  onChange={(e) => setContactAddress(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Product Showcase Section */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-brand-600" />
                Featured Products & Demonstrations ({products.length})
              </h3>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-xl text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Product
              </button>
            </div>

            {products.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No products added yet. Add flagship hardware or software to display at your booth.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-800 uppercase">
                        {p.category}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(idx)}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                      title="Remove product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booth Staff Representatives */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Booth Staff on Duty ({staff.length})
              </h3>
              <button
                type="button"
                onClick={() => setIsStaffModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Assign Staff
              </button>
            </div>

            {staff.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No booth personnel registered. Assign team members who will represent you on site.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {staff.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{s.name}</h4>
                      <p className="text-xs font-semibold text-brand-600">{s.role}</p>
                      <p className="text-[11px] text-slate-500">{s.email || s.phone}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveStaff(idx)}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                      title="Remove staff"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="py-3 px-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-purple-600/25 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save All Profile Details
            </button>
          </div>
        </form>
      )}

      {/* Add Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Product to Showcase</h3>
            <form onSubmit={handleAddProduct} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Apex Autonomous Rover X1"
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">
                  Category
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                >
                  <option value="Hardware">Hardware / Robotics</option>
                  <option value="Software">Software & AI</option>
                  <option value="Service">Commercial Service</option>
                  <option value="Research">Research & Prototype</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Key capabilities..."
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="py-1.5 px-3 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-1.5 px-4 bg-brand-600 text-white font-bold rounded-xl text-xs shadow-sm"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Assign Booth Staff</h3>
            <form onSubmit={handleAddStaff} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  placeholder="e.g. David Vance"
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">
                  Staff Role
                </label>
                <input
                  type="text"
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  placeholder="e.g. Lead Technical Engineer"
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">
                  Email
                </label>
                <input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  placeholder="staff@company.com"
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="py-1.5 px-3 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-1.5 px-4 bg-indigo-600 text-white font-bold rounded-xl text-xs shadow-sm"
                >
                  Save Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
