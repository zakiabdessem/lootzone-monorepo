"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "../ui/button";

export default function ProductCategories() {
  const [showAll, setShowAll] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const { data: categories, isLoading } = api.category.getProduct.useQuery();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    // Check on mount
    checkScreenSize();

    // Add event listener for resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Calculate initial items to show based on screen size
  // Mobile: 2 columns × 4 rows = 8 items
  // Web: 7 columns × 2 rows = 14 items
  const initialItems = isLargeScreen ? 14 : 8;
  const displayedCategories = showAll
    ? categories || []
    : (categories || []).slice(0, initialItems);

  if (isLoading) {
    return (
      <section className="bg-white top-[112px] z-40 py-12">
        <div className="max-w-[1440px] mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-text-primary flex items-center gap-2">
            Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            {Array.from({ length: initialItems }).map((_, i) => (
              <div key={i} className="UCOPAE rounded-none">
                <div className="h-6 w-12 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="flex-1 flex items-center justify-center mb-2">
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <section className="bg-white top-[112px] z-40 py-12">
        <div className="max-w-[1440px] mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-text-primary flex items-center gap-2">
            Categories
          </h2>
          <p className="text-gray-500 text-center">No categories available</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white top-[112px] z-40 py-12">
      <div className="max-w-[1440px] mx-auto px-4">
        {/* Title */}
        <h2 className="text-2xl font-bold mb-6 text-text-primary flex items-center gap-2">
          Categories
        </h2>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          {displayedCategories.map((category) => {
            const categorySlug = category.slug || category.name.toLowerCase().replace(/\s+/g, '-');
            return (
              <Link
                key={category.id}
                href={`/products?cats=${categorySlug}`}
                className="UCOPAE rounded-none cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <span className="text-white text-lg font-semibold mb-2">
                  {category._count?.products ?? 0}
                </span>
                <div className="flex-1 flex items-center justify-center mb-2">
                  <Image
                    src={category.icon ?? ""}
                    alt={category.name ?? ""}
                    width={32}
                    height={32}
                    className="w-8 h-8 invert"
                  />
                </div>
                <span className="text-white text-sm font-medium">
                  {category.name ?? ""}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Show More/Less Button */}
        {(categories?.length ?? 0) > initialItems && (
          <div className="flex justify-center mt-4 max-w-56 mx-auto">
            <Button
              onClick={() => setShowAll(!showAll)}
              className="text-[#4618AC] border w-full border-[#4618AC] hover:border-[#fad318] bg-transparent mt-6 rounded-none cursor-pointer hover:text-[#f8f7ff] hover:bg-[#4618AC]"
            >
              {showAll ? "Show Less" : "Show More"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
