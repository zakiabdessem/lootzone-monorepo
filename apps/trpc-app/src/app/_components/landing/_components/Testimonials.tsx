'use client';

import { CheckCircle, Quote, Star } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

const testimonialsData = [
  {
    name: 'Sara M.',
    quote: 'Franchement meilleure boutique, safe w rapide.',
    avatarBg: 'bg-pink-100',
    rating: 5,
  },
  {
    name: 'Nassim Lekhdari',
    quote: '3andi déjà commandé 4 fois, jamais eu un souci. Recommande +++',
    avatarBg: 'bg-green-100',
    rating: 4.5,
  },
  {
    name: 'Lina Ait',
    quote: 'J’ai acheté une carte Spotify, reçu en 2 minutes, top!',
    avatarBg: 'bg-red-100',
    rating: 4,
  },
  {
    name: 'Fares DZ',
    quote: 'l’instant delivery nta3 Steam Card 🔥🔥',
    avatarBg: 'bg-blue-100',
    rating: 5,
  },
];

const Testimonials = () => {
  const [testimonials] = useState(testimonialsData);

  return (
    <section className='py-20 bg-gray-50 dot-background'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-extrabold text-[#212121] sm:text-4xl'>
            What Our Customers Say
          </h2>
          <p className='mt-4 text-lg text-gray-600'>Honest reviews from our amazing users.</p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {testimonials.map((testimonial, index) => {
            const fullStars = Math.floor(testimonial.rating);
            const hasHalfStar = testimonial.rating % 1 !== 0;

            return (
              <div
                key={index}
                className='bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 ease-in-out'
              >
                <div className='p-8 flex flex-col h-full justify-between'>
                  <div>
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center'>
                        {[...Array(5)].map((_, i) => {
                          if (i < fullStars) {
                            return (
                              <Star key={i} className='w-5 h-5 text-[#4618AC]' fill='#4618AC' />
                            );
                          }
                          if (i === fullStars && hasHalfStar) {
                            return (
                              <div key={i} className='relative'>
                                <Star className='w-5 h-5 text-gray-300' fill='currentColor' />
                                <div className='absolute top-0 left-0 h-full w-1/2 overflow-hidden'>
                                  <Star className='w-5 h-5 text-[#4618AC]' fill='#4618AC' />
                                </div>
                              </div>
                            );
                          }
                          return (
                            <Star key={i} className='w-5 h-5 text-gray-300' fill='currentColor' />
                          );
                        })}
                      </div>
                      <div className='flex items-center text-xs text-green-600 font-semibold'>
                        <CheckCircle className='w-4 h-4 mr-1' />
                        <span>Verified Purchase</span>
                      </div>
                    </div>
                    <div className='relative'>
                      <Quote className='absolute -left-3 -top-2 w-10 h-10 text-gray-100 transform rotate-180' />
                      <p className='relative text-gray-600 text-lg italic'>{testimonial.quote}</p>
                    </div>
                  </div>

                  <div className='mt-12 flex items-center'>
                    <div
                      className={`relative w-14 h-14 rounded-lg overflow-hidden ${testimonial.avatarBg}`}
                    >
                      <Image
                        src='/icons/user-picture.png'
                        alt={testimonial.name}
                        fill
                        sizes='56px'
                        className='object-contain p-1'
                      />
                    </div>
                    <div className='ml-4'>
                      <p className='font-bold text-gray-800'>{testimonial.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
