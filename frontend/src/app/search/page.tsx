'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import PropertyCard from '@/components/PropertyCard';
import { SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';

const CITIES = ['Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Hyderabad', 'Chennai'];
const TYPES = ['APARTMENT', 'HOUSE', 'VILLA', 'PLOT'];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  // Listings & Loading State
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch listings on filter changes
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const res = await api.properties.list({
          search,
          city,
          type,
          bedrooms,
          minPrice,
          maxPrice,
          sortBy,
          sortOrder,
          page,
          limit: 12,
        });
        if (res.success) {
          setProperties(res.data);
          if (res.pagination) {
            setPagination(res.pagination);
          }
        }
      } catch (err) {
        console.error('Failed to load listings', err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();

    // Sync URL search params
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (city) params.set('city', city);
    if (type) params.set('type', type);
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (sortBy) params.set('sortBy', sortBy);
    if (sortOrder) params.set('sortOrder', sortOrder);
    if (page > 1) params.set('page', page.toString());
    
    // Update the URL without reloading the page
    router.replace(`/search?${params.toString()}`, { scroll: false });
  }, [search, city, type, bedrooms, minPrice, maxPrice, sortBy, sortOrder, page]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setCity('');
    setType('');
    setBedrooms('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'price_asc') {
      setSortBy('price');
      setSortOrder('asc');
    } else if (val === 'price_desc') {
      setSortBy('price');
      setSortOrder('desc');
    } else if (val === 'area_desc') {
      setSortBy('area');
      setSortOrder('desc');
    } else {
      setSortBy('createdAt');
      setSortOrder('desc');
    }
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters - Desktop */}
      <aside className="hidden md:block w-[260px] shrink-0 self-start sticky top-24 space-y-6">
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-5 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <h3 className="font-bold text-white flex items-center gap-1.5 text-sm uppercase tracking-wider">
              <SlidersHorizontal className="h-4.5 w-4.5 text-indigo-400" />
              Filters
            </h3>
            <button 
              onClick={handleResetFilters} 
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Reset All
            </button>
          </div>

          {/* Search Keywords */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="e.g. Bandra, Pool"
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">City</label>
            <select
              value={city}
              onChange={(e) => { setCity(e.target.value); setPage(1); }}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="">All Cities</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Property Type</label>
            <div className="space-y-1.5">
              {TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => { setType(type === t ? '' : t); setPage(1); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    type === t
                      ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-300'
                  }`}
                >
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Bedrooms */}
          {type !== 'PLOT' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Bedrooms</label>
              <div className="grid grid-cols-5 gap-1">
                {[1, 2, 3, 4, 5].map(b => (
                  <button
                    key={b}
                    onClick={() => { setBedrooms(bedrooms === b.toString() ? '' : b.toString()); setPage(1); }}
                    className={`h-8 rounded-lg text-xs font-bold border transition-all ${
                      bedrooms === b.toString()
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-300'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Budget Range */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Budget (INR)</label>
            <div className="space-y-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                placeholder="Min Price"
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                placeholder="Max Price"
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Listings Section */}
      <section className="flex-1 flex flex-col">
        {/* Top bar (Results count and Sort) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-900 pb-4 mb-6">
          <div className="text-sm text-slate-400">
            {loading ? (
              <span>Loading matching properties...</span>
            ) : (
              <span>
                Showing <strong className="text-white">{properties.length}</strong> of{' '}
                <strong className="text-white">{pagination.total}</strong> properties
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
            <span className="flex items-center gap-1.5 text-xs text-slate-500 uppercase font-semibold">
              <ArrowUpDown className="h-3.5 w-3.5" />
              Sort By
            </span>
            <select
              value={`${sortBy}_${sortOrder}`}
              onChange={handleSortChange}
              className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="createdAt_desc">Newest Listings</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="area_desc">Size: Large to Small</option>
            </select>

            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          /* Skeletal Pulse loading cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-900 bg-slate-900/10 flex flex-col overflow-hidden h-[380px] animate-pulse">
                <div className="bg-slate-900 aspect-[4/3] w-full" />
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="bg-slate-900 h-6 rounded w-1/3" />
                    <div className="bg-slate-900 h-4 rounded w-5/6" />
                    <div className="bg-slate-900 h-3 rounded w-1/2" />
                  </div>
                  <div className="bg-slate-900 h-9 rounded-xl w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-4">
            <h3 className="text-lg font-bold text-white">No properties found</h3>
            <p className="text-sm text-slate-500 max-w-sm">
              We couldn't find any listings matching your current filter set. Try resetting or adjusting your search parameters.
            </p>
            <button
              onClick={handleResetFilters}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-lg active:scale-[0.98] transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12 border-t border-slate-900 pt-6">
            <button
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
              className="flex items-center justify-center h-9 w-9 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-xs font-semibold text-slate-400">
              Page <strong className="text-white">{page}</strong> of{' '}
              <strong className="text-white">{pagination.totalPages}</strong>
            </span>

            <button
              disabled={page === pagination.totalPages}
              onClick={() => handlePageChange(page + 1)}
              className="flex items-center justify-center h-9 w-9 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </section>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xs bg-slate-950 border-l border-slate-900 p-6 flex flex-col h-full animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-6">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">Filters</h3>
              <button 
                onClick={() => setMobileFiltersOpen(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 no-scrollbar">
              {/* Search Keywords */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Search</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="e.g. Bandra, Pool"
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">City</label>
                <select
                  value={city}
                  onChange={(e) => { setCity(e.target.value); setPage(1); }}
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="">All Cities</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Property Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => { setType(type === t ? '' : t); setPage(1); }}
                      className={`text-center py-2 rounded-lg text-xs font-semibold border transition-all ${
                        type === t
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      {t.charAt(0) + t.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bedrooms */}
              {type !== 'PLOT' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Bedrooms</label>
                  <div className="grid grid-cols-5 gap-1">
                    {[1, 2, 3, 4, 5].map(b => (
                      <button
                        key={b}
                        onClick={() => { setBedrooms(bedrooms === b.toString() ? '' : b.toString()); setPage(1); }}
                        className={`h-8 rounded-lg text-xs font-bold border transition-all ${
                          bedrooms === b.toString()
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Budget Range */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Budget (INR)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                    placeholder="Min"
                    className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                    placeholder="Max"
                    className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-900 pt-4 mt-6">
              <button
                onClick={handleResetFilters}
                className="w-full text-center py-2.5 rounded-lg text-xs font-semibold border border-slate-800 text-slate-400 hover:text-slate-200 mb-2 transition-colors"
              >
                Reset All Filters
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full text-center py-2.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white shadow-lg shadow-indigo-600/10 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
