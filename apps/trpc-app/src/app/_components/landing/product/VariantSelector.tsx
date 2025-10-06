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

    return (
      <button
        key={variant.id}
        className={`w-full flex items-center justify-between p-4 rounded-lg ${
          isSelected
            ? 'bg-[#4618AC] text-white shadow-lg shadow-[#4618AC]/30'
            : 'bg-black/5 hover:bg-black/10 text-[#212121]'
        } transition-all duration-300`}
      >
        <div className='flex flex-col text-left'>
          <span className='font-medium'>{main}</span>
          {(sub || variant.region) && (
            <span className='text-xs uppercase opacity-75'>
              {sub}
              {sub && variant.region ? ' | ' : ''}
              {variant.region ?? ''}
            </span>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <span className='font-bold'>
            {variant.price} {currency}
          </span>
          {isSelected && (
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
      showGradients={true}
      enableArrowNavigation={true}
      displayScrollbar={true}
      initialSelectedIndex={initialSelectedIndex}
    />
  );
};

export default VariantSelector;
