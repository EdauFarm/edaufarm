'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const visitPackages = [
  {
    name: 'Day Tour',
    duration: '4-5 hours',
    price: 2500,
    includes: ['Farm walkthrough', 'Honey tasting', 'Fresh fruit sampling', 'Lunch included', 'Take-home goodies'],
    image: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4e7?w=400',
  },
  {
    name: 'Weekend Experience',
    duration: '2 days',
    price: 8500,
    includes: ['Full farm experience', 'Overnight accommodation', 'All meals included', 'Livestock interaction', 'Farming workshops', 'Premium honey gift pack'],
    image: 'https://images.unsplash.com/photo-1587049352846-4a232e259e83?w=400',
    popular: true,
  },
  {
    name: 'Educational Tour',
    duration: '3-4 hours',
    price: 1500,
    includes: ['Guided farm tour', 'Sustainable farming talk', 'Q&A session', 'Educational materials', 'Group discounts available'],
    image: 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=400',
  },
];

export default function FarmVisitsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    package: '',
    guests: '1',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit to an API
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1500651230702-0e2d8a49d4e7?w=1200"
          alt="Edau Farm"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white max-w-2xl px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Visit Edau Farm</h1>
            <p className="text-lg text-gray-200">
              Experience sustainable farming in the heart of West Pokot. See where your food comes from and learn about our practices.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* About Visits */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Experience Our Farm</h2>
            <p className="text-gray-600 mb-6">
              Edau Farm welcomes visitors to experience sustainable agriculture in action. Walk through our acacia forests, meet our Dorper sheep and free-range chickens, and taste the freshest honey straight from the source.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🍯</span>
                <span className="text-gray-700">Honey tasting sessions</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🐑</span>
                <span className="text-gray-700">Livestock interactions</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🥭</span>
                <span className="text-gray-700">Fresh fruit picking (seasonal)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌱</span>
                <span className="text-gray-700">Sustainable farming workshops</span>
              </div>
            </div>
          </div>
          <div className="relative h-64 md:h-auto rounded-xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1587049352846-4a232e259e83?w=600"
              alt="Honey tasting"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Visit Packages */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Our Visit Packages</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {visitPackages.map((pkg, index) => (
              <div
                key={index}
                className={`border rounded-xl overflow-hidden hover:shadow-lg transition-shadow ${
                  pkg.popular ? 'border-primary-500 ring-2 ring-primary-500' : 'border-gray-200'
                }`}
              >
                {pkg.popular && (
                  <div className="bg-primary-600 text-white text-center text-sm font-medium py-1">
                    Most Popular
                  </div>
                )}
                <div className="relative h-48">
                  <Image
                    src={pkg.image}
                    alt={pkg.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{pkg.duration}</p>
                  <p className="text-2xl font-bold text-primary-600 mb-4">KSh {pkg.price.toLocaleString()}</p>
                  <ul className="space-y-2 mb-4">
                    {pkg.includes.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-primary-600">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setFormData({ ...formData, package: pkg.name })}
                    className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                  >
                    Book This Package
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Form */}
        <div className="bg-gray-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Book Your Visit</h2>

          {submitted ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Request Submitted!</h3>
              <p className="text-gray-600">
                We&apos;ll contact you within 24 hours to confirm your farm visit.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="+254 700 000 000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Package *</label>
                <select
                  required
                  value={formData.package}
                  onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                >
                  <option value="">Select a package</option>
                  {visitPackages.map((pkg, i) => (
                    <option key={i} value={pkg.name}>
                      {pkg.name} - KSh {pkg.price.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests *</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={formData.guests}
                  onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="Any dietary restrictions, accessibility needs, or special interests..."
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full md:w-auto bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Submit Booking Request
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
