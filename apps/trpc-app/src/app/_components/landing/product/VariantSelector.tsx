// import { useCurrency } from '~/contexts/SiteSettingsContext';
import type { ProductVariant } from '~/types/product';
import AnimatedList from './AnimatedList';

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
  // const currency = useCurrency();
  const currency = 'DZD'; // Default currency

  const variantItems = variants.map((variant) => {
    const parts = variant.name.split('|').map(p => p.trim());
    const main = parts[0];
    const sub = parts.slice(1).join(' | ');
    const isSelected = selectedVariant.id === variant.id;
    
    // Check if variant is out of stock
    const isOutOfStock = !variant.isInfiniteStock && (variant.stock ?? 0) === 0;

    return (
      <button
        key={variant.id}
        disabled={isOutOfStock}
        className={`w-full flex items-center justify-between p-4 rounded-lg relative ${
          isOutOfStock
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
            : isSelected
            ? 'bg-[#4618AC] text-white shadow-lg shadow-[#4618AC]/30'
            : 'bg-black/5 hover:bg-black/10 text-[#212121]'
        } transition-all duration-300`}
      >
        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <div className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white'>
            <span className='text-white text-xs font-bold'>✕</span>
          </div>
        )}
        
        <div className='flex flex-col text-left'>
          <span className={`font-medium ${isOutOfStock ? 'line-through' : ''}`}>{main}</span>
          {(sub || variant.region) && (
            <span className='text-xs uppercase opacity-75'>
              {sub}
              {sub && variant.region ? ' | ' : ''}
              {variant.region ?? ''}
            </span>
          )}
          {isOutOfStock && (
            <span className='text-xs text-red-500 font-semibold mt-1'>Out of Stock</span>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <span className={`font-bold ${isOutOfStock ? 'line-through' : ''}`}>
            {variant.price} {currency}
          </span>
          {isSelected && !isOutOfStock && (
            <div className='w-2 h-2 rounded-full bg-[#23c299] animate-pulse' />
          )}
        </div>
      </button>
    );
  });

  const initialSelectedIndex = variants.findIndex(v => v.id === selectedVariant.id);

  return (
    <AnimatedList
      items={variantItems}
      onItemSelect={(index) => onSelect(variants[index]!)}
      showGradients={variants.length > 2}
      enableArrowNavigation={true}
      displayScrollbar={true}
      initialSelectedIndex={initialSelectedIndex}
    />
  );
};

export default VariantSelector;
