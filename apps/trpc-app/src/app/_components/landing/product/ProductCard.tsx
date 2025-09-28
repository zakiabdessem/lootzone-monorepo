'use client';
import { formatDA } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';

import { useWishlist } from '@/hooks/useWishlist';
import { getDiscountPercent } from '@/lib/utils';
import type { IProductCard } from '@/types/product';
import { upperFirst } from 'lodash';
import { Button } from '../ui/button';

/**
 * Product card expects the minimal product data + a couple of UI flags.
 * We extend IProductCard to customise defaults (e.g. platformShow).
 */
export const ProductCard: React.FC<IProductCard> = ({
  id,
  slug,
  image,
  platformShow = false,
  platformIcon = null,
  platformName = null,
  title,
  variants,
  region = 'GLOBAL',
  liked = false,
}) => {
  const { isLiked, toggle, isUpdating } = useWishlist();

  // Get price/originalPrice from first variant
  const firstVariant = variants[0];

  const discount = getDiscountPercent(firstVariant?.originalPrice ?? 0, firstVariant?.price);

  const likedComputed = useMemo(() => liked || isLiked(id), [liked, id, isLiked]);

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUpdating) {
      await toggle(id);
    }
  };

  return (
    <div className='group relative flex flex-col bg-[#4618AC] border border-[#63e3c2] overflow-hidden hover:shadow-lg transition-shadow duration-200 w-[200px] h-[405.2px]'>
      {/* Image */}
      <div className='relative aspect-[4/5] w-full'>
        <Link href={`/product/${slug}`} className='absolute inset-0'>
          <Image
            src={image}
            alt={title}
            fill
            sizes='(max-width: 768px) 100vw, 350px'
            className='object-cover transition-transform duration-300 group-hover:scale-105'
          />
        </Link>

        {/* Platform badge */}
        {platformShow && platformIcon && platformName && (
          <div className='absolute bottom-0 left-0 right-0 gap-1 text-xs bg-black/20 backdrop-blur-sm px-2 py-1 z-30 transition-transform duration-200 group-hover:-translate-y-28'>
            <div className='flex justify-center items-center gap-1 relative right-[2px]'>
              <Image
                src={platformIcon}
                alt={platformName}
                width={16}
                height={16}
                className='w-4 h-4'
              />
              <span className='text-white truncate text-xs font-sans font-semibold'>
                {upperFirst(platformName)}
              </span>
            </div>
          </div>
        )}

        {/* Wishlist icon */}
        {/* <button
          aria-label="Add to wishlist"
          className="absolute top-2 right-2 p-1 rounded text-white/90 bg-black/40 hover:bg-black/60"
        >
          <Heart className="w-4 h-4" />
        </button> */}
      </div>

      {/* Content */}
      <div className='p-3 flex flex-col gap-1 flex-1 transition-transform duration-200 relative z-10 group-hover:-translate-y-28 bg-[#4618AC]'>
        {/* Title */}
        <h3 className='text-sm font-medium text-white line-clamp-2'>{title}</h3>

        {/* Region if not GLOBAL use this #e76a8c */}
        <span className='text-[11px] uppercase text-[#23c299] font-semibold'>{region}</span>

        {/* Price section */}
        {discount > 0 && (
          <div className='text-xs text-gray-400'>
            From <span className='line-through'>{formatDA(firstVariant?.originalPrice ?? 0)}</span>{' '}
            <span className='text-primary-400 font-semibold'>-{discount}%</span>
          </div>
        )}
        <div className='text-xl font-bold text-white leading-none mt-auto mb-[5px]'>
          {formatDA(firstVariant?.price ?? 0)}
        </div>

        <div className='text-[11px] text-primary-400 font-medium flex justify-start items-center gap-1 mt-auto'>
          <div className='flex items-center justify-center gap-1'>
            <button
              className={`product-slider__fav js-fav cursor-pointer rotate-90 h-4 w-4 mr-2 ${
                isUpdating ? 'opacity-50 pointer-events-none' : ''
              }`}
              onClick={handleHeartClick}
              disabled={isUpdating}
            >
              <span className={`heart ${likedComputed ? 'is-active' : ''}`}></span>{' '}
            </button>

            {/* <span className="heart"></span> */}
            <button
              className={`text-gray-200 pb-[8px] ${
                isUpdating ? 'opacity-50 pointer-events-none' : ''
              }`}
              onClick={handleHeartClick}
              disabled={isUpdating}
            >
              {isUpdating ? 'UPDATING...' : likedComputed ? 'ADDED TO WISHLIST' : 'ADD TO WISHLIST'}
            </button>
          </div>
        </div>
      </div>

      {/* Hover Actions */}
      <div className='absolute inset-x-0 bottom-0 bg-[#4618AC] translate-y-full group-hover:translate-y-0 transition-transform duration-200 z-20'>
        <div className='bg-primary-900 p-3 flex flex-col gap-2'>
          <Button
            style={{ fontFamily: '"Metropolis", Arial, Helvetica, sans-serif' }}
            className='w-full cursor-pointer bg-[#fad318] hover:bg-primary-600 text-black h-[35px] text-[0.75rem] font-extrabold'
          >
            Add to cart
          </Button>
          <Link
            href={`/product/${slug}`}
            className='w-full text-[0.65rem] cursor-pointer text-center py-2 border border-white text-white bg-primary-900 hover:bg-primary-800 rounded-none'
          >
            Explore options
          </Link>
        </div>
      </div>
    </div>
  );
};
