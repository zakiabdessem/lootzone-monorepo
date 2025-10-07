# Chargily Integration - Quick Setup Guide

## ⚠️ Fix TypeScript Errors

If you're seeing TypeScript errors about `checkoutDraft` not existing:

### Option 1: Restart TypeScript Server (Recommended)
1. In VS Code, press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type: "TypeScript: Restart TS Server"
3. Press Enter

### Option 2: Reload VS Code Window
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type: "Developer: Reload Window"
3. Press Enter

### Option 3: Run Setup Script
```bash
cd ~/lootzone-monorepo/apps/trpc-app
bash setup-chargily.sh
```

Then restart TypeScript server as above.

## 📦 Manual Installation Steps

If the script doesn't work, run these commands manually:

```bash
cd ~/lootzone-monorepo/apps/trpc-app

# Install Chargily package
npm install @chargily/chargily-pay

# Regenerate Prisma client
npx prisma generate

# Restart VS Code TypeScript server
```

## 🔧 Environment Setup

1. Copy the example environment file:
```bash
cp .env.chargily.example .env
```

2. Edit `.env` and add your Chargily credentials:
```env
CHARGILY_SECRET_KEY=test_sk_your_key_here
CHARGILY_SECRET_KEY=whsec_your_secret_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

3. Get your keys from: https://console.chargily.io/

## 🧪 Testing the Integration

1. Start your dev server:
```bash
npm run dev
```

2. Go to checkout page
3. Fill in user details (Step 1)
4. Select "Edahabia/CIB" payment method
5. Click proceed - you should be redirected to Chargily

## 🪝 Webhook Setup

For webhooks to work, you need a public URL:

### Local Development (using ngrok)
```bash
# Install ngrok
npm install -g ngrok

# Start ngrok
ngrok http 3000

# Use the ngrok URL in Chargily dashboard
# Example: https://abc123.ngrok.io/api/webhooks/chargily
```

### Configure in Chargily Dashboard
1. Go to https://console.chargily.io/webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/chargily`
3. Select events: `checkout.paid`, `checkout.failed`, `checkout.expired`
4. Copy the webhook secret to your `.env`

## 📁 Files Created

- `src/server/services/chargily.service.ts` - Chargily API wrapper
- `src/server/api/routers/checkout.ts` - Checkout tRPC endpoints
- `src/app/api/webhooks/chargily/route.ts` - Webhook handler
- `src/app/checkout/success/page.tsx` - Success page
- `src/app/checkout/failure/page.tsx` - Failure page
- `prisma/schema.prisma` - Updated with CheckoutDraft model
- `src/constants/enums.ts` - Updated with payment enums

## 🐛 Troubleshooting

### TypeScript errors persist
- Restart TypeScript server (see above)
- Close and reopen VS Code
- Delete `node_modules/.prisma` and run `npx prisma generate`

### Cannot find module '@chargily/chargily-pay'
- Run: `npm install @chargily/chargily-pay`
- Restart VS Code

### Webhook not receiving events
- Check webhook URL is publicly accessible
- Verify webhook secret matches in `.env`
- Check Chargily dashboard webhook logs

### Database errors
- Ensure PostgreSQL is running
- Run: `npx prisma migrate dev`
- Check DATABASE_URL in `.env`

## 📚 Full Documentation

See `CHARGILY_INTEGRATION.md` for complete documentation.

## ✅ Checklist

- [ ] Install Chargily package: `npm install @chargily/chargily-pay`
- [ ] Regenerate Prisma: `npx prisma generate`
- [ ] Restart TypeScript server in VS Code
- [ ] Copy `.env.chargily.example` to `.env`
- [ ] Add Chargily API keys to `.env`
- [ ] Configure webhook in Chargily dashboard
- [ ] Test checkout flow
- [ ] Verify webhook receives events
