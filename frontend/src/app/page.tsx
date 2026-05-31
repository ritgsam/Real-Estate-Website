'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Building, Home as HouseIcon, TreePine, ShieldAlert } from 'lucide-react';

const CITIES = ['Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Hyderabad', 'Chennai'];
const TYPES = [
  { label: 'Apartments', value: 'APARTMENT', icon: Building, desc: 'Luxury high-rises and condos' },
  { label: 'Houses', value: 'HOUSE', icon: HouseIcon, desc: 'Independent homes and duplexes' },
  { label: 'Villas', value: 'VILLA', icon: HouseIcon, desc: 'Premium luxury estates' },
  { label: 'Plots / Land', value: 'PLOT', icon: TreePine, desc: 'Residential & commercial land' },
];

export default function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (city) query.append('city', city);
    router.push(`/search?${query.toString()}`);
  };

  const handleCityClick = (cityName: string) => {
    router.push(`/search?city=${cityName}`);
  };

  const handleTypeClick = (typeValue: string) => {
    router.push(`/search?type=${typeValue}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center py-24 sm:py-32 px-4 overflow-hidden border-b border-slate-900 bg-slate-950">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] sm:h-[500px] sm:w-[500px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-pink-500/5 blur-[80px] pointer-events-none" />

        <div className="relative text-center max-w-3xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
            <ShieldAlert className="h-3.5 w-3.5" />
            Verified Owner & Agent Listings
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
            Find Your Next Home in <span className="gradient-text">Aura Style</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Discover verified, direct-owner properties and premium agent listings. No spam, no hidden charges.
          </p>

          {/* Interactive Search Card */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="w-full max-w-2xl mx-auto mt-10 rounded-2xl glass-panel p-3 border border-slate-800 shadow-xl flex flex-col md:flex-row gap-2"
          >
            {/* Search query input */}
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-950/60 rounded-xl border border-slate-800/40">
              <Search className="text-slate-500 h-5 w-5 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search neighborhood, property title..."
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* City dropdown */}
            <div className="w-full md:w-[200px] flex items-center gap-2 px-3 py-2 bg-slate-950/60 rounded-xl border border-slate-800/40">
              <MapPin className="text-slate-500 h-5 w-5 shrink-0" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-slate-950 text-slate-300">All Cities</option>
                {CITIES.map((c) => (
                  <option key={c} value={c} className="bg-slate-950 text-slate-300">{c}</option>
                ))}
              </select>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all md:shrink-0"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Property Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 w-full">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-8 text-center sm:text-left">
          Browse by Property Type
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TYPES.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.value}
                onClick={() => handleTypeClick(t.value)}
                className="flex flex-col items-start p-6 rounded-2xl glass-card border border-slate-900 hover:border-indigo-500/40 hover:bg-slate-900/60 transition-all duration-300 text-left group"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-200 group-hover:text-white transition-colors">
                  {t.label}
                </h3>
                <p className="mt-2 text-xs text-slate-400">{t.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Quick Links by Cities */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 w-full mb-16">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-8 text-center sm:text-left">
          Explore Popular Cities
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CITIES.map((c) => (
            <button
              key={c}
              onClick={() => handleCityClick(c)}
              className="flex flex-col items-center justify-center py-6 px-4 rounded-xl border border-slate-900 bg-slate-900/20 hover:bg-slate-900/80 hover:border-slate-800 transition-all group"
            >
              <span className="text-sm font-bold text-slate-300 group-hover:text-indigo-400 transition-colors">
                {c}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
