import type { Metadata } from 'next';
import PropertyDetailsClient from './PropertyDetailsClient';

interface Props {
  params: Promise<{ id: string }>;
}

async function getPropertyData(id: string) {
  try {
    const res = await fetch(`http://localhost:5000/api/properties/${id}`, {
      next: { revalidate: 3600 } // Incremental Static Regeneration cache configuration
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.property : null;
  } catch (err) {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const property = await getPropertyData(id);

  if (!property) {
    return {
      title: 'Property Not Found | AuraEstate',
      description: 'The requested listing does not exist.'
    };
  }

  return {
    title: `${property.title} in ${property.city} | AuraEstate`,
    description: property.description,
    openGraph: {
      title: `${property.title} in ${property.city} | AuraEstate`,
      description: property.description,
      images: property.images && property.images.length > 0 ? [property.images[0]] : []
    }
  };
}

export default async function PropertyDetailsPage({ params }: Props) {
  const { id } = await params;
  const property = await getPropertyData(id);

  if (!property) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Listing Not Found</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          The property listing you are trying to view does not exist or has been removed.
        </p>
      </div>
    );
  }

  return <PropertyDetailsClient property={property} />;
}
