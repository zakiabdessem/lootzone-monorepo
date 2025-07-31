import { useCurrency } from '@/lib/utils';
import type { ProductVariant } from '~/types/product';

interface PriceDisplayProps {
  variant: ProductVariant;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ variant }) => {
  const currency = useCurrency();
  return (
    <div className='text-3xl font-extrabold text-[#4618AC] mb-4'>
      {variant.price} {currency}
    </div>
  );
};

export default PriceDisplay;
