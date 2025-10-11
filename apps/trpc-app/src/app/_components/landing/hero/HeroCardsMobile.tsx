'use client';

import { Platform, Region } from '~/constants/enums';
import { api } from '~/trpc/react';
import CategoryBar from '../_components/CategoryBar';
import MembershipBadge from '../_components/MembershipBadge';
import { ProductCard } from '../product/ProductCard';
import RippleGrid from './RippleGrid';

export default function HeroCardsMobile() {
  const { data: heroSlides, isLoading } = api.heroSlide.getAll.useQuery();

  // Transform database slides to component format (same as desktop)
  const products =
    heroSlides?.map(slide => ({
      id: slide.product.id,
      slug: slide.product.slug,
      image: slide.product.image,
      platformShow: !!slide.product.platformIcon,
      platformIcon: slide.product.platformIcon,
      platformName: slide.product.platformName as Platform,
      title: slide.product.title,
      region: slide.product.region as Region,
      liked: false, // This would need to be determined by user preferences
      variants: slide.product.variants.map(variant => ({
        id: variant.id,
        name: variant.name,
        price: Number(variant.price),
        originalPrice: variant.originalPrice ? Number(variant.originalPrice) : undefined,
        region: slide.product.region as Region,
      })),
    })) || [];

  // Show loading or empty state
  if (isLoading || products.length === 0) {
    return (
      <section className='section sm:hidden no-scrollbar relative'>
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
        <div className='section-inner px-4 relative z-10'>
          <div className='flex justify-center my-4 relative bottom-8'>
            <MembershipBadge />
          </div>
          <div className='flex justify-center items-center h-96'>
            {isLoading ? (
              <div className='text-center'>Loading...</div>
            ) : (
              <div className='text-center'>No hero slides configured</div>
            )}
          </div>
        </div>
        <CategoryBar />
      </section>
    );
  }

  return (
    <section className='section sm:hidden no-scrollbar relative'>
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
      <div className='section-inner px-4 relative z-10'>
        {/* Membership badge */}
        <div className='flex justify-center my-4 relative bottom-8'>
          <MembershipBadge />
        </div>

        <div className='flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar'>
          {products.map((product, idx) => (
            <div key={product.id} className='snap-center shrink-0'>
              <ProductCard {...product} platformShow={true} />
            </div>
          ))}
        </div>
      </div>

      <CategoryBar />
    </section>
  );
}
