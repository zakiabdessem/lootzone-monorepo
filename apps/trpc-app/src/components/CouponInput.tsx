'use client';

import { useState, useCallback } from 'react';
import { api } from '~/trpc/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { CheckCircle2, XCircle, Loader2, Tag } from 'lucide-react';

interface CouponInputProps {
  subtotal: number;
  onCouponApplied?: (data: { code: string; discountAmount: number }) => void;
  onCouponRemoved?: () => void;
  appliedCoupon?: { code: string; discountAmount: number } | null;
  email?: string;
  ipAddress?: string;
  sessionToken?: string;
  className?: string;
}

export function CouponInput({
  subtotal,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon,
  email,
  ipAddress,
  sessionToken,
  className = '',
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState('');

  // Mutation to validate coupon
  const validateCoupon = api.coupon.validateCoupon.useMutation({
    onSuccess: (data) => {
      setError('');
      if (onCouponApplied) {
        onCouponApplied({
          code: data.code,
          discountAmount: data.discountAmount,
        });
      }
      setCouponCode(''); // Clear input after successful application
    },
    onError: (error) => {
      setError(error.message || 'Invalid coupon code');
    },
  });

  const handleApply = useCallback(() => {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    if (subtotal <= 0) {
      setError('Add items to cart before applying coupon');
      return;
    }

    setError('');
    validateCoupon.mutate({
      code: couponCode.trim(),
      subtotal,
      email,
      ipAddress,
      sessionToken,
    });
  }, [couponCode, subtotal, email, ipAddress, sessionToken, validateCoupon]);

  const handleRemove = useCallback(() => {
    setCouponCode('');
    setError('');
    if (onCouponRemoved) {
      onCouponRemoved();
    }
  }, [onCouponRemoved]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleApply();
      }
    },
    [handleApply]
  );

  return (
    <div className={`space-y-2 ${className}`}>
      {!appliedCoupon ? (
        <>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setError('');
                }}
                onKeyPress={handleKeyPress}
                disabled={validateCoupon.isPending}
                className="pl-10 uppercase"
                maxLength={20}
              />
            </div>
            <Button
              onClick={handleApply}
              disabled={validateCoupon.isPending || !couponCode.trim()}
              className="bg-[#4618AC] hover:bg-[#381488] text-white"
            >
              {validateCoupon.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                'Apply'
              )}
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <XCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-green-800">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-semibold">
                Coupon "{appliedCoupon.code}" applied!
              </p>
              <p className="text-xs">
                You saved {appliedCoupon.discountAmount.toFixed(2)} DA
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-green-800 hover:text-green-900 hover:bg-green-100"
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}

