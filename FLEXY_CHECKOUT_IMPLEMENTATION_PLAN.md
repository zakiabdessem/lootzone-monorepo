# Flexy Payment Checkout - Complete Implementation Plan

## Overview
Implement complete Flexy payment flow with receipt upload to Cloudinary, order creation, and admin verification system.

---

## Current State Analysis

### ✅ Already Implemented
1. **Frontend (checkout page)**:
   - Step 1: Customer info collection (email, phone, fullName)
   - Step 2: Payment method selection (Flexy option)
   - Step 3: Receipt upload UI with preview
   - Payment time input (hour/minute)
   - Draft creation and updates

2. **Backend (checkout router)**:
   - `saveDraft` - Creates CheckoutDraft with customer info
   - `updatePaymentMethod` - Updates draft with selected method
   - `createPayment` - Partial Flexy implementation (needs receipt upload)
   - Database schema has all required fields

### ❌ Missing Implementation
1. **Receipt upload to Cloudinary** (line 257 in checkout/page.tsx - TODO)
2. **Order creation from CheckoutDraft**
3. **Admin verification workflow**
4. **Order status management**
5. **Email notifications**

---

## Implementation Plan

### Phase 1: Receipt Upload to Cloudinary

#### 1.1 Setup Cloudinary Configuration

**File**: `apps/trpc-app/src/lib/cloudinary.ts` (NEW)

```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadReceiptToCloudinary = async (
  fileBuffer: Buffer,
  fileName: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'flexy-receipts',
        resource_type: 'image',
        public_id: `receipt_${Date.now()}_${fileName}`,
        transformation: [
          { width: 1200, crop: 'limit' },
          { quality: 'auto:good' },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};
```

**Environment Variables** (`.env`):
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Dependencies**:
```bash
npm install cloudinary --workspace apps/trpc-app
```

---

#### 1.2 Create Upload API Route

**File**: `apps/trpc-app/src/app/api/upload-receipt/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { uploadReceiptToCloudinary } from '~/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('receipt') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const receiptUrl = await uploadReceiptToCloudinary(
      buffer,
      file.name
    );

    return NextResponse.json({ 
      success: true, 
      receiptUrl 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

---

#### 1.3 Update Frontend to Upload Receipt

**File**: `apps/trpc-app/src/app/checkout/page.tsx`

**Replace the TODO section (around line 257):**

```typescript
// Step 3: Final submit - create payment
const handleFinalSubmit = async () => {
  if (!draftId || !selectedPaymentMethod) {
    alert('Missing checkout information. Please go back and complete all steps.');
    return;
  }

  try {
    setIsProcessing(true);

    if (selectedPaymentMethod === 'edahabia') {
      // Chargily payment flow (existing code)
      console.log('[Checkout] Creating Chargily payment...');
      
      const result = await createPaymentMutation.mutateAsync({
        draftId,
      });

      console.log('[Checkout] Chargily payment created, redirecting...');
      
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        throw new Error('No payment URL received from Chargily');
      }
    } else if (selectedPaymentMethod === 'flexy') {
      // Flexy payment flow - upload receipt first
      console.log('[Checkout] Processing Flexy payment...');
      
      if (!receiptImage) {
        alert('Please upload your payment receipt');
        setIsProcessing(false);
        return;
      }

      // Upload receipt to Cloudinary
      const formData = new FormData();
      formData.append('receipt', receiptImage);

      const uploadResponse = await fetch('/api/upload-receipt', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload receipt');
      }

      const { receiptUrl } = await uploadResponse.json();
      console.log('[Checkout] Receipt uploaded:', receiptUrl);

      // Create payment with receipt URL
      await createPaymentMutation.mutateAsync({
        draftId,
        flexyData: {
          receiptUrl,
          paymentTime: `${paymentHour}:${paymentMinute}`,
        },
      });

      console.log('[Checkout] Flexy payment submitted');
      setOrderSubmitted(true);
      setIsProcessing(false);
    } else {
      // Other payment methods
      alert(`Payment method ${selectedPaymentMethod} is not yet implemented.`);
      setIsProcessing(false);
    }
  } catch (error) {
    console.error('[Checkout] Error creating payment:', error);
    alert('Failed to process payment. Please try again.');
    setIsProcessing(false);
  }
};
```

---

### Phase 2: Order Creation from CheckoutDraft

#### 2.1 Create Order from Flexy Payment

**File**: `apps/trpc-app/src/server/api/routers/checkout.ts`

**Update the `createPayment` mutation (around line 286):**

```typescript
if (draft.paymentMethod === PaymentMethod.FLEXY) {
  console.log('[Checkout] Processing Flexy payment for draft:', draft.id);

  if (!input.flexyData) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Flexy payment data is required',
    });
  }

  // Calculate total with 20% Flexy fee
  const cartSnapshot = draft.cartSnapshot as any;
  const subtotal = cartSnapshot.subtotal;
  const flexyFee = subtotal * 0.2; // 20% fee
  const totalAmount = subtotal + flexyFee;

  // Create order immediately (status pending, awaiting admin verification)
  const order = await ctx.db.order.create({
    data: {
      userId: draft.userId || null, // null for guest checkout
      status: 'pending', // Will be updated after admin verification
      paymentMethod: 'flexy',
      paymentStatus: 'pending', // Awaiting admin verification
      totalAmount: totalAmount,
      currency: cartSnapshot.currency || 'DZD',
      items: {
        create: cartSnapshot.items.map((item: any) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.price * item.quantity,
        })),
      },
      chargilyWebhookEvents: [], // Empty for Flexy
      notes: `Flexy Payment - Receipt uploaded at ${input.flexyData.paymentTime}`,
    },
  });

  console.log('[Checkout] Order created:', order.id);

  // Update draft with Flexy receipt info and link to order
  await ctx.db.checkoutDraft.update({
    where: { id: draft.id },
    data: {
      flexyReceiptUrl: input.flexyData.receiptUrl,
      flexyPaymentTime: input.flexyData.paymentTime,
      paymentStatus: PaymentStatus.PENDING, // Awaiting admin verification
      orderId: order.id, // Link draft to order
    },
  });

  // TODO: Send email notification to customer and admin
  // await emailService.sendFlexyPaymentSubmittedEmail({
  //   customerEmail: draft.email,
  //   orderId: order.id,
  //   totalAmount,
  // });

  return {
    success: true,
    orderId: order.id,
    message: 'Flexy payment submitted for verification. You will receive an email once verified.',
  };
}
```

---

### Phase 3: Admin Verification Workflow

#### 3.1 Add Admin Endpoints for Flexy Verification

**File**: `apps/trpc-app/src/server/api/routers/order.ts`

**Add new mutations:**

```typescript
// Admin: Approve Flexy payment
approveFlexyPayment: adminProcedure
  .input(
    z.object({
      orderId: z.string(),
      adminNotes: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const order = await ctx.db.order.findUnique({
      where: { id: input.orderId },
      include: {
        checkoutDraft: true,
      },
    });

    if (!order) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Order not found',
      });
    }

    if (order.paymentMethod !== 'flexy') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Order is not a Flexy payment',
      });
    }

    // Update order status
    const updatedOrder = await ctx.db.order.update({
      where: { id: input.orderId },
      data: {
        paymentStatus: 'paid',
        status: 'processing', // Move to processing
        notes: input.adminNotes 
          ? `${order.notes}\n\nAdmin: ${input.adminNotes}`
          : order.notes,
      },
    });

    // Update linked checkout draft
    if (order.checkoutDraftId) {
      await ctx.db.checkoutDraft.update({
        where: { id: order.checkoutDraftId },
        data: {
          paymentStatus: 'paid',
        },
      });
    }

    // TODO: Send confirmation email to customer
    // await emailService.sendPaymentApprovedEmail({
    //   customerEmail: order.checkoutDraft?.email,
    //   orderId: order.id,
    // });

    return { success: true, order: updatedOrder };
  }),

// Admin: Reject Flexy payment
rejectFlexyPayment: adminProcedure
  .input(
    z.object({
      orderId: z.string(),
      reason: z.string().min(1),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const order = await ctx.db.order.findUnique({
      where: { id: input.orderId },
      include: {
        checkoutDraft: true,
      },
    });

    if (!order) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Order not found',
      });
    }

    // Update order status
    const updatedOrder = await ctx.db.order.update({
      where: { id: input.orderId },
      data: {
        paymentStatus: 'failed',
        status: 'cancelled',
        notes: `${order.notes}\n\nPayment Rejected: ${input.reason}`,
      },
    });

    // Update linked checkout draft
    if (order.checkoutDraftId) {
      await ctx.db.checkoutDraft.update({
        where: { id: order.checkoutDraftId },
        data: {
          paymentStatus: 'failed',
        },
      });
    }

    // TODO: Send rejection email to customer
    // await emailService.sendPaymentRejectedEmail({
    //   customerEmail: order.checkoutDraft?.email,
    //   orderId: order.id,
    //   reason: input.reason,
    // });

    return { success: true, order: updatedOrder };
  }),
```

---

#### 3.2 Update Admin Order Details Modal

**File**: `apps/admin/src/components/orders/OrderDetailsModal.tsx`

**Add Flexy-specific section after Payment Details:**

```typescript
{/* Flexy Payment Verification (Admin Only) */}
{order.paymentMethod === 'flexy' && (
  <Grid size={{ xs: 12 }}>
    <Paper sx={{ p: 3, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
      <Typography variant="h6" gutterBottom color="warning.main">
        Flexy Payment Verification
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {order.checkoutDraft?.flexyReceiptUrl && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Payment Receipt
          </Typography>
          <Box
            component="a"
            href={order.checkoutDraft.flexyReceiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'block',
              mt: 1,
              maxWidth: 400,
              border: '2px solid',
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden',
              cursor: 'pointer',
              '&:hover': { borderColor: 'primary.main' },
            }}
          >
            <img
              src={order.checkoutDraft.flexyReceiptUrl}
              alt="Payment Receipt"
              style={{ width: '100%', display: 'block' }}
            />
          </Box>
        </Box>
      )}

      {order.checkoutDraft?.flexyPaymentTime && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          <strong>Payment Time:</strong> {order.checkoutDraft.flexyPaymentTime}
        </Typography>
      )}

      {order.paymentStatus === 'pending' && (
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleApproveFlexyPayment(order.id)}
            startIcon={<CheckCircleIcon />}
          >
            Approve Payment
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleRejectFlexyPayment(order.id)}
            startIcon={<CancelIcon />}
          >
            Reject Payment
          </Button>
        </Box>
      )}

      {order.paymentStatus === 'paid' && (
        <Alert severity="success">
          Payment has been verified and approved
        </Alert>
      )}

      {order.paymentStatus === 'failed' && (
        <Alert severity="error">
          Payment was rejected. See notes for details.
        </Alert>
      )}
    </Paper>
  </Grid>
)}
```

**Add mutation handlers:**

```typescript
const approveFlexyMutation = api.order.approveFlexyPayment.useMutation({
  onSuccess: () => {
    utils.order.adminGetOrder.invalidate({ orderId });
    utils.order.getAllOrders.invalidate();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  },
});

const rejectFlexyMutation = api.order.rejectFlexyPayment.useMutation({
  onSuccess: () => {
    utils.order.adminGetOrder.invalidate({ orderId });
    utils.order.getAllOrders.invalidate();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  },
});

const handleApproveFlexyPayment = async (orderId: string) => {
  const notes = prompt('Enter admin notes (optional):');
  await approveFlexyMutation.mutateAsync({
    orderId,
    adminNotes: notes || undefined,
  });
};

const handleRejectFlexyPayment = async (orderId: string) => {
  const reason = prompt('Enter rejection reason (required):');
  if (!reason) {
    alert('Rejection reason is required');
    return;
  }
  await rejectFlexyMutation.mutateAsync({
    orderId,
    reason,
  });
};
```

---

### Phase 4: Email Notifications (Optional but Recommended)

#### 4.1 Setup Email Service

**File**: `apps/trpc-app/src/server/services/email.service.ts` (NEW)

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const emailService = {
  async sendFlexyPaymentSubmittedEmail({
    customerEmail,
    orderId,
    totalAmount,
  }: {
    customerEmail: string;
    orderId: string;
    totalAmount: number;
  }) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: customerEmail,
      subject: 'Payment Receipt Received - LootZone',
      html: `
        <h2>Payment Receipt Received</h2>
        <p>Thank you for your order!</p>
        <p>Order ID: <strong>${orderId}</strong></p>
        <p>Total Amount: <strong>${totalAmount} DZD</strong></p>
        <p>Your Flexy payment receipt has been received and is under verification.</p>
        <p>You will receive another email once your payment is verified (usually within 2 hours).</p>
      `,
    });
  },

  async sendPaymentApprovedEmail({
    customerEmail,
    orderId,
  }: {
    customerEmail: string;
    orderId: string;
  }) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: customerEmail,
      subject: 'Payment Approved - Order Confirmed',
      html: `
        <h2>Payment Approved!</h2>
        <p>Your payment has been verified and your order is now being processed.</p>
        <p>Order ID: <strong>${orderId}</strong></p>
        <p>You will receive your digital items shortly.</p>
      `,
    });
  },

  async sendPaymentRejectedEmail({
    customerEmail,
    orderId,
    reason,
  }: {
    customerEmail: string;
    orderId: string;
    reason: string;
  }) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: customerEmail,
      subject: 'Payment Issue - Action Required',
      html: `
        <h2>Payment Verification Issue</h2>
        <p>Unfortunately, we couldn't verify your payment.</p>
        <p>Order ID: <strong>${orderId}</strong></p>
        <p>Reason: <strong>${reason}</strong></p>
        <p>Please contact our support team for assistance.</p>
      `,
    });
  },
};
```

---

## Database Relationships

The existing schema already supports this flow:

```
CheckoutDraft (1) → (0..1) Order
- checkoutDraftId links Order back to CheckoutDraft
- orderId in CheckoutDraft links forward to Order
```

**No schema changes needed!** ✅

---

## Summary Checklist

### Phase 1: Receipt Upload
- [ ] Install Cloudinary package
- [ ] Create `lib/cloudinary.ts` helper
- [ ] Create `api/upload-receipt/route.ts` API endpoint
- [ ] Update frontend `handleFinalSubmit` to upload receipt
- [ ] Add environment variables

### Phase 2: Order Creation
- [ ] Update `createPayment` mutation in `checkout.ts`
- [ ] Calculate Flexy fee (20%)
- [ ] Create Order with items
- [ ] Link CheckoutDraft to Order

### Phase 3: Admin Verification
- [ ] Add `approveFlexyPayment` mutation to `order.ts`
- [ ] Add `rejectFlexyPayment` mutation to `order.ts`
- [ ] Update `OrderDetailsModal.tsx` with Flexy section
- [ ] Add approve/reject buttons and handlers

### Phase 4: Email Notifications (Optional)
- [ ] Setup email service with nodemailer
- [ ] Implement email templates
- [ ] Integrate into mutations

---

## Testing Flow

1. **Customer Journey**:
   - Add products to cart
   - Go to checkout
   - Fill customer info (Step 1)
   - Select Flexy payment (Step 2)
   - Upload receipt screenshot (Step 3)
   - Submit order
   - See success message

2. **Admin Verification**:
   - Go to Orders dashboard
   - See pending Flexy order
   - Click to view details
   - View receipt image
   - Approve or reject payment
   - Customer receives email notification

---

## Next Steps

1. Start with **Phase 1** (Receipt Upload) - Most critical
2. Then **Phase 2** (Order Creation) - Core functionality
3. Then **Phase 3** (Admin UI) - Makes system usable
4. Finally **Phase 4** (Emails) - Better UX

Would you like me to start implementing any of these phases?
