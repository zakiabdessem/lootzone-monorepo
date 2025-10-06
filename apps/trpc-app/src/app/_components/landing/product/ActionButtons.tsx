'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "../ui/button";
import { useCart } from '~/hooks/useCart';
import type { ProductVariant } from '~/types/product';

type ActionButtonsProps = {
  productId: string;
  productTitle: string;
  productImage: string;
  selectedVariant: ProductVariant;
};

const ActionButtons: React.FC<ActionButtonsProps> = ({
  productId,
  productTitle,
  productImage,
  selectedVariant,
}) => {
  const router = useRouter();
  const { addToCart, isInCart } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return;
    
    setIsAddingToCart(true);
    try {
      await addToCart(productId, selectedVariant.id, 1);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleCheckoutNow = async () => {
    if (!selectedVariant?.id) return;
    
    setIsCheckingOut(true);
    try {
      // Add to cart without toast
      await addToCart(productId, selectedVariant.id, 1);
      // Redirect to checkout immediately
      router.push('/checkout');
    } catch (error) {
      console.error('Error adding to cart:', error);
      setIsCheckingOut(false);
    }
  };

  const inCart = isInCart(productId, selectedVariant?.id);

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button 
        onClick={handleAddToCart}
        disabled={isAddingToCart || inCart}
        className={`w-full cursor-pointer h-[45px] text-sm font-medium transition-colors ${
          inCart 
            ? 'bg-gray-400 hover:bg-gray-400 text-white cursor-not-allowed' 
            : 'bg-[#fad318] hover:bg-[#fad318]/80 text-black'
        }`}
      >
        {isAddingToCart ? 'Adding...' : inCart ? 'In Cart' : 'Add to cart'}
      </Button>
      <Button 
        onClick={handleCheckoutNow}
        disabled={isCheckingOut || !selectedVariant?.id}
        className="w-full cursor-pointer bg-[#4618AC] hover:bg-[#4618AC]/80 text-white h-[45px] text-sm font-medium"
      >
        {isCheckingOut ? 'Processing...' : 'Checkout Now'}
      </Button>
    </div>
  );
};

export default ActionButtons;
