'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '~/hooks/useCart';
import { formatDA } from '@/lib/utils';
import Stepper, { Step } from '../_components/checkout/Stepper';
import { CheckCircle, Upload, Clock, AlertCircle, Eye, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '../_components/landing/ui/button';
import { Input } from '../_components/landing/ui/input';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartDetails, subtotal, itemCount } = useCart();

  // TODO: Fetch Flexy phone number from site settings API
  // const { data: siteSettings } = trpc.siteSettings.get.useQuery();
  // const flexyPhoneNumber = siteSettings?.flexyPhoneNumber || '0560 721 047';
  const flexyPhoneNumber = '0655 112 836'; // Hardcoded for now, should come from admin dashboard

  // Form states
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');

  // Payment method state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    'flexy' | 'edahabia' | 'paypal' | 'redotpay' | null
  >(null);

  // Flexy payment states
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>('');
  const [paymentHour, setPaymentHour] = useState('');
  const [paymentMinute, setPaymentMinute] = useState('');
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [showExampleModal, setShowExampleModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Scroll indicator state
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Check if content is scrollable and update indicator visibility
  useEffect(() => {
    const checkScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const isScrollable = container.scrollHeight > container.clientHeight;
      const isAtBottom = Math.abs(container.scrollHeight - container.clientHeight - container.scrollTop) < 5;
      
      setShowScrollIndicator(isScrollable && !isAtBottom);
    };

    const container = scrollContainerRef.current;
    if (container) {
      checkScroll();
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [currentStep, selectedPaymentMethod, receiptPreview]);

  // Calculate Flexy total with 20% fee
  const flexyTotal = subtotal * 1.2;

  // Phone number handler - restrict to 10 digits
  const handlePhoneChange = (value: string) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    // Limit to 10 digits
    if (digitsOnly.length <= 10) {
      setPhone(digitsOnly);
    }
  };

  // Format phone for display
  const formatPhoneDisplay = (value: string) => {
    if (!value) return '';
    if (value.length <= 4) return value;
    if (value.length <= 7) return `${value.slice(0, 4)} ${value.slice(4)}`;
    return `${value.slice(0, 4)} ${value.slice(4, 7)} ${value.slice(7, 10)}`;
  };

  // Validation with proper phone length check
  const isStep1Valid = 
    email.trim() !== '' && 
    email.includes('@') && 
    email.includes('.') &&
    phone.length === 10 && 
    fullName.trim().length >= 3;
  
  const isStep2Valid = selectedPaymentMethod !== null;
  
  const isStep3Valid = selectedPaymentMethod === 'flexy' 
    ? !!(receiptImage && paymentHour && paymentMinute && 
      parseInt(paymentHour) >= 0 && parseInt(paymentHour) <= 23 &&
      parseInt(paymentMinute) >= 0 && parseInt(paymentMinute) <= 59)
    : true;

  // Debug validation
  console.log('Validation Debug:', {
    email: email.trim(),
    hasAt: email.includes('@'),
    hasDot: email.includes('.'),
    phoneLength: phone.length,
    fullNameLength: fullName.trim().length,
    isStep1Valid,
  });

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinalSubmit = async () => {
    // TODO: Submit order to backend
    console.log('Order submitted:', {
      email,
      phone,
      fullName,
      paymentMethod: selectedPaymentMethod,
      items: cartDetails,
      total: selectedPaymentMethod === 'flexy' ? flexyTotal : subtotal,
      flexyDetails: selectedPaymentMethod === 'flexy' ? {
        receiptImage,
        paymentTime: `${paymentHour}:${paymentMinute}`,
      } : null,
    });

    setOrderSubmitted(true);
    // Clear cart after successful order
    // await clearCart();
  };

  if (cartDetails.length === 0 && !orderSubmitted) {
    router.push('/cart');
    return null;
  }

  if (orderSubmitted) {
    return (
      <div className='min-h-screen bg-[#f8f7ff] flex items-center justify-center pt-32 pb-12 px-4'>
        <div className='max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center'>
          <CheckCircle className='w-20 h-20 text-green-500 mx-auto mb-4' />
          <h1 className='text-3xl font-bold text-[#212121] mb-3'>Order Placed!</h1>
          <p className='text-gray-600 mb-6'>
            Thank you for your order. We'll process your payment and send you a confirmation email shortly.
          </p>
          {selectedPaymentMethod === 'flexy' && (
            <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6'>
              <Clock className='w-6 h-6 text-yellow-600 mx-auto mb-2' />
              <p className='text-sm text-yellow-800'>
                <strong>Processing Time:</strong> You have 2 hours to complete your Flexy payment.
                We'll verify your receipt and confirm your order.
              </p>
            </div>
          )}
          <Button
            onClick={() => router.push('/')}
            className='w-full bg-[#4618AC] hover:bg-[#381488] text-white h-12'
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#f8f7ff] pt-28 pb-8 px-4'>
      <div className='max-w-7xl mx-auto'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Stepper Section */}
          <div className='lg:col-span-2'>
            <Stepper
              initialStep={1}
              onStepChange={(step) => {
                console.log('Current step:', step);
                setCurrentStep(step);
              }}
              onFinalStepCompleted={handleFinalSubmit}
              canContinue={(step) => {
                if (step === 1) return isStep1Valid;
                if (step === 2) return isStep2Valid;
                if (step === 3) return isStep3Valid;
                return true;
              }}
            >
              {/* Step 1: Customer Information */}
              <Step>
                <div className='space-y-4 py-3 px-4 sm:px-6'>
                  <div>
                    <h2 className='text-xl font-bold text-[#212121] mb-1'>Customer Information</h2>
                    <p className='text-sm text-gray-600'>Please provide your contact details</p>
                  </div>

                  <div className='space-y-3'>
                    <div>
                      <div className='flex items-center justify-between mb-2'>
                        <label className='text-sm font-medium text-gray-700'>
                          Email Address *
                        </label>
                        <span className='text-sm font-medium text-[#4618AC]' dir='rtl'>
                          البريد الإلكتروني *
                        </span>
                      </div>
                      <Input
                        type='email'
                        name='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder='your@email.com'
                        className='w-full h-10'
                        required
                      />
                    </div>

                    <div>
                      <div className='flex items-center justify-between mb-1.5'>
                        <label className='text-sm font-medium text-gray-700'>
                          Phone Number * <span className='text-xs text-gray-500'>(10 digits)</span>
                        </label>
                        <span className='text-sm font-medium text-[#4618AC]' dir='rtl'>
                          رقم الهاتف * <span className='text-xs opacity-75'>(10 أرقام)</span>
                        </span>
                      </div>
                      <div className='relative'>
                        <Input
                          type='tel'
                          name='phone'
                          value={formatPhoneDisplay(phone)}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          placeholder='0560 721 047'
                          className={`w-full h-10 ${
                            phone.length > 0 && phone.length !== 10
                              ? 'border-red-500 focus:ring-red-500'
                              : phone.length === 10
                              ? 'border-green-500 focus:ring-green-500'
                              : ''
                          }`}
                          maxLength={12}
                          required
                        />
                        {phone.length > 0 && (
                          <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                            {phone.length === 10 ? (
                              <CheckCircle className='w-5 h-5 text-green-500' />
                            ) : (
                              <span className='text-xs text-red-500 font-medium'>
                                {10 - phone.length} left
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {phone.length > 0 && phone.length !== 10 && (
                        <p className='text-xs text-red-500 mt-1'>Please enter exactly 10 digits</p>
                      )}
                    </div>

                    <div>
                      <div className='flex items-center justify-between mb-1.5'>
                        <label className='text-sm font-medium text-gray-700'>
                          Full Name *
                        </label>
                        <span className='text-sm font-medium text-[#4618AC]' dir='rtl'>
                          الاسم الكامل *
                        </span>
                      </div>
                      <Input
                        type='text'
                        value={fullName}
                        name='fullName'
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder='John Doe'
                        className='w-full h-10'
                        required
                      />
                    </div>
                  </div>
                </div>
              </Step>

              {/* Step 2: Payment Method Selection */}
              <Step>
                <div className='space-y-4 py-3 px-4 sm:px-6'>
                  <div>
                    <h2 className='text-xl font-bold text-[#212121] mb-1'>Select Payment Method</h2>
                    <p className='text-sm text-gray-600'>Choose your preferred payment option</p>
                  </div>

                  <div className='space-y-3'>
                    {/* Flexy Payment */}
                    <button
                      onClick={() => setSelectedPaymentMethod('flexy')}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedPaymentMethod === 'flexy'
                          ? 'border-[#4618AC] bg-[#4618AC]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className='flex items-start gap-3'>
                        <div className='w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0'>
                          <Image src='/methods/flexy.webp' alt='Flexy' width={36} height={36} />
                        </div>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-0.5'>
                            <h3 className='font-bold text-base text-[#212121]'>Flexy</h3>
                            <span className='px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-semibold rounded'>
                              +20%
                            </span>
                          </div>
                          <p className='text-xs text-gray-600'>
                            Manual verification required
                          </p>
                        </div>
                        {selectedPaymentMethod === 'flexy' && (
                          <CheckCircle className='w-5 h-5 text-[#4618AC] flex-shrink-0' />
                        )}
                      </div>
                    </button>

                    {/* Edahabia/CIB */}
                    <button
                      onClick={() => setSelectedPaymentMethod('edahabia')}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedPaymentMethod === 'edahabia'
                          ? 'border-[#4618AC] bg-[#4618AC]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className='flex items-center gap-3'>
                        <div className='w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0'>
                          <Image src='/methods/edahabia.webp' alt='Edahabia' width={36} height={36} />
                        </div>
                        <div className='flex-1'>
                          <h3 className='font-bold text-base text-[#212121]'>CIB/Edahabia</h3>
                          <p className='text-xs text-gray-600'>CIB or Edahabia cards</p>
                        </div>
                        {selectedPaymentMethod === 'edahabia' && (
                          <CheckCircle className='w-5 h-5 text-[#4618AC] flex-shrink-0' />
                        )}
                      </div>
                    </button>

                    {/* PayPal */}
                    <button
                      onClick={() => setSelectedPaymentMethod('paypal')}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedPaymentMethod === 'paypal'
                          ? 'border-[#4618AC] bg-[#4618AC]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className='flex items-center gap-3'>
                        <div className='w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0'>
                          <Image src='/methods/paypal.webp' alt='PayPal' width={36} height={36} />
                        </div>
                        <div className='flex-1'>
                          <h3 className='font-bold text-base text-[#212121]'>PayPal</h3>
                          <p className='text-xs text-gray-600'>Secure payment with PayPal</p>
                        </div>
                        {selectedPaymentMethod === 'paypal' && (
                          <CheckCircle className='w-5 h-5 text-[#4618AC] flex-shrink-0' />
                        )}
                      </div>
                    </button>

                    {/* RedotPay */}
                    <button
                      onClick={() => setSelectedPaymentMethod('redotpay')}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedPaymentMethod === 'redotpay'
                          ? 'border-[#4618AC] bg-[#4618AC]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className='flex items-center gap-3'>
                        <div className='w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0'>
                          <Image src='/methods/redotpay.webp' alt='RedotPay' width={36} height={36} />
                        </div>
                        <div className='flex-1'>
                          <h3 className='font-bold text-base text-[#212121]'>RedotPay</h3>
                          <p className='text-xs text-gray-600'>Fast and secure payment</p>
                        </div>
                        {selectedPaymentMethod === 'redotpay' && (
                          <CheckCircle className='w-5 h-5 text-[#4618AC] flex-shrink-0' />
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              </Step>

              {/* Step 3: Payment Details (Conditional based on method) */}
              <Step>
                <div className='relative'>
                <div 
                  ref={scrollContainerRef}
                  className='space-y-3 py-3 px-4 sm:px-6 max-h-[calc(100vh-280px)] overflow-y-auto'
                >                  {selectedPaymentMethod === 'flexy' ? (
                    <>
                      {/* <div>
                        <h2 className='text-xl font-bold text-[#212121] mb-1'>Flexy Payment</h2>
                        <p className='text-sm text-gray-600'>Send payment and upload receipt</p>
                      </div> */}

                      {/* Payment Instructions - Creative & Simple */}
                      <div className='bg-gradient-to-br from-[#4618AC] to-[#6B2EC7] text-white rounded-none p-4 sm:p-6 shadow-lg'>
                        <div className='space-y-3 sm:space-y-4'>
                          {/* Total Amount - Large and Bold */}
                          <div className='text-center pb-3 sm:pb-4 border-b-2 border-white/30'>
                            <p className='text-xs opacity-80 mb-1'>Total to Pay</p>
                            <p className='text-3xl sm:text-4xl md:text-5xl font-black tracking-tight'>{formatDA(flexyTotal)}</p>
                          </div>
                          
                          {/* Phone Number - Very Noticeable */}
                          <div className='bg-white/20 backdrop-blur-sm rounded-none p-3 sm:p-4 border-2 border-yellow-300 relative'>
                            <div className='absolute -top-2 -right-2 bg-yellow-400 text-purple-900 text-[10px] font-bold px-2 py-0.5 rounded-none'>
                              SEND HERE
                            </div>
                            <div className='text-center'>
                              {/* <p className='text-xs opacity-90 mb-2'>📱 Send Flexy to:</p> */}
                              <p className='text-xl sm:text-2xl md:text-3xl font-black font-mono tracking-wide sm:tracking-widest bg-white/10 py-2 rounded-none break-all'>
                                {flexyPhoneNumber}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Important Notes */}
                      <div className='bg-gradient-to-r from-red-50 to-yellow-50 border-l-4 border-red-500 rounded-none p-4 space-y-3' dir='rtl'>
                        <div className='flex items-center gap-2'>
                          <AlertCircle className='w-5 h-5 text-red-500 flex-shrink-0' />
                          <p className='text-sm font-bold text-red-700'>هام: يرجى قراءة كل شيء قبل التحويل</p>
                        </div>
                        
                        <div className='space-y-2.5 text-xs'>
                          {/* <div className='flex items-start gap-2 bg-white/70 p-2 rounded-none'>
                            <span className='text-green-600 font-bold flex-shrink-0'>✓</span>
                            <p className='text-gray-800'>
                              الرقم قد يتغير، تواصل معنا أولاً قبل إرسال الفليكسي
                            </p>
                          </div> */}
                          
                          <div className='flex items-start gap-2 bg-white/70 p-2 rounded-none'>
                            <span className='text-yellow-600 font-bold flex-shrink-0'>⚠️</span>
                            <p className='text-gray-800'>
                              <span className='font-bold text-red-600'>ممنوع ماكتيفي</span> و <span className='font-bold text-red-600'>رصيد دولي</span> (Crédit international) — <span className='font-bold text-green-600'>كريدي فقط</span>
                            </p>
                          </div>
                          
                          <div className='flex items-start gap-2 bg-white/70 p-2 rounded-none'>
                            <span className='text-red-600 font-bold flex-shrink-0'>🚫</span>
                            <p className='text-gray-800'>
                              ممنوع إرسال الفليكسي عبر بوتات تيليغرام، لن يتم قبول التحويلات منها.
                            </p>
                          </div>
                          
                          <div className='flex items-start gap-2 bg-white/70 p-2 rounded-none'>
                            <span className='text-blue-600 font-bold flex-shrink-0'>📸</span>
                            <p className='text-gray-800'>
                              يجب إرسال صورة RECU من جهاز المحل (أو لقطة شاشة من الهاتف/الكمبيوتر) لإثبات التحويل.
                            </p>
                          </div>
                          
                          <div className='flex items-start gap-2 bg-white/70 p-2 rounded-none'>
                            <span className='text-purple-600 font-bold flex-shrink-0'>⏰</span>
                            <p className='text-gray-800'>
                              <span className='font-bold text-purple-600'>مهم جداً :</span> اكتب الساعة والدقيقة <span className='font-bold'>بالضبط</span> اللي أرسلت فيها الدفع (وقت التحويل الحقيقي)
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Receipt Upload - Compact */}
                      <div>
                        <div className='flex items-center justify-between mb-1.5'>
                          <label className='text-xs sm:text-sm font-medium text-gray-700'>
                            Upload Payment Receipt *
                          </label>
                          <span className='text-xs sm:text-sm font-medium text-[#4618AC]' dir='rtl'>
                            تحميل إيصال الدفع *
                          </span>
                        </div>
                        <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#4618AC] transition-colors'>
                          {receiptPreview ? (
                            <div className='space-y-2'>
                              <Image
                                src={receiptPreview}
                                alt='Receipt preview'
                                width={120}
                                height={120}
                                className='mx-auto rounded-lg object-cover max-h-[120px]'
                              />
                              <Button
                                onClick={() => {
                                  setReceiptImage(null);
                                  setReceiptPreview('');
                                }}
                                variant='outline'
                                size='sm'
                                className='text-red-600 border-red-600 h-8 text-xs'
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <label className='cursor-pointer'>
                              <Upload className='w-10 h-10 text-gray-400 mx-auto mb-2' />
                              <p className='text-sm font-medium text-gray-700 mb-0.5'>Click to upload</p>
                              <p className='text-xs text-gray-500'>PNG, JPG up to 10MB</p>
                              <input
                                type='file'
                                accept='image/*'
                                onChange={handleReceiptUpload}
                                className='hidden'
                              />
                            </label>
                          )}
                        </div>
                        <button
                          type='button'
                          onClick={() => setShowExampleModal(true)}
                          className='mt-2 text-xs sm:text-sm text-[#4618AC] cursor-pointer hover:underline flex items-center gap-1 mx-auto'
                        >
                          <Eye className='w-3 h-3 sm:w-3.5 sm:h-3.5' />
                          <span>View example receipt</span>
                          <span className='text-gray-400'>|</span>
                          <span dir='rtl'>مثال على الإيصال</span>
                        </button>
                      </div>

                      {/* Payment Time - Compact */}
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        <div>
                          <div className='flex items-center justify-between mb-1.5'>
                            <label className='text-xs sm:text-sm font-medium text-gray-700'>
                              Hour (24h) *
                            </label>
                            <span className='text-xs sm:text-sm font-medium text-[#4618AC]' dir='rtl'>
                              الساعة *
                            </span>
                          </div>
                          <Input
                            type='number'
                            min='0'
                            max='23'
                            value={paymentHour}
                            onChange={(e) => setPaymentHour(e.target.value)}
                            placeholder='14'
                            className='w-full h-10 text-base'
                          />
                        </div>
                        <div>
                          <div className='flex items-center justify-between mb-1.5'>
                            <label className='text-xs sm:text-sm font-medium text-gray-700'>
                              Minute *
                            </label>
                            <span className='text-xs sm:text-sm font-medium text-[#4618AC]' dir='rtl'>
                              الدقيقة *
                            </span>
                          </div>
                          <Input
                            type='number'
                            min='0'
                            max='59'
                            value={paymentMinute}
                            onChange={(e) => setPaymentMinute(e.target.value)}
                            placeholder='30'
                            className='w-full h-10 text-base'
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className='text-center py-8'>
                      <CheckCircle className='w-16 h-16 text-[#4618AC] mx-auto mb-4' />
                      <h2 className='text-2xl font-bold text-[#212121] mb-2'>Review Your Order</h2>
                      <p className='text-gray-600 mb-4'>
                        You'll be redirected to {selectedPaymentMethod} payment page
                      </p>
                      <div className='bg-gray-50 rounded-lg p-4 inline-block'>
                        <p className='text-sm text-gray-600 mb-1'>Total Amount</p>
                        <p className='text-3xl font-bold text-[#4618AC]'>{formatDA(subtotal)}</p>
                      </div>
                    </div>
                  )}
                  </div>
                  {/* Scroll indicator shadow - only visible when there's content below */}
                  {showScrollIndicator && (
                    <div className='pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white via-white/80 to-transparent' />
                  )}
                </div>
              </Step>
            </Stepper>
          </div>

          {/* Order Summary Sidebar - Visible on all devices for steps 1-2, hidden on step 3 mobile only */}
          <div className={`lg:col-span-1 ${currentStep === 3 ? 'hidden lg:block' : 'block'}`}>
              <div 
                onClick={() => router.push('/cart')}
                className='bg-white rounded-none shadow-lg p-5 sticky top-28 cursor-pointer hover:shadow-xl transition-shadow'
              >
              <h3 className='text-lg font-bold text-[#212121] mb-3 flex items-center justify-between'>
                Order Summary
                <span className='text-xs text-[#4618AC] font-normal'>View Cart →</span>
              </h3>

              <div className='space-y-2.5 mb-5'>
                {cartDetails.slice(0, 3).map((item) => (
                  <div key={`${item.productId}-${item.variantId}`} className='flex gap-3'>
                    <div className='w-12 h-12 relative rounded overflow-hidden flex-shrink-0'>
                      <Image
                        src={item.product.image}
                        alt={item.product.title}
                        fill
                        className='object-cover'
                      />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-gray-900 line-clamp-1'>
                        {item.product.title}
                      </p>
                      <p className='text-xs text-gray-500'>Qty: {item.quantity}</p>
                    </div>
                    <p className='text-sm font-semibold text-gray-900'>
                      {formatDA(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
                {cartDetails.length > 3 && (
                  <p className='text-sm text-gray-500 text-center'>
                    +{cartDetails.length - 3} more items
                  </p>
                )}
              </div>

              <div className='border-t pt-4 space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Subtotal ({itemCount} items)</span>
                  <span className='font-semibold'>{formatDA(subtotal)}</span>
                </div>
                {selectedPaymentMethod === 'flexy' && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>Flexy Fee (20%)</span>
                    <span className='font-semibold text-yellow-600'>
                      +{formatDA(subtotal * 0.2)}
                    </span>
                  </div>
                )}
                <div className='flex justify-between text-lg font-bold pt-2 border-t'>
                  <span className='text-[#212121]'>Total</span>
                  <span className='text-[#4618AC]'>
                    {formatDA(selectedPaymentMethod === 'flexy' ? flexyTotal : subtotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Example Receipt Modal */}
      {showExampleModal && (
        <div 
          className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'
          onClick={() => setShowExampleModal(false)}
        >
          <div 
            className='bg-white rounded-none max-w-md w-full max-h-[90vh] overflow-auto shadow-2xl'
            onClick={(e) => e.stopPropagation()}
          >
            {/* <div className='sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between'>
              <div>
                <h3 className='text-lg font-bold text-[#212121]'>Example Receipt</h3>
                <p className='text-sm text-gray-600' dir='rtl'>مثال على الإيصال</p>
              </div>
              <button
                onClick={() => setShowExampleModal(false)}
                className='p-2 hover:bg-gray-100 rounded-none transition-colors'
              >
                <X className='w-5 h-5 text-gray-500' />
              </button>
            </div> */}
            <div className='p-6 space-y-4'>
              <div className='bg-gray-50 rounded-none border border-gray-200'>
                <Image
                  src='https://res.cloudinary.com/dlua23dqn/image/upload/v1759784340/5944920060281866342_j8ygke.jpg'
                  alt='Example Flexy receipt'
                  width={400}
                  height={600}
                  className='w-full rounded-none'
                />
              </div>
              <div className='space-y-3 text-sm'>
                {/* <div className='flex items-center gap-2'>
                  <CheckCircle className='w-5 h-5 text-green-500 flex-shrink-0' />
                  <p className='font-medium text-[#212121]'>Clear transaction details</p>
                  <span className='text-gray-400'>•</span>
                  <p className='text-gray-500 text-xs' dir='rtl'>تفاصيل المعاملة واضحة</p>
                </div> */}
                <div className='flex items-center gap-2'>
                  <CheckCircle className='w-5 h-5 text-green-500 flex-shrink-0' />
                  <p className='font-medium text-[#212121]'>Amount & recipient visible</p>
                  <span className='text-gray-400'>•</span>
                  <p className='text-gray-500 text-xs' dir='rtl'>المبلغ والمستلم ظاهران</p>
                </div>
                {/* <div className='flex items-center gap-2'>
                  <CheckCircle className='w-5 h-5 text-green-500 flex-shrink-0' />
                  <p className='font-medium text-[#212121]'>Date & time shown</p>
                  <span className='text-gray-400'>•</span>
                  <p className='text-gray-500 text-xs' dir='rtl'>التاريخ والوقت معروضان</p>
                </div> */}
              </div>
              <Button
                onClick={() => setShowExampleModal(false)}
                className='w-full bg-[#4618AC] text-white hover:bg-[#4618AC]/90 rounded-none cursor-pointer h-12'
              >
                Got it / فهمت
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
