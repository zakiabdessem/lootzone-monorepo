"use client";

import type { Slide } from "@/types/product";
import { gsap } from "gsap";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import MembershipBadge from "../_components/MembershipBadge";
import { ProductCard } from "../product/ProductCard";
import HeroTextAnimated from "./HeroTextAnimated";
import { Region, Platform } from "~/constants/enums";

export default function HeroCarousel() {
  const slides: Slide[] = [
    {
      label: "MINTY\nLEGENDS",
      product: {
        id: "clm8k5x2g0001abc123def456",
        slug: "fortnite-minty-legends-pack-1000-vbucks",
        image: "/product-placeholder.jpg",
        platformShow: true,
        platformIcon: "/drms/xbox.svg",
        platformName: Platform.XBOX,
        title: "Fortnite Minty Legends Pack + 1000 V-Bucks",
        region: Region.GLOBAL,
        liked: true,
        variants: [
          {
            id: "var_minty_legends_001",
            name: "Xbox Live Key - GLOBAL",
            price: 5.25,
            originalPrice: 29.99,
            region: Region.GLOBAL,
            attributes: {
              platform: "Xbox Live",
              type: "Game Pack + V-Bucks",
              includes: ["Minty Legends Pack", "1000 V-Bucks"],
              activationRegion: "Global",
            },
          },
        ],
      },
    },
    {
      label: "OPEN\nWORLD",
      product: {
        id: "clm8k5x2g0002ghi789jkl012",
        slug: "grand-theft-auto-v-premium-online-edition-rockstar",
        image: "/product-placeholder2.jpg",
        platformShow: true,
        platformIcon: "/drms/rockstar.svg",
        platformName: Platform.ROCKSTAR,
        title: "Grand Theft Auto V: Premium Online Edition",
        region: Region.GLOBAL,
        liked: false,
        variants: [
          {
            id: "var_gta_v_premium_001",
            name: "Rockstar Games Launcher Key - GLOBAL",
            price: 1.99,
            originalPrice: 19.99,
            region: Region.GLOBAL,
            attributes: {
              platform: "Rockstar Games Launcher",
              type: "Full Game",
              includes: [
                "Base Game",
                "Criminal Enterprise Starter Pack",
                "GTA$ 1,000,000",
              ],
              activationRegion: "Global",
              languages: ["English", "French", "Spanish", "German", "Italian"],
            },
          },
        ],
      },
    },
    {
      label: "GIFT\nCARDS",
      product: {
        id: "clm8k5x2g0003mno345pqr678",
        slug: "steam-wallet-gift-card-50-eur",
        image: "/product-placeholder.jpg",
        platformShow: true,
        platformIcon: "/drms/steam.svg",
        platformName: Platform.STEAM,
        title: "Steam Wallet Gift Card 50 EUR",
        region: Region.EU,
        liked: false,
        variants: [
          {
            id: "var_steam_card_50_eur",
            name: "Steam Gift Card 50 EUR - Europe",
            price: 44.99,
            originalPrice: 50.0,
            region: Region.EU,
            attributes: {
              platform: "Steam",
              type: "Gift Card",
              value: "50 EUR",
              currency: "EUR",
              activationRegion: "Europe",
              validity: "No expiration",
            },
          },
        ],
      },
    },
  ];

  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  /* -----------------------------
   * Auto-cycle every 7 seconds (uses fresh index)
   * ---------------------------*/
  useEffect(() => {
    const timeout = setTimeout(() => {
      goToSlide((index + 1) % slides.length);
    }, 7000);

    return () => clearTimeout(timeout);
  }, [index]);

  // Update vertical bar progress as the slide advances
  useEffect(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    const startTime = Date.now();
    setProgress(0);

    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(100, (elapsed / 7000) * 100);
      setProgress(newProgress);
    }, 50);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [index]);

  const goToSlide = (newIndex: number) => {
    setProgress(0);
    setIndex(newIndex);
  };

  const prev = () => {
    goToSlide((index - 1 + slides.length) % slides.length);
  };

  const next = () => {
    goToSlide((index + 1) % slides.length);
  };

  const currentSlide = slides[index];

  // animate card on index change
  const cardRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 40 }, // keep initial scale from CSS
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    );
  }, [index]);

  // Add mouse drag/swipe support
  const dragState = useRef<{ startX: number | null }>({ startX: null });

  const handleMouseDown = (e: React.MouseEvent) => {
    dragState.current.startX = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (dragState.current.startX === null) return;
    const deltaX = e.clientX - dragState.current.startX;
    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) {
        next(); // swipe left, go to next
      } else {
        prev(); // swipe right, go to prev
      }
    }
    dragState.current.startX = null;
  };

  const handleMouseLeave = () => {
    dragState.current.startX = null;
  };

  // Add guard clause to prevent rendering if no current slide
  if (!currentSlide) {
    return null;
  }

  return (
    <section className="section grid-overlay overflow-x-hidden">
      <div className="flex flex-col justify-center items-center relative bottom-12 w-full">
        {/* Membership badge */}
        <div className="flex justify-center py-6 relative bottom-8 w-full">
          <MembershipBadge />
        </div>

        <div
          className="flex justify-between items-center gap-8 relative max-[1113px]:flex-col max-[1113px]:gap-6 w-full max-w-[1400px] mx-auto"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {/* Content */}
          <div className="flex-1 min-w-0 w-full max-[1113px]:order-2 max-[1113px]:px-4">
            <HeroTextAnimated
              label={currentSlide?.label}
              currentSlide={currentSlide}
            />
          </div>
          <div
            ref={cardRef}
            className="shrink-0 relative scale-110 md:scale-125 max-[1113px]:scale-100 max-[1113px]:order-1"
          >
            {currentSlide?.product && <ProductCard {...currentSlide.product} />}
          </div>

          {/* Vertical progress indicator */}
          <div className="absolute left-0 sm:-left-12 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
            {slides.map((_, i) => (
              <div
                key={i}
                className="relative h-20 w-3 cursor-pointer"
                onClick={() => goToSlide(i)}
              >
                {/* Background bar */}
                <div
                  className={`absolute inset-0 rounded-full ${
                    i < index ? "bg-[#4618AC]" : "bg-[#4618AC]/30"
                  } shadow-md border border-[#4618AC]/40`}
                ></div>

                {/* Current slide progress */}
                {i === index && (
                  <div
                    className="absolute left-0 top-0 w-3 rounded-full bg-[#4618AC] transition-all duration-100 shadow-lg border border-[#4618AC]"
                    style={{ height: `${progress}%` }}
                  ></div>
                )}
              </div>
            ))}
          </div>
          {/* Right arrow */}
          {/* <button
          onClick={next}
          aria-label="Next slide"
          className="absolute right-0 cursor-pointer translate-x-full sm:translate-x-1/2 bg-[#4618AC]/80 text-white p-2 rounded-full hover:bg-[#4618AC] z-40 flex items-center justify-center max-[1113px]:hidden"
        >
          <ArrowRight className="w-5 h-5" />
        </button> */}
        </div>
      </div>
    </section>
  );
}
