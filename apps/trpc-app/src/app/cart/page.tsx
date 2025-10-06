'use client';

import { formatDA } from '@/lib/utils';
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '~/hooks/useCart';
import { Button } from '../_components/landing/ui/button';

export default function CartPage() {
  const router = useRouter();
  const {
    cartDetails,
    subtotal,
    itemCount,
    uniqueItemCount,
    updateQuantity,
    removeFromCart,
    clearCart,
    isLoading,
    isUpdating,
  } = useCart();

  const handleQuantityChange = async (productId: string, variantId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateQuantity(productId, variantId, newQuantity);
  };

  const handleRemoveItem = async (productId: string, variantId: string) => {
    await removeFromCart(productId, variantId);
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-[#f8f7ff] flex items-center justify-center py-12'>
        <div className='max-w-6xl mx-auto px-4 w-full'>
          <div className='flex flex-col items-center justify-center text-center py-12'>
            <div className='inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#4618AC] border-t-transparent mb-4'></div>
            <p className='text-lg text-gray-600'>Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (cartDetails.length === 0) {
    return (
      <div className='min-h-screen bg-[#f8f7ff] flex items-center justify-center py-12'>
        <div className='max-w-md mx-auto px-4 w-full'>
          <div className='flex flex-col items-center justify-center text-center py-12'>
            <ShoppingCart className='w-20 h-20 mx-auto text-gray-400 mb-6' />
            <h2 className='text-2xl md:text-3xl font-bold mb-3 text-[#212121]'>Your cart is empty</h2>
            <p className='text-gray-600 mb-8 text-base md:text-lg'>Add some awesome products to get started!</p>
            <Link href='/products' className='w-full max-w-xs'>
              <Button className='bg-[#4618AC] hover:bg-[#381488] text-white w-full h-12 text-base font-semibold'>
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#f8f7ff] pt-32 pb-12'>
      <div className='max-w-6xl mx-auto px-4'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row justify-between items-center mb-6 gap-4'>
          <h1 className='text-2xl md:text-3xl font-bold text-[#212121] text-center sm:text-left'>Shopping Cart</h1>
          <Button
            variant='ghost'
            onClick={handleClearCart}
            disabled={isUpdating}
            className='text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto'
          >
            <Trash2 className='w-4 h-4 mr-2' />
            Clear Cart
          </Button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Cart Items */}
          <div className='lg:col-span-2 space-y-4'>
            {cartDetails.map((item) => (
              <div
                key={`${item.productId}-${item.variantId}`}
                className='bg-white rounded-none shadow-sm p-4 sm:p-5 relative'
              >
                {/* Remove Button - Top Right */}
                <button
                  onClick={() => handleRemoveItem(item.productId, item.variantId)}
                  disabled={isUpdating}
                  className='absolute top-3 right-3 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 z-10'
                  aria-label='Remove item'
                >
                  <X className='w-5 h-5' />
                </button>

                <div className='flex gap-4'>
                  {/* Product Image */}
                  <Link
                    href={`/product/${item.product.slug}`}
                    className='flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 relative rounded-md overflow-hidden bg-gray-100'
                  >
                    <Image
                      src={item.product.image}
                      alt={item.product.title}
                      fill
                      className='object-cover hover:scale-105 transition-transform'
                    />
                  </Link>

                  {/* Product Details - Takes remaining space */}
                  <div className='flex-1 min-w-0 pr-6'>
                    <Link href={`/product/${item.product.slug}`}>
                      <h3 className='font-semibold text-[#212121] hover:text-[#4618AC] line-clamp-2 text-sm sm:text-base transition-colors'>
                        {item.product.title}
                      </h3>
                    </Link>
                    <p className='text-xs sm:text-sm text-gray-600 mt-1'>{item.variant.name}</p>
                    <p className='text-xs text-[#23c299] mt-1 font-semibold uppercase tracking-wide'>
                      {item.product.region}
                    </p>
                    
                    {/* Price */}
                    <div className='mt-2 flex items-baseline gap-2'>
                      {item.variant.originalPrice && item.variant.originalPrice > item.variant.price && (
                        <span className='text-xs sm:text-sm text-gray-400 line-through'>
                          {formatDA(item.variant.originalPrice)}
                        </span>
                      )}
                      <span className='text-base sm:text-lg font-bold text-[#4618AC]'>
                        {formatDA(item.variant.price)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quantity Controls and Total - Bottom Section */}
                <div className='flex items-center justify-between mt-4 pt-4 border-t border-gray-100'>
                  {/* Quantity Controls */}
                  <div className='flex items-center gap-3'>
                    <span className='text-xs sm:text-sm text-gray-600 font-medium'>Quantity:</span>
                    <div className='flex items-center border border-gray-300 rounded-md overflow-hidden'>
                      <button
                        onClick={() =>
                          handleQuantityChange(item.productId, item.variantId, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1 || isUpdating}
                        className='p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                        aria-label='Decrease quantity'
                      >
                        <Minus className='w-3 h-3 sm:w-4 sm:h-4' />
                      </button>
                      <span className='w-10 sm:w-12 text-center font-semibold text-sm sm:text-base'>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(item.productId, item.variantId, item.quantity + 1)
                        }
                        disabled={isUpdating}
                        className='p-2 hover:bg-gray-100 disabled:opacity-50 transition-colors'
                        aria-label='Increase quantity'
                      >
                        <Plus className='w-3 h-3 sm:w-4 sm:h-4' />
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className='text-right'>
                    <p className='text-xs text-gray-500 mb-0.5'>Total</p>
                    <p className='text-base sm:text-lg font-bold text-[#212121]'>
                      {formatDA(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className='lg:col-span-1'>
            <div className='bg-white shadow-sm p-6 sticky top-24'>
              <h2 className='text-xl font-bold mb-4 text-[#212121]'>Order Summary</h2>

              <div className='space-y-3 mb-6'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Items ({uniqueItemCount})</span>
                  <span className='text-gray-600'>{itemCount} total</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Subtotal</span>
                  <span className='font-semibold'>{formatDA(subtotal)}</span>
                </div>
                <div className='border-t pt-3'>
                  <div className='flex justify-between text-lg font-bold'>
                    <span className='text-[#212121]'>Total</span>
                    <span className='text-[#4618AC]'>{formatDA(subtotal)}</span>
                  </div>
                </div>
              </div>

              <Button
                className='w-full bg-[#4618AC] hover:bg-[#381488] text-white h-12 text-base font-bold rounded-none'
                onClick={() => router.push('/checkout')}
              >
                Proceed to Checkout
              </Button>

              <Link href='/products' className='w-full'>
                <Button
                  variant='outline'
                  className='w-full mt-3 border-[#4618AC] text-[#4618AC] hover:bg-[#4618AC] hover:text-white rounded-none'
                >
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
