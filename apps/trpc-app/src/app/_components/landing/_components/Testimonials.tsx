'use client';

import { CheckCircle, Star } from 'lucide-react';
import Image from 'next/image';

const testimonialsData = [
  {
    name: 'Sara M.',
    quote: 'Franchement meilleure boutique, safe w rapide.',
    avatarBg: 'bg-pink-100',
    rating: 5,
  },
  {
    name: 'Nassim Lekhdari',
    quote: "3andi déjà commandé 4 fois, jamais eu un souci. Recommande +++",
    avatarBg: 'bg-green-100',
    rating: 4.5,
  },
  {
    name: 'Lina Ait',
    quote: "J'ai acheté une carte Spotify, reçu en 2 minutes, top!",
    avatarBg: 'bg-red-100',
    rating: 4,
  },
  {
    name: 'Fares DZ',
    quote: "L'instant delivery nta3 Steam Card 🔥🔥",
    avatarBg: 'bg-blue-100',
    rating: 5,
  },
  {
    name: 'Yanis K.',
    quote: 'Service client super réactif, problème résolu en 10 min!',
    avatarBg: 'bg-purple-100',
    rating: 5,
  },
  {
    name: 'Amira B.',
    quote: 'Les prix sont vraiment compétitifs comparé aux autres.',
    avatarBg: 'bg-yellow-100',
    rating: 4.5,
  },
  {
    name: 'Mehdi Z.',
    quote: 'Site fiable à 100%, je recommande les yeux fermés.',
    avatarBg: 'bg-indigo-100',
    rating: 5,
  },
  {
    name: 'Rania S.',
    quote: 'Parfait pour les cartes PSN, livraison instantanée!',
    avatarBg: 'bg-teal-100',
    rating: 4.5,
  },
];

// Split testimonials into three rows
const row1 = [...testimonialsData.slice(0, 3), ...testimonialsData.slice(0, 3), ...testimonialsData.slice(0, 3)];
const row2 = [...testimonialsData.slice(3, 6), ...testimonialsData.slice(3, 6), ...testimonialsData.slice(3, 6)];
const row3 = [...testimonialsData.slice(6, 8), ...testimonialsData.slice(6, 8), ...testimonialsData.slice(6, 8), ...testimonialsData.slice(6, 8)];

interface TestimonialCardProps {
  name: string;
  quote: string;
  avatarBg: string;
  rating: number;
}

const TestimonialCard = ({ name, quote, avatarBg, rating }: TestimonialCardProps) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <div className='flex-shrink-0 w-[320px] sm:w-[380px] min-h-[140px] bg-white rounded-2xl border border-gray-200/50 p-6 hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg transition-all duration-300 cursor-pointer'>
      <div className='flex flex-col gap-4 h-full'>
        {/* Stars and Badge */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-1'>
            {[...Array(5)].map((_, i) => {
              if (i < fullStars) {
                return <Star key={i} className='w-4 h-4 text-[#4618AC]' fill='#4618AC' />;
              }
              if (i === fullStars && hasHalfStar) {
                return (
                  <div key={i} className='relative w-4 h-4'>
                    <Star className='w-4 h-4 text-gray-300 absolute' fill='currentColor' />
                    <div className='absolute top-0 left-0 h-full w-1/2 overflow-hidden'>
                      <Star className='w-4 h-4 text-[#4618AC]' fill='#4618AC' />
                    </div>
                  </div>
                );
              }
              return <Star key={i} className='w-4 h-4 text-gray-300' fill='currentColor' />;
            })}
          </div>
          <div className='flex items-center text-xs text-green-600 font-medium'>
            <CheckCircle className='w-3.5 h-3.5 mr-1' />
            <span className='hidden sm:inline'>Verified</span>
          </div>
        </div>

        {/* Quote */}
        <p className='text-gray-700 text-[15px] leading-relaxed flex-grow'>{quote}</p>

        {/* Author */}
        <div className='flex items-center gap-3'>
          <div className={`w-10 h-10 rounded-full overflow-hidden ${avatarBg} flex items-center justify-center`}>
            <Image
              src='/icons/user-picture.png'
              alt={name}
              width={32}
              height={32}
              className='object-contain'
            />
          </div>
          <span className='font-semibold text-gray-800 text-sm'>{name}</span>
        </div>
      </div>
    </div>
  );
};

interface MarqueeRowProps {
  testimonials: typeof testimonialsData;
  direction?: 'left' | 'right';
  speed?: number;
}

const MarqueeRow = ({ testimonials, direction = 'left', speed = 40 }: MarqueeRowProps) => {
  return (
    <div className='relative w-full overflow-hidden mb-5'>
      <div
        className='flex gap-5 w-fit'
        style={{
          animation: `marquee-${direction} ${speed}s linear infinite`,
        }}
      >
        {testimonials.map((testimonial, index) => (
          <TestimonialCard key={index} {...testimonial} />
        ))}
      </div>
    </div>
  );
};

const Testimonials = () => {
  return (
    <section className='w-full py-20 sm:py-28 bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden'>
      <div className='max-w-[1400px] mx-auto px-5'>
        {/* Header */}
        <div className='text-center mb-16 sm:mb-20'>
          <h2 className='text-4xl sm:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4618AC] via-[#6d3be8] to-[#8660fa] mb-3 tracking-tight'>
            What Our Customers Say
          </h2>
          <p className='text-lg sm:text-xl text-gray-600 font-medium'>
            Honest reviews from our amazing community
          </p>
        </div>

        {/* Marquee Container */}
        <div className='relative'>
          {/* Gradient Overlays */}
          <div className='absolute left-0 top-0 bottom-0 w-32 sm:w-48 bg-gradient-to-r from-white via-white/50 to-transparent z-10 pointer-events-none' />
          <div className='absolute right-0 top-0 bottom-0 w-32 sm:w-48 bg-gradient-to-l from-white via-white/50 to-transparent z-10 pointer-events-none' />

          {/* Marquee Rows */}
          <MarqueeRow testimonials={row1} direction='left' speed={40} />
          <MarqueeRow testimonials={row2} direction='right' speed={35} />
        </div>
      </div>

      <style>{`
        @keyframes marquee-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        @keyframes marquee-right {
          0% {
            transform: translateX(-33.333%);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
};

export default Testimonials;
