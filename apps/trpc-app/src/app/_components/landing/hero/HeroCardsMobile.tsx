'use client';

import { Region } from '~/constants/enums';
import type { IProductCard } from '~/types/product';
import CategoryBar from '../_components/CategoryBar';
import MembershipBadge from '../_components/MembershipBadge';
import { ProductCard } from '../product/ProductCard';
import RippleGrid from './RippleGrid';

export default function HeroCardsMobile() {
  const products: IProductCard[] = [
    {
      id: 'destiny-2-the-edge-of-fate',
      slug: 'destiny-2-the-edge-of-fate',
      image: '/product-placeholder.jpg',
      platformShow: false,
      platformIcon: null,
      platformName: null,
      title: 'Destiny 2: The Edge of Fate',
      region: Region.GLOBAL,
      liked: false,
      variants: [
        {
          id: 'destiny-2-the-edge-of-fate',
          name: 'Destiny 2: The Edge of Fate',
          price: 1874,
          originalPrice: 2499,
        },
      ],
    },
    {
      id: 'playstation-deals',
      slug: 'playstation-deals',
      image: '/product-placeholder2.jpg',
      platformShow: false,
      platformIcon: null,
      platformName: null,
      title: 'PlayStation Deals',
      region: Region.GLOBAL,
      liked: false,
      variants: [
        {
          id: 'playstation-deals',
          name: 'PlayStation Deals',
          price: 1599,
          originalPrice: 1999,
        },
      ],
    },
    {
      id: 'save-15-more',
      slug: 'save-15-more',
      image: '/product-placeholder.jpg',
      platformShow: false,
      platformIcon: null,
      platformName: null,
      title: 'Save 15% More',
      region: Region.GLOBAL,
      liked: false,
      variants: [
        {
          id: 'save-15-more',
          name: 'Save 15% More',
          price: 2549,
          originalPrice: 2999,
        },
      ],
    },
    {
      id: 'nutaku-gold',
      slug: 'nutaku-gold',
      image: '/product-placeholder2.jpg',
      platformShow: false,
      platformIcon: null,
      platformName: null,
      title: 'Nutaku Gold',
      region: Region.GLOBAL,
      liked: false,
      variants: [
        {
          id: 'nutaku-gold',
          name: 'Nutaku Gold',
          price: 799,
          originalPrice: 999,
        },
      ],
    },
  ];

  return (
    <section className='section sm:hidden no-scrollbar max-md:top-6 relative'>
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
            <div key={idx} className='snap-center shrink-0'>
              <ProductCard {...product} platformShow={true} />
            </div>
          ))}
        </div>
      </div>

      <CategoryBar />
    </section>
  );
}
