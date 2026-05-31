'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import PropertyCard, { formatPrice } from '@/components/PropertyCard';
import { BedDouble, Bath, Maximize, MapPin, Building, Calendar, Phone, Mail, User, Loader2, CheckCircle2 } from 'lucide-react';

interface PropertyDetailsProps {
  property: {
    id: string;
    title: string;
    description: string;
    price: number;
    type: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    city: string;
    location: string;
    images: string[];
    createdAt: string;
    owner: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export default function PropertyDetailsClient({ property }: PropertyDetailsProps) {
  const { user, openAuthModal } = useAuth();
  
  // Image Viewer
  const [activeImage, setActiveImage] = useState(
    property.images && property.images.length > 0
      ? property.images[0]
      : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
  );

  // Inquiry Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('I am interested in this property. Please contact me with details.');
  
  const [submitting, setSubmitting] = useState(false);
  const [inquiryError, setInquiryError] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Similar Properties State
  const [similarProperties, setSimilarProperties] = useState<any[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);

  // Load similar properties and prefill user credentials
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        const res = await api.properties.getSimilar(property.id);
        if (res.success) {
          setSimilarProperties(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch similar listings', err);
      } finally {
        setLoadingSimilar(false);
      }
    };

    fetchSimilar();
  }, [property.id]);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setInquiryError('');
    setInquirySuccess(false);

    try {
      const res = await api.inquiries.submit({
        propertyId: property.id,
        name,
        email,
        phone,
        message
      });

      if (res.success) {
        setInquirySuccess(true);
        setPhone('');
      }
    } catch (err: any) {
      setInquiryError(err.message || 'Failed to submit inquiry. You may have already submitted one recently.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full space-y-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-900 pb-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
            {property.type}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">{property.title}</h1>
          <div className="flex items-center gap-1.5 text-sm text-slate-400">
            <MapPin className="h-4 w-4 text-slate-500 shrink-0" />
            <span>{property.location}</span>
          </div>
        </div>

        <div className="text-left md:text-right shrink-0">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Asking Price</div>
          <div className="text-3xl sm:text-4xl font-black text-indigo-400">{formatPrice(property.price)}</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns - Image & Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl border border-slate-900 bg-slate-950">
              <img
                src={activeImage}
                alt={property.title}
                className="h-full w-full object-cover transition-all duration-300"
              />
            </div>

            {property.images && property.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {property.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`h-16 w-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === img ? 'border-indigo-500 scale-[0.98]' : 'border-slate-900 hover:border-slate-800'
                    }`}
                  >
                    <img src={img} className="h-full w-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl border border-slate-900 bg-slate-900/10">
            {property.type !== 'PLOT' && (
              <>
                <div className="flex flex-col items-center justify-center p-3 text-center border-r border-slate-900/40">
                  <BedDouble className="h-5 w-5 text-indigo-400 mb-2" />
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Bedrooms</span>
                  <span className="text-sm font-extrabold text-slate-200 mt-1">{property.bedrooms} BHK</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 text-center sm:border-r border-slate-900/40">
                  <Bath className="h-5 w-5 text-indigo-400 mb-2" />
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Bathrooms</span>
                  <span className="text-sm font-extrabold text-slate-200 mt-1">{property.bathrooms} Bath</span>
                </div>
              </>
            )}
            <div className="flex flex-col items-center justify-center p-3 text-center border-r border-slate-900/40 col-span-1">
              <Maximize className="h-5 w-5 text-indigo-400 mb-2" />
              <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Super Area</span>
              <span className="text-sm font-extrabold text-slate-200 mt-1">{property.area} sqft</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 text-center col-span-1">
              <Calendar className="h-5 w-5 text-indigo-400 mb-2" />
              <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Posted On</span>
              <span className="text-sm font-extrabold text-slate-200 mt-1">
                {new Date(property.createdAt).toLocaleDateString('en-IN', {
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Property Description</h2>
            <p className="text-slate-400 leading-relaxed text-sm whitespace-pre-line">
              {property.description}
            </p>
          </div>
        </div>

        {/* Right Column - Contact Form */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 space-y-6 sticky top-24">
            <div>
              <h3 className="font-bold text-white text-lg">Contact Agent / Owner</h3>
              <p className="text-xs text-slate-500 mt-1">Submit your details to receive contact information.</p>
            </div>

            {/* Owner/Agent details */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-900">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-300">
                <User className="h-4.5 w-4.5" />
              </span>
              <div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Listed By</div>
                <div className="text-sm font-bold text-slate-200">{property.owner.name}</div>
              </div>
            </div>

            {/* Success message */}
            {inquirySuccess ? (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-5 text-center space-y-3">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white text-sm">Lead Submitted!</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your inquiry was successfully sent. The owner/agent has been notified and will reach out to you at{' '}
                  <strong className="text-slate-200">{email}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} noValidate className="space-y-4">
                {inquiryError && (
                  <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
                    {inquiryError}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter you full name"
                    className="w-full rounded-lg bg-slate-950 border border-slate-900 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full rounded-lg bg-slate-950 border border-slate-900 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Phone Number</label>
                  <div className="flex gap-2">
                    <span className="flex items-center justify-center rounded-lg bg-slate-950 border border-slate-900 px-2.5 text-xs text-slate-500">+91</span>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10 digit mobile"
                      className="w-full rounded-lg bg-slate-950 border border-slate-900 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Message</label>
                  <textarea
                    required
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-900 px-3 py-2 text-xs text-slate-200 focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 py-3 text-xs font-semibold text-white shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Inquire Now'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Similar Properties Section */}
      <section className="border-t border-slate-900 pt-12">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Similar Properties You May Like</h2>
        {loadingSimilar ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
          </div>
        ) : similarProperties.length === 0 ? (
          <p className="text-xs text-slate-500">No similar properties recommendations found in this location.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProperties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
