'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight, FiSmartphone, FiMonitor, FiCpu, FiZap } from 'react-icons/fi';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  cta: string;
  ctaLink: string;
  bgGradient: string;
  icon: any;
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'New Arrivals',
    subtitle: 'Premium Electronics',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
    cta: 'Shop Now',
    ctaLink: '/products?category=Electronics',
    bgGradient: 'from-gray-700 via-gray-800 to-gray-900',
    icon: FiSmartphone,
  },
  {
    id: 2,
    title: 'Premium Laptops',
    subtitle: 'Power your productivity with top-tier devices',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    cta: 'Shop Laptops',
    ctaLink: '/products?category=Laptops',
    bgGradient: 'from-gray-800 via-gray-900 to-black',
    icon: FiMonitor,
  },
  {
    id: 3,
    title: 'Smart Devices',
    subtitle: 'Transform your home with intelligent tech',
    image: 'https://i.pinimg.com/736x/50/f4/2e/50f42ec2a5088bc4e46a46511efd4d37.jpg',
    cta: 'Discover More',
    ctaLink: '/products?category=Smart%20Devices',
    bgGradient: 'from-gray-600 via-gray-700 to-gray-800',
    icon: FiCpu,
  },
  {
    id: 4,
    title: 'Flash Sales',
    subtitle: 'Limited time deals on top gadgets',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80',
    cta: 'Shop Deals',
    ctaLink: '/flash-sales',
    bgGradient: 'from-gray-700 via-gray-800 to-slate-900',
    icon: FiZap,
  },
];


export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  return (
    <div className="relative rounded-lg overflow-hidden shadow-xl h-[250px] md:h-[350px] lg:h-[400px] group touch-pan-y">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={index === 0}
              quality={85}
              sizes="100vw"
              className="object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient} opacity-80`}></div>
          </div>
          
          <div className="relative w-full h-full flex items-center px-6 md:px-12">
            <div className="flex-1 text-white z-20">
              <div className="flex items-center space-x-3 mb-3 md:mb-4">
                <slide.icon className="w-8 h-8 md:w-10 md:h-10 opacity-90" />
              </div>
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4 leading-tight drop-shadow-lg">
                {slide.title}
              </h2>
              <p className="text-sm md:text-lg lg:text-xl mb-4 md:mb-8 opacity-95 line-clamp-2 drop-shadow-md max-w-xl">
                {slide.subtitle}
              </p>
              <Link
                href={slide.ctaLink}
                className="inline-block bg-white text-gray-900 px-6 md:px-8 py-2.5 md:py-3.5 rounded-lg font-bold text-sm md:text-base hover:bg-gray-50 transition-all hover:scale-105 shadow-xl active:scale-95 hover:shadow-2xl"
              >
                {slide.cta}
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white p-2 md:p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95"
      >
        <FiChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-900" />
      </button>
      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white p-2 md:p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95"
      >
        <FiChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-900" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-2 md:h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white w-6 md:w-8 shadow-lg'
                : 'bg-white/50 hover:bg-white/80 w-2 md:w-3'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
