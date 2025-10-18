'use client';

import type { Slide } from '@/types/product';
import { gsap } from 'gsap';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Platform, Region } from '~/constants/enums';
import { api } from '~/trpc/react';
import MembershipBadge from '../_components/MembershipBadge';
import { ProductCard } from '../product/ProductCard';
import HeroTextAnimated from './HeroTextAnimated';
import RippleGrid from './RippleGrid';

export default function HeroCarousel() {
  const { data: heroSlides, isLoading } = api.heroSlide.getAll.useQuery();
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Debug: Log the raw data from API
  useEffect(() => {
    if (heroSlides) {
      console.log('🔍 HeroCarousel - Raw heroSlides data:', heroSlides);
      heroSlides.forEach((slide, idx) => {
        console.log(`Slide ${idx} - Product:`, slide.product.title);
        console.log(`Slide ${idx} - Variants:`, slide.product.variants);
      });
    }
  }, [heroSlides]);

  // Transform database slides to component format
  const slides: Slide[] =
    heroSlides?.map(slide => ({
      label: slide.label,
      product: {
        id: slide.product.id,
        slug: slide.product.slug,
        image: slide.product.image,
        platformShow: !!slide.product.platformIcon,
        platformIcon: slide.product.platformIcon,
        platformName: slide.product.platformName as Platform,
        title: slide.product.title,
        region: slide.product.region as Region,
        liked: false, // This would need to be determined by user preferences
        variants: slide.product.variants.map(variant => {
          const mapped = {
            id: variant.id,
            name: variant.name,
            price: Number(variant.price),
            originalPrice: variant.originalPrice ? Number(variant.originalPrice) : undefined,
            region: slide.product.region as Region,
            stock: variant.stock,
            isInfiniteStock: variant.isInfiniteStock,
          };
          console.log('🔄 Mapped variant:', mapped);
          return mapped;
        }),
      },
    })) || [];

  // Debug: Log transformed slides
  useEffect(() => {
    if (slides.length > 0) {
      console.log('✅ Transformed slides:', slides);
    }
  }, [slides]);

  /* -----------------------------
   * Auto-cycle every 7 seconds (uses fresh index)
   * ---------------------------*/
  useEffect(() => {
    if (slides.length === 0) return;

    const timeout = setTimeout(() => {
      goToSlide((index + 1) % slides.length);
    }, 7000);

    return () => clearTimeout(timeout);
  }, [index, slides.length]);

  // Update vertical bar progress as the slide advances
  useEffect(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    const startTime = Date.now();
    setProgress(0);

    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(100, (elapsed / 7000) * 100);
      setProgress(newProgress);
    }, 50);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [index]);

  const goToSlide = (newIndex: number) => {
    setProgress(0);
    setIndex(newIndex);
  };

  const prev = () => {
    goToSlide((index - 1 + slides.length) % slides.length);
  };

  const next = () => {
    goToSlide((index + 1) % slides.length);
  };

  const currentSlide = slides[index];

  // animate card on index change
  const cardRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 40 }, // keep initial scale from CSS
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    );
  }, [index]);

  // Add mouse drag/swipe support
  const dragState = useRef<{ startX: number | null }>({ startX: null });

  const handleMouseDown = (e: React.MouseEvent) => {
    dragState.current.startX = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (dragState.current.startX === null) return;
    const deltaX = e.clientX - dragState.current.startX;
    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) {
        next(); // swipe left, go to next
      } else {
        prev(); // swipe right, go to prev
      }
    }
    dragState.current.startX = null;
  };

  const handleMouseLeave = () => {
    dragState.current.startX = null;
  };

  // Show loading or empty state
  if (isLoading || slides.length === 0) {
    return (
      <section className='section overflow-x-hidden relative'>
        <RippleGrid
          enableRainbow={false}
          gridColor="#4618AC"
          rippleIntensity={0.05}
          gridSize={10}
          gridThickness={15}
          mouseInteraction={true}
          mouseInteractionRadius={1.2}
          opacity={0.15}
          vignetteStrength={2.5}
          glowIntensity={0.15}
        />
        <div className='flex flex-col justify-center items-center relative bottom-12 w-full z-10'>
          {/* <div className='flex justify-center py-6 relative bottom-8 w-full'>
            <MembershipBadge />
          </div> */}
          <div className='flex justify-center items-center h-96'>
            {isLoading ? (
              <div className='text-center'>Loading...</div>
            ) : (
              <div className='text-center'>No hero slides configured</div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Add guard clause to prevent rendering if no current slide
  if (!currentSlide) {
    return null;
  }

  return (
    <section className='section overflow-x-hidden relative'>
      <RippleGrid
        enableRainbow={true}
        gridColor="#89d6b4"
        rippleIntensity={0.01}
        gridSize={18}
        gridThickness={50}
        mouseInteraction={false}
        mouseInteractionRadius={1.2}
        opacity={0.25}
        vignetteStrength={2}
        glowIntensity={0.2}
      />
      <div className='flex flex-col justify-center items-center relative bottom-12 w-full z-10'>
        {/* Membership badge */}
        {/* <div className='flex justify-center py-6 relative bottom-8 w-full'>
          <MembershipBadge />
        </div> */}

        <div
          className='flex justify-between items-center gap-8 relative max-[1113px]:flex-col max-[1113px]:gap-6 w-full max-w-[1400px] mx-auto'
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {/* Hero Text - Hidden on Mobile */}
          <div className='flex-1 min-w-0 w-full hidden min-[1114px]:block'>
            <HeroTextAnimated label={currentSlide?.label} currentSlide={currentSlide} />
          </div>
          
          {/* Product Card - Centered on Mobile, Right side on Desktop */}
          <div
            ref={cardRef}
            className='shrink-0 relative scale-110 md:scale-125 max-[1113px]:scale-100 max-[1113px]:mx-auto'
          >
            {currentSlide?.product && <ProductCard {...currentSlide.product} platformShow={true} />}
          </div>

          {/* Vertical progress indicator */}
          <div className='absolute left-0 sm:-left-12 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50'>
            {slides.map((_, i) => (
              <div
                key={i}
                className='relative h-20 w-3 cursor-pointer'
                onClick={() => goToSlide(i)}
              >
                {/* Background bar */}
                <div
                  className={`absolute inset-0 rounded-full ${
                    i < index ? 'bg-[#4618AC]' : 'bg-[#4618AC]/30'
                  } shadow-md border border-[#4618AC]/40`}
                ></div>

                {/* Current slide progress */}
                {i === index && (
                  <div
                    className='absolute left-0 top-0 w-3 rounded-full bg-[#4618AC] transition-all duration-100 shadow-lg border border-[#4618AC]'
                    style={{ height: `${progress}%` }}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
