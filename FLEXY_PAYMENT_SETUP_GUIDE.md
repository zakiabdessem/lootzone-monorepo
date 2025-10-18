# Flexy Payment Setup Guide

## 🎯 Overview
Complete setup instructions for the Flexy payment checkout feature with receipt upload to Cloudinary.

---

## ✅ Implementation Complete

All code has been implemented! Here's what was added:

### Phase 1: Receipt Upload to Cloudinary ✅
- ✅ `apps/trpc-app/src/lib/cloudinary.ts` - Cloudinary upload helper
- ✅ `apps/trpc-app/src/app/api/upload-receipt/route.ts` - Upload API endpoint
- ✅ `apps/trpc-app/src/app/checkout/page.tsx` - Frontend upload integration
- ✅ `apps/trpc-app/package.json` - Added cloudinary dependency

### Phase 2: Order Creation ✅
- ✅ `apps/trpc-app/src/server/api/routers/checkout.ts` - Creates Order after Flexy payment
- ✅ Calculates 20% Flexy fee automatically
- ✅ Links CheckoutDraft to Order
- ✅ Sets status to PENDING for admin verification

### Phase 3: Admin Verification ✅
- ✅ `apps/trpc-app/src/server/api/routers/order.ts` - Added `approveFlexyPayment` and `rejectFlexyPayment` mutations
- ✅ `apps/admin/src/components/orders/OrderDetailsModal.tsx` - Admin UI with receipt preview and approve/reject buttons

### Phase 4: Email Notifications ✅
- ✅ `apps/trpc-app/src/server/services/email.service.ts` - Email service with 3 templates
  - Payment submission confirmation
  - Payment approval notification
  - Payment rejection notification

---

## 🔧 Environment Setup

You need to configure environment variables for Cloudinary and Email (optional).

### 1. Cloudinary Configuration (Required)

Add these to `apps/trpc-app/.env`:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**How to get Cloudinary credentials:**

1. Sign up for free at https://cloudinary.com/
2. Go to Dashboard → Settings → Account
3. Copy your Cloud Name, API Key, and API Secret
4. Paste them into your `.env` file

**Free tier includes:**
- 25 GB storage
- 25 GB monthly bandwidth
- 25,000 transformations/month
- More than enough for receipt uploads!

---

### 2. Email Configuration (Optional but Recommended)

Add these to `apps/trpc-app/.env`:

```env
# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="LootZone <noreply@lootzone.com>"
```

**For Gmail:**

1. Enable 2-Step Verification on your Google Account
2. Go to https://myaccount.google.com/apppasswords
3. Generate an App Password for "Mail"
4. Use the 16-character password in `SMTP_PASS`

**Alternative Email Providers:**

- **SendGrid**: Free tier (100 emails/day)
  - SMTP_HOST=smtp.sendgrid.net
  - SMTP_PORT=587
  - SMTP_USER=apikey
  - SMTP_PASS=your-sendgrid-api-key

- **Mailgun**: Free tier (5,000 emails/month)
  - SMTP_HOST=smtp.mailgun.org
  - SMTP_PORT=587
  - SMTP_USER=postmaster@your-domain.mailgun.org
  - SMTP_PASS=your-mailgun-password

- **AWS SES**: Very cheap ($.10 per 1,000 emails)
  - SMTP_HOST=email-smtp.us-east-1.amazonaws.com
  - SMTP_PORT=587
  - SMTP_USER=your-ses-smtp-username
  - SMTP_PASS=your-ses-smtp-password

---

## 📦 Install Dependencies

```bash
# Navigate to trpc-app
cd apps/trpc-app

# Install dependencies (cloudinary already added to package.json)
npm install

# For email notifications (if using)
npm install nodemailer
npm install -D @types/nodemailer
```

---

## 🔌 Enable Email Notifications (Optional)

Email service is created but not yet integrated. To enable it:

### In `apps/trpc-app/src/server/api/routers/checkout.ts`

Around line 330 (after creating the order), uncomment:

```typescript
// Uncomment this to enable email notifications
import { emailService } from '~/server/services/email.service';

// After creating the order...
await emailService.sendFlexyPaymentSubmittedEmail({
  customerEmail: draft.email,
  orderId: order.id,
  totalAmount,
});
```

### In `apps/trpc-app/src/server/api/routers/order.ts`

In `approveFlexyPayment` mutation (around line 570), uncomment:

```typescript
import { emailService } from '~/server/services/email.service';

// After updating order...
await emailService.sendPaymentApprovedEmail({
  customerEmail: order.checkoutDraft?.email || '',
  orderId: order.id,
});
```

In `rejectFlexyPayment` mutation (around line 640), uncomment:

```typescript
await emailService.sendPaymentRejectedEmail({
  customerEmail: order.checkoutDraft?.email || '',
  orderId: order.id,
  reason: input.reason,
});
```

---

## 🧪 Testing the Flow

### Customer Side (Frontend)

1. **Add items to cart** on the main site
2. **Go to checkout**
3. **Step 1**: Fill in customer info (email, phone, name)
4. **Step 2**: Select "Flexy" as payment method
5. **Step 3**: Upload payment receipt screenshot
6. **Enter payment time** (hour and minute when payment was made)
7. **Submit order**
8. See success message: "Flexy payment submitted for verification"

### Admin Side (Dashboard)

1. **Login to admin panel**
2. **Go to Orders page**
3. **See new Flexy order** with status "Pending"
4. **Click on order** to view details
5. **Scroll to "Flexy Payment Verification" section**
6. **View receipt image** (clickable to open full size)
7. **See payment time** submitted by customer
8. **Click "Approve Payment"** (optional: add admin notes)
   - Order status changes to "Processing"
   - Payment status changes to "Paid"
   - Customer receives approval email (if enabled)
9. **Or click "Reject Payment"** (required: add rejection reason)
   - Order status changes to "Cancelled"
   - Payment status changes to "Failed"
   - Rejection reason saved in order notes
   - Customer receives rejection email (if enabled)

---

## 🔍 Database Schema

No changes needed! Your existing schema already supports everything:

```prisma
model CheckoutDraft {
  id                String          @id @default(cuid())
  userId            String?
  email             String
  phoneNumber       String
  fullName          String
  paymentMethod     String?
  paymentStatus     String          @default("draft")
  flexyReceiptUrl   String?         // ✅ Receipt URL from Cloudinary
  flexyPaymentTime  String?         // ✅ Payment time
  orderId           String?         @unique // ✅ Link to Order
  order             Order?          @relation(fields: [orderId], references: [id])
  // ... other fields
}

model Order {
  id                  String          @id @default(cuid())
  userId              String?
  status              String          @default("pending")
  paymentMethod       String
  paymentStatus       String          @default("pending")
  totalAmount         Float
  currency            String          @default("DZD")
  notes               String?
  checkoutDraftId     String?         @unique
  checkoutDraft       CheckoutDraft?  @relation
  items               OrderItem[]
  // ... other fields
}
```

---

## 🚀 Deployment Checklist

- [ ] Add Cloudinary env vars to production
- [ ] Add SMTP env vars to production (if using emails)
- [ ] Run `npm install` in apps/trpc-app
- [ ] Test receipt upload with a real image
- [ ] Test admin approval flow
- [ ] Test admin rejection flow
- [ ] Verify emails are sent (if enabled)
- [ ] Check Cloudinary dashboard for uploaded receipts

---

## 🎨 Customization

### Receipt Upload Settings

Edit `apps/trpc-app/src/lib/cloudinary.ts`:

```typescript
// Change max image width
{ width: 1200, crop: 'limit' }  // Default
{ width: 2000, crop: 'limit' }  // Higher quality

// Change image quality
{ quality: 'auto:good' }  // Default (balanced)
{ quality: 'auto:best' }  // Best quality (larger files)
{ quality: 'auto:eco' }   // Smaller files

// Change folder name
folder: 'flexy-receipts',  // Default
folder: 'payments/flexy',  // Custom path
```

### File Size Limit

Edit `apps/trpc-app/src/app/api/upload-receipt/route.ts`:

```typescript
const maxSize = 5 * 1024 * 1024; // 5MB (default)
const maxSize = 10 * 1024 * 1024; // 10MB
```

### Email Templates

Edit `apps/trpc-app/src/server/services/email.service.ts` to customize:
- Email subject lines
- HTML templates
- Colors and styling
- Support email address
- Company branding

---

## 📊 Monitoring

### Cloudinary Usage

Check your Cloudinary dashboard for:
- Number of uploads
- Storage used
- Bandwidth consumed
- Transformations count

### Email Logs

If using Gmail:
- Check "Sent" folder for confirmation

If using SendGrid/Mailgun:
- Check their dashboards for delivery stats
- View bounce rates and open rates

### Order Logs

Check server logs for:
```
[Checkout] Uploading receipt to Cloudinary...
[Checkout] Receipt uploaded successfully: https://...
[Checkout] Creating order for Flexy payment...
[Order] Flexy payment approved successfully
[Email] Payment approval notification sent to: ...
```

---

## 🆘 Troubleshooting

### Receipt Upload Fails

**Error: "Upload failed"**
- Check Cloudinary credentials in `.env`
- Verify file is an image (jpg, png, etc.)
- Check file size (must be < 5MB)
- Check network connectivity

### Email Not Sending

**No email received**
- Check SMTP credentials in `.env`
- Verify email service is uncommented in code
- Check spam/junk folder
- Verify SMTP provider allows sending
- Check server logs for email errors

### Order Not Created

**Error: "Failed to create payment"**
- Check database connection
- Verify Prisma schema is up to date (`npx prisma generate`)
- Check server logs for detailed error
- Verify cart has items

### Admin Can't Approve/Reject

**Error: "UNAUTHORIZED"**
- Verify admin is logged in
- Check user has admin role
- Verify adminProcedure is working
- Check session authentication

---

## 📞 Support

If you encounter issues:

1. Check server console logs
2. Check browser console for frontend errors
3. Verify environment variables are set correctly
4. Test with a fresh order
5. Check database for order and checkoutDraft records

---

## 🎉 You're Done!

Your Flexy payment checkout is fully implemented and ready to use!

**Next Steps:**
1. Set up Cloudinary account
2. Add env vars to `.env`
3. Run `npm install`
4. Test the complete flow
5. (Optional) Enable email notifications
6. Deploy to production!
