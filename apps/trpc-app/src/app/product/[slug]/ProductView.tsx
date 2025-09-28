'use client';

import { useState } from 'react';

import ActionButtons from '~/app/_components/landing/product/ActionButtons';
import InfoTabs from '~/app/_components/landing/product/InfoTabs';
import PriceDisplay from '~/app/_components/landing/product/PriceDisplay';
import ProductImages from '~/app/_components/landing/product/ProductImages';
import VariantSelector from '~/app/_components/landing/product/VariantSelector';
import { Region } from '~/constants/enums';
import type { ProductVariant } from '~/types/product';

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
      id: '',
      name: '',
      price: 0,
      originalPrice: 0,
      region: Region.GLOBAL,
    }
  );

  return (
    <div className='min-h-screen bg-[#f8f7ff] text-[#212121] py-12'>
      <div className='max-w-[1440px] mx-auto px-4 space-y-8'>
        {/* Top section */}
        <div className='grid lg:grid-cols-2 gap-8'>
          {/* Images */}
          <ProductImages image={product.image || ''} gallery={product.gallery || []} />

          {/* Details */}
          <div className='space-y-6'>
            <h1 className='text-2xl font-bold text-gray-900 mb-4'>{product.title}</h1>
            <PriceDisplay variant={selectedVariant} />
            <p className='text-gray-600 leading-relaxed break-words whitespace-pre-wrap'>
              {product.description}
            </p>

            {/* Key Features */}
            {product.keyFeatures && product.keyFeatures.length > 0 && (
              <div className='space-y-2'>
                <h4 className='font-medium text-[#212121]'>Key Features</h4>
                <ul className='grid gap-2 text-sm text-gray-600'>
                  {product.keyFeatures.map((feature, idx) => (
                    <li key={idx} className='flex items-center gap-2'>
                      <div className='w-1 h-1 rounded-full bg-[#23c299]' />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
          deliveryInfo={product.deliveryInfo ?? ''}
          deliverySteps={product.deliverySteps}
          terms={product.terms ?? ''}
          importantNotes={product.importantNotes}
        />
      </div>
    </div>
  );
}
