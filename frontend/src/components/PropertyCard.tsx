import Link from 'next/link';
import { Building, MapPin, Maximize, BedDouble, Bath } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  price: number;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  city: string;
  location: string;
  images: string[];
}

export const formatPrice = (price: number) => {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} Lac`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
};

export default function PropertyCard({ property }: { property: Property }) {
  const imageUrl = property.images && property.images.length > 0 
    ? property.images[0] 
    : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';

  return (
    <div className="group overflow-hidden rounded-2xl glass-card border border-slate-900 hover:border-indigo-500/30 hover:bg-slate-900/40 transition-all duration-300 flex flex-col h-full shadow-lg">
      {/* Property Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={property.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 rounded-lg bg-slate-950/80 px-2.5 py-1 text-xs font-bold text-indigo-400 backdrop-blur-sm border border-slate-800">
          {property.type}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Price */}
        <div className="text-xl font-extrabold text-white mb-2">
          {formatPrice(property.price)}
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-slate-100 line-clamp-1 group-hover:text-indigo-400 transition-colors mb-2">
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-slate-400 mb-4">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-500" />
          <span className="truncate">{property.location}</span>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-900 text-xs text-slate-300 mt-auto">
          {property.type !== 'PLOT' ? (
            <>
              <div className="flex items-center gap-1" title="Bedrooms">
                <BedDouble className="h-3.5 w-3.5 text-slate-500" />
                <span>{property.bedrooms} BHK</span>
              </div>
              <div className="flex items-center gap-1" title="Bathrooms">
                <Bath className="h-3.5 w-3.5 text-slate-500" />
                <span>{property.bathrooms} Bath</span>
              </div>
            </>
          ) : (
            <div className="col-span-2 flex items-center gap-1">
              <Building className="h-3.5 w-3.5 text-slate-500" />
              <span>Plot Land</span>
            </div>
          )}
          <div className="flex items-center gap-1 justify-end" title="Area">
            <Maximize className="h-3.5 w-3.5 text-slate-500" />
            <span>{property.area} sqft</span>
          </div>
        </div>

        {/* View Details Link */}
        <Link 
          href={`/properties/${property.id}`}
          className="mt-4 w-full block text-center rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900/60 py-2.5 text-xs font-bold text-slate-200 hover:text-white transition-all active:scale-[0.98]"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
