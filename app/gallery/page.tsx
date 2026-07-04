import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Gallery - Edau Farm',
  description: 'Explore photos of our farm, products, and sustainable practices at Edau Farm in West Pokot, Kenya.',
};

const galleryImages = [
  {
    src: 'https://images.unsplash.com/photo-1587049352846-4a232e259e83?w=600',
    alt: 'Pure Acacia Honey',
    title: 'Our Premium Honey',
    description: 'Raw acacia honey from West Pokot forests',
  },
  {
    src: 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=600',
    alt: 'Dorper Sheep',
    title: 'Dorper Sheep',
    description: 'Quality breeding stock on natural pastures',
  },
  {
    src: 'https://images.unsplash.com/photo-1548550023-2cdb30c18c73?w=600',
    alt: 'Free-Range Chickens',
    title: 'Free-Range Poultry',
    description: 'Healthy chickens on open pasture',
  },
  {
    src: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600',
    alt: 'Fresh Mangoes',
    title: 'Fresh Fruits',
    description: 'Sun-ripened fruits from our orchards',
  },
  {
    src: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4e7?w=600',
    alt: 'Farm Landscape',
    title: 'Our Farm',
    description: 'Sustainable farming in West Pokot',
  },
  {
    src: 'https://images.unsplash.com/photo-1582727654365-289e2eb4d7a5?w=600',
    alt: 'Farm Fresh Eggs',
    title: 'Free-Range Eggs',
    description: 'Golden yolks from pasture-raised hens',
  },
];

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Farm Gallery</h1>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto">
            Take a visual journey through Edau Farm. See our sustainable practices, quality products, and the beautiful landscape of West Pokot.
          </p>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="aspect-square">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-lg font-bold">{image.title}</h3>
                  <p className="text-sm text-gray-200">{image.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Want to see the farm in person?</p>
          <Link
            href="/farm-visits"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Book a Farm Visit
          </Link>
        </div>
      </div>
    </div>
  );
}
