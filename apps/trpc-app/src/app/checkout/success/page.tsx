'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '~/app/_components/landing/ui/button';
import { api } from '~/trpc/react';
import Image from 'next/image';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draft');
  const [isLoading, setIsLoading] = useState(true);

  // Query payment status
  const { data: paymentStatus, isLoading: isLoadingStatus } = api.checkout.getPaymentStatus.useQuery(
    { draftId: draftId || '' },
    { enabled: !!draftId }
  );

  useEffect(() => {
    if (!draftId) {
      router.push('/');
      return;
    }

    // Wait for payment confirmation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [draftId, router]);

  if (isLoading || isLoadingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#4618AC] animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing your payment...</h2>
          <p className="text-gray-600">Please wait while we confirm your order</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-md w-full bg-white rounded-none shadow-xl p-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Payment Successful! 🎉
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your order has been confirmed and is being processed.
        </p>

        {/* Order Details */}
        {paymentStatus?.orderId && (
          <div className="bg-gradient-to-r from-[#4618AC] to-[#6B2EC7] rounded-none p-6 mb-6 shadow-lg">
            <p className="text-sm text-white/80 mb-2">رقم الطلب / Numéro de commande</p>
            <p className="text-3xl font-black font-mono text-white tracking-wider">
              #{paymentStatus.orderId.slice(-8).toUpperCase()}
            </p>
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-xs text-white/70">احفظ هذا الرقم للمتابعة</p>
            </div>
          </div>
        )}

        {/* Contact Info Box - Arabic & French */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 mb-6 shadow-md" dir="rtl">
          <div className="mb-5">
            <p className="text-lg font-black text-green-900 mb-3 flex items-center justify-start gap-2">
              🚀 للحصول على طلبك بسرعة
            </p>
            <p className="text-sm text-green-800 font-bold mb-4 text-center flex jusitfy-start">تواصل معنا الآن عبر:</p>
            
            {/* Social Media Buttons */}
            <div className="space-y-3">
              {/* WhatsApp */}
              <a 
                href="https://wa.me/213556032355" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-white hover:bg-green-50 rounded-xl p-3 shadow-sm transition-all hover:shadow-md border-2 border-green-200 hover:border-green-400 group"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src="https://img.icons8.com/color/48/whatsapp--v1.png" 
                    alt="WhatsApp" 
                    width={32} 
                    height={32}
                    className="group-hover:scale-110 transition-transform"
                  />
                  <span className="font-bold text-gray-800 group-hover:text-green-700">واتساب</span>
                </div>
                <span className="text-xs text-gray-500 group-hover:text-green-600">WhatsApp →</span>
              </a>

              {/* Telegram */}
              <a 
                href="https://t.me/lootzone" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-white hover:bg-blue-50 rounded-xl p-3 shadow-sm transition-all hover:shadow-md border-2 border-blue-200 hover:border-blue-400 group"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src="https://img.icons8.com/color/48/telegram-app--v1.png" 
                    alt="Telegram" 
                    width={32} 
                    height={32}
                    className="group-hover:scale-110 transition-transform"
                  />
                  <span className="font-bold text-gray-800 group-hover:text-blue-700">تيليجرام</span>
                </div>
                <span className="text-xs text-gray-500 group-hover:text-blue-600">Telegram →</span>
              </a>

              {/* Instagram */}
              <a 
                href="https://www.instagram.com/lootzone_store/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-white hover:bg-pink-50 rounded-xl p-3 shadow-sm transition-all hover:shadow-md border-2 border-pink-200 hover:border-pink-400 group"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src="https://img.icons8.com/fluency/48/instagram-new.png" 
                    alt="Instagram" 
                    width={32} 
                    height={32}
                    className="group-hover:scale-110 transition-transform"
                  />
                  <span className="font-bold text-gray-800 group-hover:text-pink-700">انستغرام</span>
                </div>
                <span className="text-xs text-gray-500 group-hover:text-pink-600">Instagram →</span>
              </a>
            </div>
          </div>

          <div className="border-t-2 border-green-300 pt-4 mt-4" dir="ltr">
            <p className="text-sm font-bold text-green-900 mb-2 text-center">🇫🇷 Pour recevoir votre commande rapidement</p>
            <p className="text-xs text-green-800 text-center leading-relaxed">
              Contactez-nous sur <strong className="text-green-900">WhatsApp</strong>, <strong className="text-green-900">Telegram</strong> ou <strong className="text-green-900">Instagram</strong> maintenant
              <br />
              <span className="inline-block mt-2 text-green-700 font-semibold">
                ou attendez notre appel dans les prochaines heures ☎️
              </span>
            </p>
          </div>

          <div className="mt-4 bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-400 rounded-xl p-3 shadow-sm" dir="rtl">
            <p className="text-sm text-yellow-900 font-bold text-center flex items-center justify-center gap-2">
              ⏰ أو انتظر اتصالنا خلال الساعات القادمة
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {/* <Button
            onClick={() => router.push('/orders')}
            className="w-full bg-[#4618AC] hover:bg-[#4618AC]/90 text-white"
          >
            View My Orders
          </Button> */}
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="w-full rounded-none hover:bg-gray-100 border-primary text-primary font-semibold"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
