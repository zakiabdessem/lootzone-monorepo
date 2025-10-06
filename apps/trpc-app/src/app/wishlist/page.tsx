'use client';

import { useWishlist } from '@/hooks/useWishlist';
import { useMemo } from 'react';
import { api } from '~/trpc/react';
import { ProductCard } from '../_components/landing/product/ProductCard';
import { Platform } from '~/constants/enums';

export default function WishlistPage() {
  const { ids, isAuthenticated } = useWishlist();

  const { data: serverItems, isLoading: loadingServer } = api.product.getFavoritesDetailed.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: guestItems, isLoading: loadingGuest } = api.product.getByIds.useQuery(
    { ids },
    { enabled: !isAuthenticated && ids.length > 0 }
  );

  const items = useMemo(() => {
    if (isAuthenticated) return serverItems ?? [];
    return guestItems ?? [];
  }, [isAuthenticated, serverItems, guestItems]);

  const isLoading = isAuthenticated ? loadingServer : loadingGuest;

  return (
    <div className='min-h-screen bg-[#f8f7ff] relative z-0'>
      <div className='max-w-[1440px] mx-auto px-4 py-10'>
        <h1 className='text-2xl font-bold mb-6 text-[#212121]'>Your Wishlist</h1>
        {isLoading ? (
          <div>Loading...</div>
        ) : items.length === 0 ? (
          <div className='text-sm text-gray-600'>Your wishlist is empty.</div>
        ) : (
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
            {items.map(p => (
              <ProductCard 
                key={p.id} 
                {...p} 
                platformName={p.platformName as Platform | null | undefined}
                platformShow={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
