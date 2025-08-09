"use client";

import { useSmartCategories } from "@/lib/smart-categories";

import { useWishlist } from "@/hooks/useWishlist";
import { useAnnouncement, useCurrency } from "@/lib/utils";
import { Heart, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import CategoriesSidebar from "./CategoriesSidebar";
import { useCart } from "@/hooks/useCart";

const categories = [
  { id: "categories", label: "Categories" },
  { id: "shop", label: "Shop" },
  { id: "cheap-games", label: "Cheap Games" },
  { id: "trending", label: "Trending Now" },
  { id: "deals", label: "Deals" },
];

export function Navbar() {
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const currency = useCurrency();
  const announcement = useAnnouncement();
  const smartCategories = useSmartCategories();
  const { ids, mergeGuestToServer, isAuthenticated } = useWishlist();
  const { itemCount, subtotal, currency: cartCurrency } = useCart();

  useEffect(() => {
    if (isAuthenticated) {
      void mergeGuestToServer();
    }
  }, [isAuthenticated, mergeGuestToServer]);
  return (
    <nav
      className="w-full bg-white text-gray-900"
      style={{
        boxSizing: "border-box",
        borderWidth: "0 0 1px 0",
        borderStyle: "solid",
        borderColor: "#e5e7eb",
      }}
    >
      {/* Fixed Wrapper containing announcement + main nav */}
      <div className="fixed top-0 left-0 right-0 z-50 w-full">
        {announcement && showAnnouncement && (
          <div className="w-full bg-gradient-to-r from-[#6d3be8] via-[#4618AC] to-[#2d0e5e] text-white text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-0 py-2 px-4 text-center relative">
            <div dangerouslySetInnerHTML={{ __html: announcement.html }} />
            <button
              className="absolute lg:right-2 right-4 top-2"
              onClick={() => setShowAnnouncement(false)}
              aria-label="Close announcement"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Main Navbar */}
        <div
          className="lg:px-12 bg-white border-b border-gray-200 max-md:h-16 h-20"
          style={{ display: "flex", alignItems: "center" }}
        >
          <div className="flex items-center justify-between w-full max-md:px-6">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              {/* Mobile logo (icon or stacked) */}
              <Image
                src="/logo.png"
                alt="LOOT"
                width={64}
                height={64}
                className="block sm:hidden"
              />

              {/* Desktop / tablet horizontal logo */}
              <Image
                src="/logo-horizontal.png"
                alt="LOOT"
                width={180}
                height={64}
                className="hidden sm:block"
              />
            </Link>

            {/* Search Bar (hidden on mobile) */}
            <div className="hidden md:block flex-1 max-w-2xl mx-8">
              <div className="relative transition-all duration-200">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for games, top-ups and more"
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 text-gray-900 border-[1px] border-gray-200 focus:ring-[#4618AC]"
                />
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Wishlist */}
              <Link href="/wishlist" className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-700 hover:bg-gray-100 cursor-pointer"
                  aria-label="Wishlist"
                >
                  <Heart className="h-5 w-5" />
                </Button>
                {ids.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#4618AC] text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none">
                    {ids.length}
                  </span>
                )}
              </Link>

              {/* Mobile search icon */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-700 hover:bg-gray-100 cursor-pointer"
                  onClick={() => setMobileSearchOpen((prev) => !prev)}
                >
                  {mobileSearchOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                </Button>
              </div>

              <Button className="hidden md:flex space-x-1 hover:bg-gray-100 cursor-pointer">
                <User className="h-5 w-5" />

                <span>Log in</span>
              </Button>

              {/* Cart */}
              <Link href="/cart">
                <Button variant="secondary" className="space-x-1 cursor-pointer">
                  <ShoppingCart className="h-5 w-5" />
                  <span>{itemCount}</span>
                  <span>{cartCurrency}</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Search Panel */}
        {mobileSearchOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 px-6 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for games, top-ups and more"
                className="w-full pl-10 pr-4 py-2 bg-gray-50 text-gray-900 border-[1px] border-gray-200 focus:ring-[#4618AC]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Categories Bar (hidden on mobile) */}
      <div
        className="hidden md:block bg-gray-50/20 py-4"
        style={{ marginTop: showAnnouncement ? "112px" : "80px" }}
      >
        <div className="lg:mx-12 px-4">
          <div className="flex items-center space-x-6 -my-4">
            {categories.map((category) =>
              category.id === "categories" ? (
                <Sheet key={category.id}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-primary hover:bg-gray-100 h-auto px-2 text-sm py-4"
                    >
                      <Menu className="h-4 w-4 mr-2" />
                      {category.label}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0">
                    <CategoriesSidebar />
                  </SheetContent>
                </Sheet>
              ) : (
                <Button
                  key={category.id}
                  className="text-primary hover:bg-gray-100 h-auto px-2 text-sm py-4"
                >
                  {category.label}
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
