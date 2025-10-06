'use client';

import { useState } from 'react';
import Image from 'next/image';
import { upperFirst } from 'lodash';

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
    <div className='min-h-screen bg-[#f8f7ff] text-[#212121] py-12 relative z-0'>
      <div className='max-w-[1440px] mx-auto px-4 space-y-8'>
        {/* Top section */}
        <div className='grid lg:grid-cols-2 gap-8'>
          {/* Images */}
          <ProductImages image={product.image || ''} gallery={product.gallery || []} />

          {/* Details */}
          <div className='space-y-6'>
            <div className='flex items-center justify-between gap-4'>
              <h1 className='text-2xl font-bold text-gray-900 flex-1'>{product.title}</h1>
              {product.platformIcon && product.platformName && (
                <div className='group relative perspective-1000'>
                  {/* Glass morphism container */}
                  <div className='relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl transition-all duration-500 hover:shadow-[0_8px_32px_rgba(70,24,172,0.4)] hover:scale-105 hover:rotate-y-12'>
                    {/* Gradient overlay */}
                    <div className='absolute inset-0 bg-gradient-to-br from-[#4618AC]/30 via-transparent to-[#63e3c2]/30 opacity-60' />

                    {/* Shimmer effect */}
                    <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000' />

                    {/* Content */}
                    <div className='relative flex items-center gap-3 px-5 py-3'>
                      {/* Icon with glass circle background */}
                      <div className='relative'>
                        <div className='absolute inset-0 bg-gradient-to-br from-[#63e3c2]/40 to-[#4618AC]/40 rounded-full blur-lg scale-150 group-hover:scale-175 transition-transform duration-500' />
                        <div className='relative w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:rotate-[360deg] transition-transform duration-700'>
                          <Image
                            src={product.platformIcon}
                            alt={product.platformName}
                            width={24}
                            height={24}
                            className='w-6 h-6 filter drop-shadow-lg'
                          />
                        </div>
                      </div>

                      {/* Platform name */}
                      <span className='text-white font-bold text-sm uppercase tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]'>
                        {upperFirst(product.platformName)}
                      </span>
                    </div>

                    {/* Bottom accent line */}
                    <div className='absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#63e3c2] to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300' />
                  </div>

                  {/* Floating glow effect */}
                  <div className='absolute -inset-2 bg-gradient-to-br from-[#4618AC]/20 to-[#63e3c2]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10' />
                </div>
              )}
            </div>
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
            <ActionButtons
              productId={product.id}
              productTitle={product.title}
              productImage={product.image}
              selectedVariant={selectedVariant}
            />
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
