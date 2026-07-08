'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  cta: string;
  ctaLink: string;
  bgGradient: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Pure Acacia Honey from West Pokot',
    subtitle: 'For families who value quality. Raw, unprocessed honey harvested using traditional methods that preserve its natural goodness.',
    image: 'https://images.unsplash.com/photo-1587049352846-4a232e259e83?w=800&q=80',
    cta: 'Shop Honey',
    ctaLink: '/products?category=honey',
    bgGradient: 'from-amber-700 via-amber-800 to-amber-900',
  },
  {
    id: 2,
    title: 'Farm-Fresh Fruits, Delivered',
    subtitle: 'For health-conscious households. Sun-ripened mangoes, pawpaws, and seasonal fruits grown without harmful chemicals.',
    image: 'https://images.unsplash.com/photo-1619566636858-adf8ef8c7d23?w=800&q=80',
    cta: 'Shop Fruits',
    ctaLink: '/products?category=fruits',
    bgGradient: 'from-green-700 via-green-800 to-green-900',
  },
  {
    id: 3,
    title: 'Quality Dorper Sheep and Livestock',
    subtitle: 'For farmers seeking superior breeding stock. Healthy animals raised on natural West Pokot pastures.',
    image: 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=800&q=80',
    cta: 'View Livestock',
    ctaLink: '/products?category=livestock',
    bgGradient: 'from-primary-700 via-primary-800 to-primary-900',
  },
  {
    id: 4,
    title: 'Free-Range Eggs and Poultry',
    subtitle: 'For those who understand the difference. Birds raised on open pastures produce richer, healthier eggs and meat.',
    image: 'https://images.unsplash.com/photo-1548550023-2cdb30c18c73?w=800&q=80',
    cta: 'Shop Poultry',
    ctaLink: '/products?category=poultry',
    bgGradient: 'from-yellow-700 via-amber-700 to-amber-800',
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
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
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
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient} opacity-90`}></div>
          </div>

          <div className="relative w-full h-full flex items-center px-6 md:px-12">
            <div className="flex-1 text-white z-20">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4 leading-tight drop-shadow-lg">
                {slide.title}
              </h2>
              <p className="text-sm md:text-lg lg:text-xl mb-4 md:mb-8 opacity-95 line-clamp-2 drop-shadow-md max-w-xl">
                {slide.subtitle}
              </p>
              <Link
                href={slide.ctaLink}
                className="inline-block bg-white text-primary-700 px-6 md:px-8 py-2.5 md:py-3.5 rounded-lg font-bold text-sm md:text-base hover:bg-primary-50 transition-all hover:scale-105 shadow-xl active:scale-95 hover:shadow-2xl"
              >
                {slide.cta}
              </Link>
            </div>
          </div>
        </div>
      ))}

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
