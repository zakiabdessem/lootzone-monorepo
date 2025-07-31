"use client";

import { useState } from "react";

import siteSettings from "@/lib/site-settings.json";
import VariantSelector from "~/app/_components/landing/product/VariantSelector";
import ActionButtons from "~/app/_components/landing/product/ActionButtons";
import InfoTabs from "~/app/_components/landing/product/InfoTabs";
import PriceDisplay from "~/app/_components/landing/product/PriceDisplay";
import ProductImages from "~/app/_components/landing/product/ProductImages";
import { Region, Platform, ProductCategory } from "~/constants/enums";
import type { ProductVariant } from "~/types/product";

// Simple Product type for sample data - aligned with Prisma schema
interface SampleProduct {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  gallery: string[];
  platformIcon?: string;
  platformName?: string;
  region: Region;
  isDlc?: boolean;
  // categoryId would be required for real DB operations
  variants: ProductVariant[];
  keyFeatures: string[];
  deliveryInfo: string;
  deliverySteps: string[];
  terms: string;
  importantNotes: string[];
  isActive?: boolean;
}

const sampleProduct: SampleProduct = {
  id: "1",
  slug: "apple-gift-card-100",
  title: "APPLE ITUNES GIFT CARD 10 USD ITUNES KEY UNITED STATES",
  description:
    "iTunes Gift Card code is redeemable for apps, games, music, movies, TV shows and more on the iTunes Store, App Store, iBooks Store, and the Mac App Store. Recipients can access their content on an iPhone, iPad, or iPod, and watch or listen on a computer – Mac or PC.",
  image: "/product-placeholder.jpg",
  gallery: [
    "/product-placeholder.jpg",
    "/images/itunes-card.png",
    "/images/itunes-card.png",
  ],
  platformIcon: "/drms/apple.svg",
  platformName: "Apple",
  region: Region.GLOBAL,
  isDlc: false,
  isActive: true,
  // Note: These prices should be in cents (999 = $9.99) to match Decimal storage
  variants: [
    {
      id: "1",
      name: "1 Month | CONSOLE & PC",
      price: 9.99, // Changed to decimal format
      originalPrice: 12.0,
      region: Region.GLOBAL,
      attributes: {},
    },
    {
      id: "2",
      name: "3 Months | CONSOLE & PC | 10 USD",
      price: 29.99,
      originalPrice: 35.0,
      region: Region.GLOBAL,
      attributes: {},
    },
    {
      id: "3",
      name: "6 Months | CONSOLE & PC",
      price: 54.99,
      originalPrice: 60.0,
      region: Region.GLOBAL,
      attributes: {},
    },
    {
      id: "4",
      name: "1 Year  | CONSOLE & PC",
      price: 89.0,
      originalPrice: 100.0,
      region: Region.GLOBAL,
      attributes: {},
    },
    {
      id: "5",
      name: "2 Year  | CONSOLE & PC",
      price: 89.0,
      originalPrice: 110.0,
      region: Region.GLOBAL,
      attributes: {},
    },
    {
      id: "6",
      name: "3 Year  | CONSOLE & PC",
      price: 89.0,
      originalPrice: 120.0,
      region: Region.GLOBAL,
      attributes: {},
    },
  ],
  keyFeatures: siteSettings.defaultProduct.keyFeatures,
  deliveryInfo: siteSettings.defaultProduct.deliveryInfo,
  deliverySteps: siteSettings.defaultProduct.deliverySteps,
  terms: siteSettings.defaultProduct.terms,
  importantNotes: siteSettings.defaultProduct.importantNotes,
};

function ProductPage({ product = sampleProduct }: { product?: SampleProduct }) {
  const variants = product.variants ?? [];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    variants[0] ?? {
      id: "",
      name: "",
      price: 0,
      originalPrice: 0,
      region: Region.GLOBAL,
      attributes: {},
    }
  );

  return (
    <div className="min-h-screen bg-[#f8f7ff] text-[#212121] py-12">
      <div className="max-w-[1440px] mx-auto px-4 space-y-8">
        {/* Top section */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Images */}
          <ProductImages
            image={product.image || ""}
            gallery={product.gallery || []}
          />

          {/* Details */}
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {product.title}
            </h1>
            <PriceDisplay variant={selectedVariant} />
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>

            {/* Variants */}
            <VariantSelector
              variants={variants}
              selectedVariant={selectedVariant}
              onSelect={setSelectedVariant}
            />

            {/* CTAs */}
            <ActionButtons />
          </div>
        </div>

        {/* Tabbed info */}
        <InfoTabs
          description={product.description}
          keyFeatures={product.keyFeatures}
          deliveryInfo={product.deliveryInfo}
          deliverySteps={product.deliverySteps}
          terms={product.terms}
          importantNotes={product.importantNotes}
        />
      </div>
    </div>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  // TODO: fetch product by slug; for now use sampleProduct
  return <ProductPage />;
}
