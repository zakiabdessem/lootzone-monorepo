"use client";

import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { formatDA, getDiscountPercent } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { upperFirst } from "lodash";
import type { IProductCard } from "~/types/product";
import { Button } from "../ui/button";

/**
 * Horizontal version of ProductCard tailored for list views.
 * Keeps the same visual language (purple background, turquoise border, yellow “Add to cart”) but
 * arranges image and details side-by-side.
 */
export const ProductCardHorizontal: React.FC<IProductCard> = ({
  id,
  slug,
  image,
  platformIcon = null,
  platformName = null,
  title,
  region = "GLOBAL",
  variants,
  liked,
}) => {
  const { isLiked, toggle } = useWishlist();
  const { addToCart, isInCart, isUpdating } = useCart();
  const [showSuccess, setShowSuccess] = useState(false);
  
  const likedComputed = useMemo(() => liked || isLiked(id), [liked, id, isLiked]);
  const handleHeartClick = () => void toggle(id);

  // Get cheapest AVAILABLE variant (not out of stock)
  const availableVariants = useMemo(() => {
    if (!variants || variants.length === 0) return [];
    return variants.filter(v => v.isInfiniteStock || (v.stock ?? 0) > 0);
  }, [variants]);

  // Get cheapest available variant or fallback to first variant
  const firstVariant = useMemo(() => {
    if (availableVariants.length > 0) {
      return [...availableVariants].sort((a, b) => a.price - b.price)[0];
    }
    return variants[0];
  }, [availableVariants, variants]);

  const discount = getDiscountPercent(
    firstVariant?.originalPrice ?? 0,
    firstVariant?.price
  );

  // Check if out of stock
  // A product is out of stock if ALL variants have finite stock (isInfiniteStock: false) AND stock is 0
  const isOutOfStock = useMemo(() => {
    if (!variants || variants.length === 0) return false;
    
    return variants.every(v => {
      // If infinite stock is enabled, product is available
      if (v.isInfiniteStock) return false;
      
      // If stock is undefined or null, treat as 0
      const currentStock = v.stock ?? 0;
      
      // Out of stock if stock is 0 and not infinite
      return currentStock === 0;
    });
  }, [variants]);

  const inCart = firstVariant ? isInCart(id, firstVariant.id) : false;

  const handleAddToCart = async () => {
    if (!firstVariant || isUpdating) return;

    try {
      await addToCart(id, firstVariant.id, 1);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  return (
    <div className={`group relative flex bg-[#4618AC] border border-[#63e3c2] overflow-hidden hover:shadow-lg transition-all duration-200 w-full max-w-[640px] ${
      isOutOfStock ? 'opacity-60 grayscale' : ''
    }`}>
      {/* Out of Stock Badge */}
      {isOutOfStock && (
        <div className='absolute top-2 right-2 z-40 bg-red-600 text-white px-3 py-1 rounded-md font-bold text-xs shadow-lg border border-red-400'>
          OUT OF STOCK
        </div>
      )}
      
      {/* Cover image */}
      <Link
        href={`/product/${slug}`}
        className="relative shrink-0 w-[96px] sm:w-[128px] aspect-[4/5] p-4"
      >
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 96px, 128px"
          className="object-cover"
        />

        {/* Platform Icon */}
        {platformIcon && platformName && (
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1.5 z-10">
            <Image
              src={platformIcon}
              alt={platformName}
              width={14}
              height={14}
              className="w-3.5 h-3.5"
            />
            <span className="text-white text-[10px] font-semibold uppercase">
              {upperFirst(platformName)}
            </span>
          </div>
        )}
      </Link>

      {/* Details - Clickable on mobile */}
      <Link 
        href={`/product/${slug}`}
        className="flex flex-1 flex-col justify-between p-3 gap-2 md:pointer-events-none"
        onClick={(e) => {
          // Prevent navigation on desktop
          if (window.innerWidth >= 768) {
            e.preventDefault();
          }
        }}
      >
        {/* Title & region */}
        <div className="flex flex-col gap-1 pointer-events-none">
          <h3 className="text-sm sm:text-base font-medium text-white line-clamp-2">
            {title}
          </h3>
          <span className="text-[14px] uppercase text-[#23c299] font-semibold">
            {region}
          </span>
        </div>

        {/* Pricing */}
        <div className="pointer-events-none">
          <div className="text-xs text-gray-300 space-x-1">
            {discount > 0 && (
              <>
                <span className="line-through">
                  {formatDA(firstVariant?.originalPrice ?? 0)}
                </span>
                <span className="text-primary-400 font-semibold">
                  -{discount}%
                </span>
              </>
            )}
          </div>
          <div className="text-lg font-bold text-white leading-none">
            {formatDA(firstVariant?.price ?? 0)}
          </div>
        </div>

        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center justify-center pointer-events-auto">
            <button
              className="product-slider__fav js-fav cursor-pointer rotate-90 h-4 w-4 ml-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleHeartClick();
              }}
            >
              <span className={`heart ${likedComputed ? "is-active" : ""}`}></span>{" "}
            </button>
          </div>

          {/* Add to cart */}
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={isUpdating || isOutOfStock}
            style={{ 
              fontFamily: '"Metropolis", Arial, Helvetica, sans-serif',
              backgroundColor: isOutOfStock ? '#6b7280' : showSuccess ? '#10b981' : inCart ? '#9ca3af' : '#fad318'
            }}
            className={`w-full cursor-pointer hover:opacity-90 text-black h-[35px] text-[0.75rem] font-extrabold max-w-[120px] transition-colors pointer-events-auto ${
              isOutOfStock ? 'text-gray-300 cursor-not-allowed' : ''
            }`}
          >
            {isOutOfStock ? 'OUT OF STOCK' : isUpdating ? 'ADDING...' : showSuccess ? '✓ ADDED!' : inCart ? 'IN CART' : 'Add to cart'}
          </Button>
        </div>
      </Link>
    </div>
  );
};
