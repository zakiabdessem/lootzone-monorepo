'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle, RefreshCw } from 'lucide-react';
import { Button } from '~/app/_components/landing/ui/button';
import Image from 'next/image';

function FailureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draft');

  useEffect(() => {
    if (!draftId) {
      router.push('/');
    }
  }, [draftId, router]);

  const handleRetry = () => {
    if (draftId) {
      router.push(`/checkout?draft=${draftId}`);
    } else {
      router.push('/checkout');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-6 text-center">
        {/* Failure Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>

        {/* Failure Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Failed
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Unfortunately, we couldn't process your payment.
        </p>

        {/* Info Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-yellow-800">
            <strong>Don't worry!</strong> Your cart items are still saved. You can try again.
          </p>
        </div>

        {/* Contact Support - Compact */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-4 mb-4" dir="rtl">
          <p className="text-sm font-bold text-orange-900 mb-3 text-center">
            ⚠️ مشكلة في الدفع؟ تواصل معنا
          </p>
            
          {/* Social Media Buttons - Compact Grid */}
          <div className="grid grid-cols-3 gap-2">
            {/* WhatsApp */}
            <a 
              href="https://wa.me/213556032355" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center bg-white hover:bg-green-50 rounded-lg p-2 shadow-sm transition-all hover:shadow-md border border-green-200 hover:border-green-400 group"
            >
              <img 
                src="https://img.icons8.com/color/48/whatsapp--v1.png" 
                alt="WhatsApp" 
                width={24} 
                height={24}
                className="group-hover:scale-110 transition-transform mb-1"
              />
              <span className="text-xs font-bold text-gray-800">واتساب</span>
            </a>

            {/* Telegram */}
            <a 
              href="https://t.me/lootzone" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center bg-white hover:bg-blue-50 rounded-lg p-2 shadow-sm transition-all hover:shadow-md border border-blue-200 hover:border-blue-400 group"
            >
              <img 
                src="https://img.icons8.com/color/48/telegram-app--v1.png" 
                alt="Telegram" 
                width={24} 
                height={24}
                className="group-hover:scale-110 transition-transform mb-1"
              />
              <span className="text-xs font-bold text-gray-800">تيليجرام</span>
            </a>

            {/* Instagram */}
            <a 
              href="https://www.instagram.com/lootzone_store/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center bg-white hover:bg-pink-50 rounded-lg p-2 shadow-sm transition-all hover:shadow-md border border-pink-200 hover:border-pink-400 group"
            >
              <img 
                src="https://img.icons8.com/fluency/48/instagram-new.png" 
                alt="Instagram" 
                width={24} 
                height={24}
                className="group-hover:scale-110 transition-transform mb-1"
              />
              <span className="text-xs font-bold text-gray-800">انستغرام</span>
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            onClick={handleRetry}
            className="w-full bg-[#4618AC] hover:bg-[#4618AC]/90 flex items-center justify-center gap-2 rounded-none h-11 text-white"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button
            onClick={() => router.push('/')}
            variant="ghost"
            className="w-full rounded-none h-11 border hover:bg-gray-50"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutFailurePage() {
  return (
    <Suspense fallback={null}>
      <FailureContent />
    </Suspense>
  );
}
