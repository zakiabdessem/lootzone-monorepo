"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { api } from "~/trpc/react";

export default function CategoryBar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: categories, isLoading } = api.category.getSimple.useQuery();

  const scrollBy = (offset: number) => {
    containerRef.current?.scrollBy({ left: offset, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <section className="min-[1113px]:flex hidden items-center justify-center py-4 relative select-none overflow-hidden mb-6">
        <div className="flex items-center gap-10 px-6 md:px-10 max-w-7xl mx-auto">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center shrink-0 min-w-[72px]"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded animate-pulse" />
              <div className="mt-1 h-3 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="min-[1113px]:flex hidden items-center justify-center py-4 relative select-none overflow-hidden mb-6">
      {/* Left Arrow */}
      <button
        aria-label="Scroll left"
        onClick={() => scrollBy(-300)}
        className="absolute left-0 md:left-2 top-1/2 -translate-y-1/2 text-black/70 hover:text-black p-1 lg:hidden"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Categories */}
      <div
        ref={containerRef}
        className="flex items-center gap-10 overflow-x-auto lg:overflow-visible px-6 md:px-10 max-w-7xl mx-auto no-scrollbar"
      >
        {categories.map((cat) => {
          const categorySlug = cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-');
          return (
            <Link
              key={cat.id}
              href={`/products?cats=${categorySlug}`}
              className="flex flex-col items-center justify-center shrink-0 min-w-[72px] cursor-pointer group"
            >
              <Image
                src={cat.icon ?? ""}
                alt={cat.name ?? ""}
                width={32}
                height={32}
                className="w-8 h-8 md:w-10 md:h-10 opacity-70 grayscale transition duration-200 group-hover:opacity-100 group-hover:grayscale-0"
              />
              <span className="mt-1 text-xs md:text-sm text-text-primary whitespace-nowrap font-medium transition-colors duration-200 group-hover:text-black">
                {cat.name ?? ""}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Right Arrow */}
      <button
        aria-label="Scroll right"
        onClick={() => scrollBy(300)}
        className="absolute right-0 md:right-2 top-1/2 -translate-y-1/2 text-black/70 hover:text-black p-1 lg:hidden"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </section>
  );
}
