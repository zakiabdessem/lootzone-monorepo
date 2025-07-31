"use client";

import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { useRef, useState } from "react";
import { ProductCard } from "../product/ProductCard";
import type { IProductCard } from "~/types/product";
import { ProductCardHorizontal } from "../product/ProductCardHorizontal";
import { Region, Platform } from "~/constants/enums";

gsap.registerPlugin(ScrollToPlugin);

export default function RecentlyViewed() {
  const items: IProductCard[] = [
    {
      id: "1",
      slug: "netflix-gift-card-50",
      image: "/product-placeholder.jpg",
      platformShow: false,
      platformIcon: null,
      platformName: null,
      title: "Netflix Gift Card 50 USD",
      region: Region.GLOBAL,
      variants: [
        {
          id: "netflix-gift-card-50",
          name: "Netflix Gift Card 50 USD",
          price: 4599,
          originalPrice: 5000,
        },
      ],
      liked: true,
    },
    {
      id: "2",
      slug: "spotify-gift-card-30",
      image: "/product-placeholder2.jpg",
      platformShow: false,
      platformIcon: null,
      platformName: null,
      title: "Spotify Gift Card 30 EUR",
      region: Region.EU,
      variants: [
        {
          id: "spotify-gift-card-30",
          name: "Spotify Gift Card 30 EUR",
          price: 2650,
          originalPrice: 3000,
        },
      ],
      liked: false,
    },
    {
      id: "3",
      slug: "apple-gift-card-100",
      image: "/product-placeholder.jpg",
      platformShow: true,
      platformIcon: "/drms/xbox.svg",
      platformName: Platform.XBOX,
      title: "Apple Gift Card 100 USD",
      region: Region.US,
      variants: [
        {
          id: "apple-gift-card-100",
          name: "Apple Gift Card 100 USD",
          price: 8999,
          originalPrice: 10000,
        },
      ],
      liked: false,
    },
    {
      id: "4",
      slug: "steam-gift-card-20",
      image: "/product-placeholder2.jpg",
      platformShow: true,
      platformIcon: "/drms/rockstar.svg",
      platformName: Platform.PC,
      title: "Steam Gift Card 20 EUR",
      region: Region.EU,
      variants: [
        {
          id: "steam-gift-card-20",
          name: "Steam Gift Card 20 EUR",
          price: 1850,
          originalPrice: 2000,
        },
      ],
      liked: false,
    },
    {
      id: "5",
      slug: "xbox-gift-card-50",
      image: "/product-placeholder.jpg",
      platformShow: true,
      platformIcon: "/drms/xbox.svg",
      platformName: Platform.XBOX,
      title: "Xbox Gift Card 50 USD",
      region: Region.GLOBAL,
      variants: [
        {
          id: "xbox-gift-card-50",
          name: "Xbox Gift Card 50 USD",
          price: 4499,
          originalPrice: 5000,
        },
      ],
      liked: true,
    },
    {
      id: "6",
      slug: "psn-gift-card-25",
      image: "/product-placeholder2.jpg",
      platformShow: true,
      platformIcon: "/drms/steam.svg",
      platformName: Platform.STEAM,
      title: "PlayStation Store Gift Card 25 USD",
      region: Region.GLOBAL,
      variants: [
        {
          id: "psn-gift-card-25",
          name: "PlayStation Store Gift Card 25 USD",
          price: 2199,
          originalPrice: 2500,
        },
      ],
      liked: false,
    },
    {
      id: "7",
      slug: "xbox-gift-card-50",
      image: "/product-placeholder.jpg",
      platformShow: true,
      platformIcon: "/drms/xbox.svg",
      platformName: Platform.XBOX,
      title: "Xbox Gift Card 50 USD",
      region: Region.GLOBAL,
      variants: [
        {
          id: "xbox-gift-card-50",
          name: "Xbox Gift Card 50 USD",
          price: 4499,
          originalPrice: 5000,
        },
      ],
      liked: true,
    },
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  // Number of cards visible per page (adjust to allow scrolling)
  const perPage = 4;
  const totalPages = Math.ceil(items.length / perPage);
  const [page, setPage] = useState(0);

  const scrollToPage = (pageIndex: number) => {
    if (!containerRef.current) return;

    const cardWidth = 200; // width defined in ProductCard
    const gap = 16; // gap-4 => 1rem => 16px
    const offset = pageIndex * ((cardWidth + gap) * perPage);

    gsap.to(containerRef.current, {
      duration: 0.6,
      scrollTo: { x: offset },
      ease: "power2.out",
    });
  };

  const prev = () => {
    const newPage = (page - 1 + totalPages) % totalPages;
    setPage(newPage);
    scrollToPage(newPage);
  };

  const next = () => {
    const newPage = (page + 1) % totalPages;
    setPage(newPage);
    scrollToPage(newPage);
  };

  return (
    <section className="py-12" style={{ backgroundColor: "#f8f7ff" }}>
      <div className="max-w-[1440px] mx-auto relative px-4">
        <h2 className="text-2xl font-bold mb-6 text-[#212121] flex items-center gap-2">
          Recently Viewed
          <span className="max-md:hidden relative group">
            <Info className="w-5 h-5 text-text-primary cursor-pointer" />
            <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-max px-3 py-1 rounded bg-[#212121] text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap">
              These are the items you recently viewed.
            </span>
          </span>
        </h2>

        {/* Mobile (vertical list) */}
        <div className="md:hidden flex flex-col gap-2">
          {items.slice(0, 10).map((item, i) => (
            <ProductCardHorizontal key={i} {...item} />
          ))}
        </div>

        {/* Desktop / larger screens (carousel) */}
        <div className="relative hidden md:block">
          {/* Cards */}
          <div
            ref={containerRef}
            className="flex gap-4 overflow-hidden"
            style={{ scrollBehavior: "smooth" }}
          >
            {items.map((item, i) => (
              <div key={i} className="shrink-0">
                <ProductCard {...item} />
              </div>
            ))}
          </div>

          {/* Left arrow */}
          <button
            onClick={prev}
            aria-label="Previous page"
            className="absolute -left-4 lg:-left-12 cursor-pointer top-1/2 -translate-y-1/2 bg-[#4618AC]/80 text-white p-2 rounded-full hover:bg-[#4618AC] z-30 hidden md:flex"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Right arrow */}
          <button
            onClick={next}
            aria-label="Next page"
            className="absolute -right-4 lg:-right-12 cursor-pointer top-1/2 -translate-y-1/2 bg-[#4618AC]/80 text-white p-2 rounded-full hover:bg-[#4618AC] z-30 hidden md:flex"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Pagination dots */}
        {/* <div className='hidden md:flex justify-center gap-2 mt-4'>
          {Array.from({ length: totalPages }).map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${i === page ? 'bg-[#4618AC]' : 'bg-[#4618AC]/40'}`}
            />
          ))}
        </div> */}
      </div>
    </section>
  );
}
