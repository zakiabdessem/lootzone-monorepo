'use client';

import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { useRef, useState } from 'react';
import { api } from '~/trpc/react';
import { ProductCard } from '../product/ProductCard';
import { ProductCardHorizontal } from '../product/ProductCardHorizontal';

gsap.registerPlugin(ScrollToPlugin);

export default function RecentlyViewed() {
  const { data: items, isLoading } = api.product.getRecentlyViewed.useQuery({ limit: 16 });
  const productItems = items ?? [];

  const containerRef = useRef<HTMLDivElement>(null);
  // Number of cards visible per page (adjust to allow scrolling)
  const perPage = 4;
  const totalPages = Math.ceil(productItems.length / perPage) || 1;
  const [page, setPage] = useState(0);

  const scrollToPage = (pageIndex: number) => {
    if (!containerRef.current) return;

    const cardWidth = 200; // width defined in ProductCard
    const gap = 16; // gap-4 => 1rem => 16px
    const offset = pageIndex * ((cardWidth + gap) * perPage);

    gsap.to(containerRef.current, {
      duration: 0.6,
      scrollTo: { x: offset },
      ease: 'power2.out',
    });
  };

  const prev = () => {
    const newPage = (page - 1 + totalPages) % totalPages;
    setPage(newPage);
    scrollToPage(newPage);
  };

  const next = () => {
    const newPage = (page + 1) % totalPages;
    setPage(newPage);
    scrollToPage(newPage);
  };

  // Don't render section if no products are available
  if (!isLoading && productItems.length === 0) {
    return null;
  }

  return (
    <section className='py-12' style={{ backgroundColor: '#f8f7ff' }}>
      <div className='max-w-[1440px] mx-auto relative px-4'>
        <h2 className='text-2xl font-bold mb-6 text-[#212121] flex items-center gap-2'>
          Recently Viewed
          <span className='max-md:hidden relative group'>
            <Info className='w-5 h-5 text-text-primary cursor-pointer' />
            <span className='absolute left-1/2 -translate-x-1/2 mt-2 w-max px-3 py-1 rounded bg-[#212121] text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap'>
              These are the items you recently viewed.
            </span>
          </span>
        </h2>

        {/* Mobile (vertical list) */}
        <div className='md:hidden flex flex-col gap-2'>
          {isLoading ? (
            <div className='text-sm text-gray-500'>Loading...</div>
          ) : (
            productItems
              .slice(0, 10)
              .map((item, i) => <ProductCardHorizontal key={i} {...(item as any)} />)
          )}
        </div>

        {/* Desktop / larger screens (carousel) */}
        <div className='relative hidden md:block'>
          {/* Cards */}
          <div
            ref={containerRef}
            className='flex gap-4 overflow-hidden'
            style={{ scrollBehavior: 'smooth' }}
          >
            {(isLoading ? Array.from({ length: 8 }) : productItems).map((item, i) => (
              <div key={i} className='shrink-0'>
                {isLoading ? (
                  <div className='w-[200px] h-[395px] bg-gray-200 animate-pulse' />
                ) : (
                  <ProductCard {...(item as any)} platformShow={true} />
                )}
              </div>
            ))}
          </div>

          {/* Left arrow */}
          <button
            onClick={prev}
            aria-label='Previous page'
            className='absolute -left-4 lg:-left-12 cursor-pointer top-1/2 -translate-y-1/2 bg-[#4618AC]/80 text-white p-2 rounded-full hover:bg-[#4618AC] z-30 hidden md:flex'
          >
            <ArrowLeft className='w-5 h-5' />
          </button>

          {/* Right arrow */}
          <button
            onClick={next}
            aria-label='Next page'
            className='absolute -right-4 lg:-right-12 cursor-pointer top-1/2 -translate-y-1/2 bg-[#4618AC]/80 text-white p-2 rounded-full hover:bg-[#4618AC] z-30 hidden md:flex'
          >
            <ArrowRight className='w-5 h-5' />
          </button>
        </div>
      </div>
    </section>
  );
}
