import { useCurrency } from '@/lib/utils';
import { useMemo } from 'react';
import type { ProductVariant } from '~/types/product';
import { ScrollArea } from '../ui/scroll-area';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant;
  onSelect: (variant: ProductVariant) => void;
}

const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariant,
  onSelect,
}) => {
  const currency = useCurrency();
  const containerHeightClass = useMemo(
    () => (variants.length > 5 ? 'h-[340px]' : undefined),
    [variants]
  );

  return (
    <div className={containerHeightClass}>
      <ScrollArea className='h-full'>
        <div className='space-y-2'>
          {variants.map(variant => (
            <button
              key={variant.id}
              onClick={() => onSelect(variant)}
              className={`w-full flex items-center justify-between p-4 ${
                selectedVariant.id === variant.id
                  ? 'bg-[#4618AC] text-white'
                  : 'bg-black/5 hover:bg-black/10 text-[#212121]'
              } transition-colors`}
            >
              {(() => {
                const parts = variant.name.split('|').map(p => p.trim());
                const main = parts[0];
                const sub = parts.slice(1).join(' | ');
                return (
                  <div className='flex flex-col text-left'>
                    <span>{main}</span>
                    {(sub || variant.region) && (
                      <span className='text-xs uppercase opacity-75'>
                        {sub}
                        {sub && variant.region ? ' | ' : ''}
                        {variant.region ?? ''}
                      </span>
                    )}
                  </div>
                );
              })()}
              <div className='flex items-center gap-2'>
                <span className='font-bold'>
                  {variant.price} {currency}
                </span>
                {selectedVariant.id === variant.id && (
                  <div className='w-2 h-2 rounded-full bg-[#23c299]' />
                )}
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default VariantSelector;
