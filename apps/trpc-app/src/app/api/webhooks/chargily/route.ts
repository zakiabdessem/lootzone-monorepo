/**
 * Chargily Webhook Handler
 * Processes payment status updates from Chargily
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '~/server/db';
import { chargilyService } from '~/server/services/chargily.service';
import { PaymentStatus } from '~/constants/enums';

// Store processed webhook events to prevent duplicates
const processedEvents = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    console.log('[Webhook] Received Chargily webhook');

    // Get signature from headers
    const signature = req.headers.get('signature') || req.headers.get('x-signature');
    
    // Read raw body for signature verification
    const rawBody = await req.text();
    const body = JSON.parse(rawBody || '{}');
    console.log('[Webhook] Payload:', JSON.stringify(body, null, 2));

    // Verify webhook signature
    const isValid = chargilyService.verifyWebhook(rawBody, signature);
    
    if (!isValid) {
      console.error('[Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Idempotency check
    const eventId = body.id || body.event_id || body.checkout_id;
    if (processedEvents.has(eventId)) {
      console.log('[Webhook] Event already processed:', eventId);
      return NextResponse.json({ message: 'Event already processed' }, { status: 200 });
    }

    // Get checkout ID from webhook payload (Chargily sends checkout id in data.id)
    const checkoutId = body.data?.id || body.checkout_id || body.data?.checkout_id || body.id;
    
    if (!checkoutId) {
      console.error('[Webhook] No checkout ID in payload');
      return NextResponse.json({ error: 'No checkout ID provided' }, { status: 400 });
    }

    // Find draft by Chargily checkout ID
    const draft = await db.checkoutDraft.findFirst({
      where: { chargilyCheckoutId: checkoutId },
    });

    if (!draft) {
      console.error('[Webhook] Draft not found for checkout:', checkoutId);
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    console.log('[Webhook] Found draft:', draft.id);

    // Get payment status from webhook
    const paymentStatus = body.status || body.data?.status || 'unknown';
    console.log('[Webhook] Payment status:', paymentStatus);

    // Handle different payment statuses
    if (paymentStatus === 'paid' || paymentStatus === 'completed') {
      console.log('[Webhook] Payment successful, creating order');

      // Create order from draft
      const cartSnapshot = draft.cartSnapshot as any;
      const order = await db.order.create({
        data: {
          userId: draft.userId || undefined,
          totalAmount: cartSnapshot.subtotal,
          currency: cartSnapshot.currency || 'DZD',
          paymentMethod: draft.paymentMethod || 'edahabia',
          paymentStatus: PaymentStatus.PAID,
          status: 'pending', // Order processing status
          checkoutDraftId: draft.id,
          chargilyWebhookEvents: [body],
          items: {
            create: cartSnapshot.items.map((item: any) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
              totalPrice: item.price * item.quantity,
            })),
          },
        },
      });

      console.log('[Webhook] Order created:', order.id);

      // Update draft
      await db.checkoutDraft.update({
        where: { id: draft.id },
        data: {
          paymentStatus: PaymentStatus.PAID,
          orderId: order.id,
        },
      });

      // TODO: Send confirmation email
      // await emailService.sendOrderConfirmation(draft.email, order);

      // Mark event as processed
      processedEvents.add(eventId);

      return NextResponse.json({
        success: true,
        orderId: order.id,
        message: 'Payment processed successfully',
      });
    } else if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
      console.log('[Webhook] Payment failed or cancelled');

      await db.checkoutDraft.update({
        where: { id: draft.id },
        data: {
          paymentStatus: PaymentStatus.FAILED,
        },
      });

      // Mark event as processed
      processedEvents.add(eventId);

      return NextResponse.json({
        success: true,
        message: 'Payment failure recorded',
      });
    } else if (paymentStatus === 'pending') {
      console.log('[Webhook] Payment pending');

      await db.checkoutDraft.update({
        where: { id: draft.id },
        data: {
          paymentStatus: PaymentStatus.PENDING,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Payment pending',
      });
    }

    console.log('[Webhook] Unknown payment status:', paymentStatus);
    return NextResponse.json({
      success: true,
      message: 'Webhook received',
    });
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Handle GET requests (for testing)
export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'Chargily webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
