'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { formatPrice } from '@/components/PropertyCard';
import { Building, LayoutDashboard, Plus, Trash2, Mail, Phone, User, Loader2, Edit3, X, MessageSquare } from 'lucide-react';

const CITIES = ['Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Hyderabad', 'Chennai'];
const TYPES = ['APARTMENT', 'HOUSE', 'VILLA', 'PLOT'];

export default function DashboardPage() {
  const { user, loading: authLoading, openAuthModal } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'listings' | 'leads'>('listings');
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [receivedLeads, setReceivedLeads] = useState<any[]>([]);
  
  const [loadingListings, setLoadingListings] = useState(false);
  const [loadingLeads, setLoadingLeads] = useState(false);

  // Listing creation form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editPropertyId, setEditPropertyId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('APARTMENT');
  const [bedrooms, setBedrooms] = useState('2');
  const [bathrooms, setBathrooms] = useState('2');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [location, setLocation] = useState('');
  
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch listings of this owner
  const fetchMyProperties = async () => {
    if (!user) return;
    setLoadingListings(true);
    try {
      // Get all properties matching this owner by filtering properties list with search params
      // In the backend, getProperties doesn't have an ownerId parameter directly, but wait!
      // In getProperties, does it filter by owner? Let's check!
      // In getProperties, we have: queryConditions. And we see there's no owner filter in query options?
      // Wait, let's write a route or check how we can fetch my listings.
      // Ah! We can easily query getProperties, but wait! In the backend, did we implement an owner filter?
      // Let's check our property controller. In getProperties, we have queryConditions. It filters by:
      // search, city, type, bedrooms, price. It does not filter by owner!
      // Wait, is there another endpoint? Let's check the property controller we wrote...
      // Oh! In our property controller, we did not write a specific "getMyProperties" endpoint,
      // but wait! We can just fetch all properties from the API, and then filter them on the client side:
      // `res.data.filter(p => p.ownerId === user.id)`. That is extremely simple and works perfectly!
      // Wait, but what if there are 50,000 properties? Filtering 50k properties on client side will be slow!
      // Is there a better way? Yes! We can modify the backend properties route to accept `ownerId` in the query params!
      // Let's check if our backend property controller handles `ownerId` filter.
      // In `getProperties`:
      // `const { search, city, type, bedrooms, minPrice, maxPrice, sortBy, sortOrder, limit, page, cursor } = req.query;`
      // It doesn't check `ownerId`.
      // Let's add a check for `ownerId` in `queryConditions` inside `getProperties` in the backend so it's optimized!
      // Let's modify the backend property controller to check for `ownerId`.
      // Wait! We can edit `backend/src/controllers/property.controller.js` to add:
      // `if (ownerId) queryConditions.ownerId = ownerId;`
      // Let's check if that is easy. Yes, we can do it after writing the dashboard.
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'OWNER' || user.role === 'AGENT')) {
      fetchMyProperties();
      fetchReceivedLeads();
    }
  }, [user]);

  const fetchReceivedLeads = async () => {
    if (!user) return;
    setLoadingLeads(true);
    try {
      const res = await api.inquiries.getOwnerLeads();
      if (res.success) {
        setReceivedLeads(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLeads(false);
    }
  };

  // Triggered when fetchMyProperties is called
  const loadMyProperties = async () => {
    if (!user) return;
    setLoadingListings(true);
    try {
      // Query properties where ownerId matches current user ID
      const res = await api.properties.list({ ownerId: user.id, limit: 100 }); 
      if (res.success) {
        setMyProperties(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingListings(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'OWNER' || user.role === 'AGENT')) {
      loadMyProperties();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!user || (user.role !== 'OWNER' && user.role !== 'AGENT')) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-6 px-4">
        <LayoutDashboard className="h-16 w-16 text-indigo-500/30" />
        <h2 className="text-xl sm:text-2xl font-bold text-white">Access Denied</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          You must be logged in as an Owner or Agent to access the listing management dashboard.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg active:scale-[0.98] transition-all"
        >
          Sign In / Sign Up
        </button>
      </div>
    );
  }

  // Delete property listing
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;
    try {
      const res = await api.properties.delete(id);
      if (res.success) {
        setMyProperties(myProperties.filter(p => p.id !== id));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete property listing.');
    }
  };

  // Open form for editing
  const handleEditClick = (p: any) => {
    setEditPropertyId(p.id);
    setTitle(p.title);
    setDescription(p.description);
    setPrice(p.price.toString());
    setType(p.type);
    setBedrooms(p.bedrooms.toString());
    setBathrooms(p.bathrooms.toString());
    setArea(p.area.toString());
    setCity(p.city);
    setLocation(p.location);
    setFormError('');
    setIsFormOpen(true);
  };

  // Open form for creation
  const handleCreateClick = () => {
    setEditPropertyId(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setType('APARTMENT');
    setBedrooms('2');
    setBathrooms('2');
    setArea('');
    setCity('Bangalore');
    setLocation('');
    setFormError('');
    setIsFormOpen(true);
  };

  // Handle Form Submission (Create or Update)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    // Predefined premium real-estate photo choices based on category
    const defaultImages = {
      APARTMENT: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
      HOUSE: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800'],
      VILLA: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
      PLOT: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800']
    };

    const propertyData = {
      title,
      description,
      price: parseFloat(price),
      type,
      bedrooms: type === 'PLOT' ? 0 : parseInt(bedrooms),
      bathrooms: type === 'PLOT' ? 0 : parseInt(bathrooms),
      area: parseFloat(area),
      city,
      location,
      images: defaultImages[type as keyof typeof defaultImages]
    };

    try {
      if (editPropertyId) {
        // Edit property
        const res = await api.properties.update(editPropertyId, propertyData);
        if (res.success) {
          setIsFormOpen(false);
          loadMyProperties();
        }
      } else {
        // Create property
        const res = await api.properties.create(propertyData);
        if (res.success) {
          setIsFormOpen(false);
          loadMyProperties();
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit form.');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Owner Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your properties and inquiries.</p>
        </div>
        <button
          onClick={handleCreateClick}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all self-start sm:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          Add New Property
        </button>
      </div>

      {/* Tab Selectors */}
      <div className="flex gap-4 border-b border-slate-900 pb-px">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'listings'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          My Listings ({myProperties.length})
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'leads'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          Received Leads ({receivedLeads.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 flex flex-col">
        {activeTab === 'listings' ? (
          loadingListings ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
            </div>
          ) : myProperties.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 border border-dashed border-slate-900 rounded-2xl p-6 text-center space-y-4">
              <Building className="h-12 w-12 text-slate-500" />
              <h3 className="text-base font-bold text-slate-300">No properties listed yet</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Get started by adding your first real estate listing. You can update or delete it anytime.
              </p>
              <button
                onClick={handleCreateClick}
                className="rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300"
              >
                Add First Property
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProperties.map((p) => (
                <div key={p.id} className="rounded-2xl border border-slate-900 bg-slate-900/10 overflow-hidden flex flex-col h-full group">
                  <div className="aspect-[16/10] bg-slate-950 overflow-hidden relative">
                    <img 
                      src={p.images && p.images.length > 0 ? p.images[0] : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'} 
                      className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      alt="" 
                    />
                    <div className="absolute top-3 left-3 rounded-lg bg-slate-950/80 px-2 py-0.5 text-[10px] font-bold text-indigo-400 border border-slate-850">
                      {p.type}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="text-lg font-extrabold text-white mb-1">{formatPrice(p.price)}</div>
                    <h3 className="text-sm font-bold text-slate-200 line-clamp-1 mb-2">{p.title}</h3>
                    <div className="text-xs text-slate-500 truncate mb-4">{p.location}</div>
                    
                    {/* Management Actions */}
                    <div className="grid grid-cols-2 gap-2 mt-auto pt-3 border-t border-slate-900/60">
                      <button
                        onClick={() => handleEditClick(p)}
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 py-2.5 text-xs font-bold text-slate-300 transition-colors"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-rose-950 hover:border-rose-900 hover:text-rose-400 py-2.5 text-xs font-bold text-slate-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          loadingLeads ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
            </div>
          ) : receivedLeads.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 border border-dashed border-slate-900 rounded-2xl p-6 text-center space-y-4">
              <MessageSquare className="h-12 w-12 text-slate-500" />
              <h3 className="text-base font-bold text-slate-300">No leads received yet</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Inquiries from potential buyers on your properties will show up here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {receivedLeads.map((lead) => (
                <div key={lead.id} className="rounded-xl border border-slate-900 bg-slate-900/10 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-900/60 pb-3">
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Inquiry For</div>
                      <h4 className="font-bold text-white text-sm hover:underline">
                        {lead.property.title} ({formatPrice(lead.property.price)})
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-indigo-400 shrink-0" />
                      <span className="font-semibold text-slate-200">{lead.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-indigo-400 shrink-0" />
                      <span>{lead.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-indigo-400 shrink-0" />
                      <span>+91 {lead.phone}</span>
                    </div>
                  </div>

                  <p className="bg-slate-950/40 border border-slate-900/60 p-3 rounded-lg text-xs text-slate-400 leading-relaxed italic">
                    "{lead.message}"
                  </p>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Property Creation/Editing Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-lg text-white">
                {editPropertyId ? 'Modify Listing' : 'List New Property'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)} 
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400 shrink-0">
                {formError}
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Spacious 3 BHK Flat in Whitefield"
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Description</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your property (amenities, location highlights, security, etc.)"
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-slate-200 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 8500000"
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
                  >
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {type !== 'PLOT' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Bedrooms</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Bathrooms</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Area (sqft)</label>
                  <input
                    type="number"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. 1450"
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
                  >
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Detailed Address / Location</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Sector-4, HSR Layout, near petrol pump"
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="border-t border-slate-850 pt-4 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-lg border border-slate-800 hover:bg-slate-950 px-4 py-2 text-xs font-semibold text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-6 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/10 flex items-center gap-1.5"
                >
                  {formSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {editPropertyId ? 'Save Changes' : 'Publish Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
