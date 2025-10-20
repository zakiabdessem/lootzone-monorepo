'use client';
import { formatDA } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
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
  price,
  originalPrice,
  region = 'GLOBAL',
  liked = false,
}) => {
  // 🐛 DEBUG: Log product data
  console.log('🔍 [ProductCard] Rendering product:', { id, title, variants });

  const { isLiked, toggle, isUpdating } = useWishlist();
  const { addToCart, isInCart, isUpdating: isCartUpdating } = useCart();
  const [showCartSuccess, setShowCartSuccess] = useState(false);

  // Get cheapest AVAILABLE variant (not out of stock)
  const availableVariants = useMemo(() => {
    if (!variants || variants.length === 0) return [];
    return variants.filter(v => v.isInfiniteStock || (v.stock ?? 0) > 0);
  }, [variants]);

  // Get price from cheapest available variant OR use direct price (for Algolia results)
  const firstVariant = useMemo(() => {
    if (availableVariants.length > 0) {
      // Sort by price ascending and get cheapest available variant
      return [...availableVariants].sort((a, b) => a.price - b.price)[0];
    }
    // Fallback for Algolia results or products without variants
    if (price !== undefined) {
      return {
        id: `${id}-default`,
        name: 'Default',
        price: price,
        originalPrice: originalPrice,
      };
    }
    // If no available variants, return first variant (for out of stock display)
    return variants?.[0] || null;
  }, [availableVariants, variants, price, originalPrice, id]);

  const discount = getDiscountPercent(firstVariant?.originalPrice ?? 0, firstVariant?.price ?? 0);

  // Check if out of stock
  // A product is out of stock if ALL variants have finite stock (isInfiniteStock: false) AND stock is 0
  const isOutOfStock = useMemo(() => {
    if (!variants || variants.length === 0) {
      console.log('🔍 [ProductCard] No variants found for:', title);
      return false;
    }
    
    const result = variants.every(v => {
      // If infinite stock is enabled, product is available
      if (v.isInfiniteStock) {
        console.log('🔍 [ProductCard] Variant has infinite stock:', { title, variant: v.name, isInfiniteStock: v.isInfiniteStock });
        return false;
      }
      
      // If stock is undefined or null, treat as 0
      const currentStock = v.stock ?? 0;
      
      console.log('🔍 [ProductCard] Checking variant stock:', { 
        title, 
        variant: v.name, 
        stock: v.stock, 
        currentStock, 
        isInfiniteStock: v.isInfiniteStock 
      });
      
      // Out of stock if stock is 0 and not infinite
      return currentStock === 0;
    });
    
    console.log('🔍 [ProductCard] Out of stock result:', { title, isOutOfStock: result });
    return result;
  }, [variants, title]);

  const likedComputed = useMemo(() => liked || isLiked(id), [liked, id, isLiked]);

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUpdating) {
      await toggle(id);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!firstVariant || isCartUpdating) return;

    try {
      await addToCart(id, firstVariant.id, 1);
      setShowCartSuccess(true);
      setTimeout(() => setShowCartSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const inCart = firstVariant ? isInCart(id, firstVariant.id) : false;

  return (
    <div className={`group relative flex flex-col bg-[#4618AC] border border-[#63e3c2] overflow-hidden hover:shadow-lg transition-all duration-200 w-[200px] h-[405.2px] ${
      isOutOfStock ? 'opacity-60 grayscale' : ''
    }`}>
      {/* Out of Stock Overlay */}
      {isOutOfStock && (
        <div className='absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none'>
          <div className='bg-red-600 text-white px-6 py-3 rounded-lg font-bold text-lg transform -rotate-12 shadow-2xl border-2 border-red-400'>
            OUT OF STOCK
          </div>
        </div>
      )}
      
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
            className={`w-full cursor-pointer h-[35px] text-[0.75rem] font-extrabold transition-colors ${
              isOutOfStock
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                : showCartSuccess
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : inCart
                ? 'bg-gray-400 hover:bg-gray-500 text-white'
                : 'bg-[#fad318] hover:bg-primary-600 text-black'
            } ${isCartUpdating || isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={handleAddToCart}
            disabled={isCartUpdating || isOutOfStock}
          >
            {isOutOfStock
              ? 'OUT OF STOCK'
              : isCartUpdating
              ? 'ADDING...'
              : showCartSuccess
              ? '✓ ADDED!'
              : inCart
              ? 'IN CART'
              : 'Add to cart'}
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
