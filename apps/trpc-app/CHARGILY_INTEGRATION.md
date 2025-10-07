# Chargily Payment Integration Guide

## Overview
This implementation integrates Chargily payment gateway for Edahabia/CIB card payments in a clean, extensible way that supports multiple payment methods.

## Architecture

### Database Models
- **CheckoutDraft**: Stores checkout session data (email, phone, cart snapshot)
- **Order**: Final order created after successful payment
- **Payment Methods**: `flexy`, `edahabia`, `paypal`, `redotpay`
- **Payment Statuses**: `draft`, `pending`, `paid`, `failed`, `expired`, `cancelled`

### Backend Services
- **chargilyService**: Handles all Chargily API interactions
- **checkoutRouter**: tRPC endpoints for checkout flow
- **webhook handler**: Processes Chargily payment confirmations

### Frontend Flow
1. **Step 1**: User enters email, phone, full name → Creates `CheckoutDraft`
2. **Step 2**: User selects payment method
3. **Step 3**: 
   - For Edahabia: Redirect to Chargily payment page
   - For Flexy: Upload receipt and submit
4. **Webhook**: Chargily confirms payment → Creates `Order`
5. **Success**: User redirected to success page

## Installation

### 1. Install Dependencies

```bash
cd apps/trpc-app
npm install @chargily/chargily-pay
```

### 2. Environment Variables

Copy the example file and add your Chargily credentials:

```bash
cp .env.chargily.example .env.local
```

Edit `.env.local` and add your keys:

```env
CHARGILY_SECRET_KEY=test_sk_your_key_here
CHARGILY_SECRET_KEY=whsec_your_webhook_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Get your keys from**: https://console.chargily.io/

### 3. Database Migration

Run the Prisma migration to add the new tables:

```bash
npx prisma migrate dev --name add_checkout_draft_and_payment_integration
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

## Configuration

### Webhook Setup in Chargily Dashboard

1. Go to https://console.chargily.io/webhooks
2. Add new webhook endpoint: `https://yourdomain.com/api/webhooks/chargily`
3. Select events to listen to:
   - `checkout.paid`
   - `checkout.failed`
   - `checkout.expired`
4. Copy the webhook secret to your `.env.local`

### Testing Webhooks Locally

Use ngrok or similar tool to expose localhost:

```bash
# Install ngrok
npm install -g ngrok

# Expose your local server
ngrok http 3000

# Use the ngrok URL in Chargily dashboard
# Example: https://abc123.ngrok.io/api/webhooks/chargily
```

## API Usage

### Frontend Integration

```typescript
import { api } from '~/trpc/react';

// Step 1: Save draft
const saveDraftMutation = api.checkout.saveDraft.useMutation();
const result = await saveDraftMutation.mutateAsync({
  email: 'user@example.com',
  phone: '0555123456',
  fullName: 'John Doe',
  cartSnapshot: {
    items: cartItems,
    subtotal: 5000,
    currency: 'DZD',
  },
});

// Step 2: Create payment
const createPaymentMutation = api.checkout.createPayment.useMutation();
const payment = await createPaymentMutation.mutateAsync({
  draftId: result.draftId,
});

// Redirect to Chargily
window.location.href = payment.paymentUrl;
```

### Backend API Endpoints

#### tRPC Routes (`api.checkout.*`)

- **saveDraft**: Create checkout draft (Step 1)
- **getDraft**: Get draft by token (for email links)
- **getDraftById**: Get draft by ID
- **updatePaymentMethod**: Set payment method (Step 2)
- **createPayment**: Initiate payment (Step 3)
- **getPaymentStatus**: Check payment status
- **getAllDrafts**: Admin endpoint to view all drafts

#### Webhook Route

- **POST /api/webhooks/chargily**: Receives payment confirmations from Chargily

## Payment Method Handlers

### Edahabia/CIB (via Chargily)

```typescript
// Automatically creates:
// 1. Chargily Customer
// 2. Chargily Product (one per order)
// 3. Chargily Price
// 4. Chargily Checkout

// User is redirected to Chargily payment page
// Webhook creates Order after successful payment
```

### Flexy (Manual Verification)

```typescript
// User uploads receipt + payment time
// Admin verifies payment manually
// Status remains 'pending' until admin approval
```

### PayPal / RedotPay

```typescript
// TODO: Implement similar pattern
// Each payment method gets its own handler in createPayment
```

## Database Schema

### CheckoutDraft

```prisma
model CheckoutDraft {
  id                  String   @id @default(cuid())
  email               String
  phone               String
  fullName            String
  userId              String?
  cartSnapshot        Json
  paymentMethod       String?
  paymentStatus       String   @default("draft")
  continueToken       String   @unique @default(cuid())
  tokenExpiresAt      DateTime
  
  // Chargily fields
  chargilyCustomerId  String?
  chargilyProductId   String?
  chargilyPriceId     String?
  chargilyCheckoutId  String?  @unique
  chargilyPaymentUrl  String?
  
  // Flexy fields
  flexyReceiptUrl     String?
  flexyPaymentTime    String?
  
  orderId             String?
  order               Order?
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

## Security

### Webhook Verification

```typescript
// Verifies HMAC signature from Chargily
chargilyService.verifyWebhook(payload, signature);
```

### Idempotency

```typescript
// Prevents duplicate webhook processing
const processedEvents = new Set<string>();
if (processedEvents.has(eventId)) {
  return { message: 'Already processed' };
}
```

### Token Expiry

```typescript
// Checkout links expire after 24 hours
tokenExpiresAt: now + 24 hours
```

## Error Handling

### Payment Failures

- User redirected to `/checkout/failure?draft={id}`
- Draft marked as `failed`
- User can retry payment

### Webhook Failures

- Logged to console with detailed error messages
- Returns 500 to trigger Chargily retry mechanism
- Chargily retries failed webhooks automatically

### API Errors

```typescript
throw new TRPCError({
  code: 'BAD_REQUEST',
  message: 'Payment method not selected',
});
```

## Testing

### Test Mode

Set `CHARGILY_SECRET_KEY` to test key (starts with `test_sk_`)

```env
CHARGILY_SECRET_KEY=test_sk_your_test_key
```

### Test Cards (from Chargily docs)

Check Chargily documentation for test card numbers.

### Manual Testing Flow

1. Add items to cart
2. Go to checkout
3. Fill Step 1 (email, phone, name)
4. Select Edahabia payment
5. Click "Proceed to Payment"
6. Complete payment on Chargily test page
7. Verify webhook received and order created
8. Check success page

## Admin Panel

View all checkout drafts:

```typescript
const { data } = api.checkout.getAllDrafts.useQuery({
  limit: 20,
  status: 'pending', // optional filter
});
```

## Monitoring

### Logs to Check

```bash
# Checkout draft creation
[Checkout] Draft created: clx...

# Chargily API calls
[Chargily] Creating customer for draft: clx...
[Chargily] Creating product for order
[Chargily] Creating price
[Chargily] Creating checkout
[Chargily] Checkout created successfully: ch_...

# Webhook processing
[Webhook] Received Chargily webhook
[Webhook] Found draft: clx...
[Webhook] Payment successful, creating order
[Webhook] Order created: clx...
```

## Troubleshooting

### Webhook Not Received

1. Check webhook URL in Chargily dashboard
2. Ensure public URL is accessible (use ngrok for local)
3. Check webhook secret matches
4. View webhook logs in Chargily dashboard

### Payment Not Completing

1. Check Chargily dashboard for payment status
2. Verify webhook was sent by Chargily
3. Check server logs for webhook errors
4. Manually retry webhook from Chargily dashboard

### Environment Variables Not Loading

```bash
# Verify .env.local exists
ls -la .env.local

# Check values are set
echo $CHARGILY_SECRET_KEY

# Restart dev server
npm run dev
```

## Production Checklist

- [ ] Switch to live Chargily API key
- [ ] Update `NEXT_PUBLIC_BASE_URL` to production domain
- [ ] Configure production webhook endpoint in Chargily
- [ ] Test webhook with live payments
- [ ] Enable webhook signature verification
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure email service for order confirmations
- [ ] Test full payment flow end-to-end
- [ ] Set up database backups
- [ ] Configure rate limiting on webhook endpoint

## Future Enhancements

- [ ] Email service for order confirmations
- [ ] Email "continue payment" links
- [ ] Admin panel for manual payment verification (Flexy)
- [ ] Refund handling
- [ ] PayPal integration
- [ ] RedotPay integration
- [ ] Multi-currency support
- [ ] Invoice generation
- [ ] Subscription/recurring payments

## Support

- **Chargily Docs**: https://docs.chargily.io/
- **Chargily GitHub**: https://github.com/Chargily/chargily-pay-javascript
- **Chargily Support**: support@chargily.io

## License

MIT
