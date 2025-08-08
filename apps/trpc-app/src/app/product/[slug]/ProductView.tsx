"use client";

import { useState } from "react";

import ActionButtons from "~/app/_components/landing/product/ActionButtons";
import InfoTabs from "~/app/_components/landing/product/InfoTabs";
import PriceDisplay from "~/app/_components/landing/product/PriceDisplay";
import ProductImages from "~/app/_components/landing/product/ProductImages";
import VariantSelector from "~/app/_components/landing/product/VariantSelector";
import { Region } from "~/constants/enums";
import type { ProductVariant } from "~/types/product";

type ViewProduct = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  gallery: string[];
  platformIcon?: string | null;
  platformName?: string | null;
  region: Region;
  variants: ProductVariant[];
  keyFeatures: string[];
  deliveryInfo?: string | null;
  deliverySteps: string[];
  terms?: string | null;
  importantNotes: string[];
};

export default function ProductView({ product }: { product: ViewProduct }) {
  const variants = product.variants ?? [];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    variants[0] ?? {
      id: "",
      name: "",
      price: 0,
      originalPrice: 0,
      region: Region.GLOBAL,
    },
  );

  return (
    <div className="min-h-screen bg-[#f8f7ff] text-[#212121] py-12">
      <div className="max-w-[1440px] mx-auto px-4 space-y-8">
        {/* Top section */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Images */}
          <ProductImages image={product.image || ""} gallery={product.gallery || []} />

          {/* Details */}
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{product.title}</h1>
            <PriceDisplay variant={selectedVariant} />
            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            {/* Variants */}
            <VariantSelector
              variants={variants}
              selectedVariant={selectedVariant}
              onSelect={setSelectedVariant}
            />

            {/* CTAs */}
            <ActionButtons productId={product.id} variantId={selectedVariant.id} />
          </div>
        </div>

        {/* Tabbed info */}
        <InfoTabs
          description={product.description}
          keyFeatures={product.keyFeatures}
          deliveryInfo={product.deliveryInfo ?? ""}
          deliverySteps={product.deliverySteps}
          terms={product.terms ?? ""}
          importantNotes={product.importantNotes}
        />
      </div>
    </div>
  );
}
