'use client';

import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ArrowLeft, ArrowRight, Info } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { api } from '~/trpc/react';
import { ProductCard } from '../product/ProductCard';
import { ProductCardHorizontal } from '../product/ProductCardHorizontal';
import { Button } from '../ui/button';

gsap.registerPlugin(ScrollToPlugin);

export default function RecommendedForYou() {
  const { data, isLoading } = api.product.list.useQuery({ limit: 16 });
  const items = data?.items ?? [];

  const containerRef = useRef<HTMLDivElement>(null);
  // Number of cards visible per page (adjust to allow scrolling)
  const perPage = 4;
  const totalPages = Math.ceil(items.length / perPage) || 1;
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

  return (
    <section className='py-24'>
      <div className='max-w-[1440px] mx-auto relative px-4'>
        <h2 className='text-2xl font-bold mb-6 text-[#212121] flex items-center gap-2'>
          Recommended For You
          <span className='max-md:hidden relative group'>
            <Info className='w-5 h-5 text-text-primary cursor-pointer' />
            <span className='absolute left-1/2 -translate-x-1/2 mt-2 w-max px-3 py-1 rounded bg-[#212121] text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap'>
              These are the items we think you'll like.
            </span>
          </span>
        </h2>

        {/* Mobile (vertical list) */}
        <div className='md:hidden flex flex-col gap-2'>
          {isLoading ? (
            <div className='text-sm text-gray-500'>Loading...</div>
          ) : (
            items
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
            {(isLoading ? Array.from({ length: 8 }) : items).map((item, i) => (
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

        {/* Show all button */}
        <Link href='/products' className='flex justify-center mt-4 max-w-56 mx-auto'>
          <Button className='text-[#4618AC] border w-full border-[#4618AC] hover:border-[#fad318] bg-transparent mt-6 rounded-none cursor-pointer hover:text-[#f8f7ff]  hover:bg-[#4618AC]'>
            Show All
          </Button>
        </Link>

        {/* Pagination dots
        <div className='hidden md:flex justify-center gap-2 mt-4'>
          {Array.from({ length: totalPages }).map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${i === page ? 'bg-[#4618AC]' : 'bg-[#4618AC]/40'}`}
            />
          ))}
        </div> */}
      </div>
    </section>
  );
}
