"use client";

import { useWishlist } from "@/hooks/useWishlist";
import { formatDA, getDiscountPercent } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import type { IProductCard } from "~/types/product";
import { Button } from "../ui/button";
import { useCart } from "@/hooks/useCart";

/**
 * Horizontal version of ProductCard tailored for list views.
 * Keeps the same visual language (purple background, turquoise border, yellow “Add to cart”) but
 * arranges image and details side-by-side.
 */
export const ProductCardHorizontal: React.FC<IProductCard> = ({
  id,
  slug,
  image,
  title,
  region = "GLOBAL",
  variants,
  liked,
}) => {
  const { isLiked, toggle } = useWishlist();
  const { add } = useCart();
  const likedComputed = useMemo(() => liked || isLiked(id), [liked, id, isLiked]);
  const handleHeartClick = () => void toggle(id);

  const firstVariant = variants[0];
  const discount = getDiscountPercent(
    firstVariant?.originalPrice ?? 0,
    firstVariant?.price
  );

  return (
    <div className="group relative flex bg-[#4618AC] border border-[#63e3c2] overflow-hidden hover:shadow-lg transition-shadow duration-200 w-full max-w-[640px]">
      {/* Cover image */}
      <Link
        href={`/product/${slug}`}
        className="relative shrink-0 w-[96px] sm:w-[128px] aspect-[4/5] p-4 ml-2 mt-2 mb-2"
      >
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 96px, 128px"
          className="object-cover"
        />
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between p-3 gap-2">
        {/* Title & region */}
        <div className="flex flex-col gap-1">
          <h3 className="text-sm sm:text-base font-medium text-white line-clamp-2">
            {title}
          </h3>
          <span className="text-[14px] uppercase text-[#23c299] font-semibold">
            {region}
          </span>
        </div>

        {/* Pricing */}
        <div>
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
          <div className="flex items-center justify-center">
            <button
              className="product-slider__fav js-fav cursor-pointer rotate-90 h-4 w-4 ml-2"
              onClick={() => handleHeartClick()}
            >
              <span className={`heart ${likedComputed ? "is-active" : ""}`}></span>{" "}
            </button>
          </div>

          {/* Add to cart */}
          <Button
            style={{ fontFamily: '"Metropolis", Arial, Helvetica, sans-serif' }}
            className="w-full cursor-pointer bg-[#fad318] hover:bg-[#e9c410] text-black h-[35px] text-[0.75rem] font-extrabold max-w-[120px]"
            onClick={() => firstVariant && add(id, firstVariant.id, 1)}
          >
            Add to cart
          </Button>
        </div>
      </div>
    </div>
  );
};
