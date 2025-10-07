# Chargily 422 Error - Fixes Applied ✅

## What Was the Problem?

The **422 Unprocessable Entity** error from Chargily means the API received invalid data.

## Changes Made

### 1. Phone Number Format ✅
**Before:**
```typescript
phone: draft.phone  // "0555123456"
```

**After:**
```typescript
phone: draft.phone.startsWith('+213') ? draft.phone : `+213${draft.phone}`
// "+2130555123456"
```

**Why:** Chargily requires international format with country code.

### 2. Country Code Case ✅
**Before:**
```typescript
address: {
  country: 'DZ',  // Uppercase
  state: '',
  address: '',
}
```

**After:**
```typescript
address: {
  country: 'dz',  // Lowercase
  state: 'Algiers',
  address: 'N/A',
}
```

**Why:** Chargily API expects lowercase country codes.

### 3. Removed Metadata ✅
**Before:**
```typescript
metadata: [
  { key: 'draftId', value: draft.id },
  { key: 'orderType', value: 'checkout' },
]
```

**After:**
```typescript
// Removed - not all endpoints support metadata
```

**Why:** Metadata might not be supported in all Chargily API versions.

### 4. Removed webhook_url from Checkout ✅
**Before:**
```typescript
webhook_url: `${baseUrl}/api/webhooks/chargily`,
```

**After:**
```typescript
// Removed from checkout creation
// Configure in Chargily dashboard instead
```

**Why:** Webhook URL should be configured globally in Chargily dashboard, not per-checkout.

### 5. Fixed Locale Type ✅
**Before:**
```typescript
locale: 'ar',  // Type error
```

**After:**
```typescript
locale: 'ar' as 'ar' | 'en' | 'fr',
```

**Why:** TypeScript requires explicit type for locale.

## Enhanced Logging

Added detailed logging to help debug:

```typescript
console.log('[Chargily] Customer data:', JSON.stringify(customerData, null, 2));
console.log('[Chargily] Product data:', JSON.stringify(productData, null, 2));
console.log('[Chargily] Price data:', JSON.stringify(priceData, null, 2));
console.log('[Chargily] Checkout data:', JSON.stringify(checkoutData, null, 2));
```

You'll now see exactly what's being sent to Chargily API.

## How to Configure Webhook

Since we removed `webhook_url` from the checkout creation, you need to configure it globally:

1. Go to: https://console.chargily.io/webhooks
2. Click "Add Endpoint"
3. Enter URL: `https://your-domain.com/api/webhooks/chargily`
4. Select events:
   - ✓ `checkout.paid`
   - ✓ `checkout.failed`
   - ✓ `checkout.expired`
5. Save and copy the webhook secret
6. Add to `.env`:
   ```env
   CHARGILY_SECRET_KEY=whsec_your_secret_here
   ```

## Testing

Try the checkout flow again. You should now see detailed logs:

```
[Chargily] Starting checkout creation for draft: clx123...
[Chargily] Cart total: 900 DZD
[Chargily] Creating customer...
[Chargily] Customer data: {
  "name": "John Doe",
  "email": "user@example.com",
  "phone": "+2130555123456",
  "address": {
    "country": "dz",
    "state": "Algiers",
    "address": "N/A"
  }
}
[Chargily] Customer created: cus_abc123
[Chargily] Creating product...
[Chargily] Product created: prod_xyz789
[Chargily] Creating price...
[Chargily] Price created: price_def456
[Chargily] Creating checkout session...
[Chargily] Checkout created successfully: ch_ghi789
[Chargily] Payment URL: https://pay.chargily.com/checkout/ch_ghi789
```

## If Still Getting 422

Check the detailed error in console:

```
[Chargily] Error details: {...}
```

Common issues:
- ❌ Invalid API key (test vs live mode mismatch)
- ❌ Amount is 0 or negative
- ❌ Email format invalid
- ❌ Phone number format wrong
- ❌ Currency not supported
- ❌ Price amount too small (minimum might apply)

## Verify Your Data

Before checkout, check:

```typescript
console.log('Draft data:', {
  email: draft.email,  // Must be valid email
  phone: draft.phone,  // Will be converted to +213...
  subtotal: draft.cartSnapshot.subtotal,  // Must be > 0
  currency: draft.cartSnapshot.currency,  // Must be 'DZD'
});
```

## Test Cards

Use Chargily test cards (check their docs):
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Etc.

## Need More Help?

1. Check Chargily dashboard for error details
2. View webhook logs in Chargily console
3. Check API documentation: https://docs.chargily.io/
4. Contact Chargily support if API issue persists

---

**Try the checkout again - it should work now! 🚀**
