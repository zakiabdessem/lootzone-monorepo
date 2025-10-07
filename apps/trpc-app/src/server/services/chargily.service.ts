/**
 * Chargily Payment Service
 * Handles all Chargily API interactions for Edahabia/CIB payments
 */

import { ChargilyClient } from '@chargily/chargily-pay';
import { env } from '~/env';

// Initialize Chargily client
const getChargilyClient = () => {
  const apiKey = env.CHARGILY_SECRET_KEY;
  
  
  if (!apiKey) {
    throw new Error('CHARGILY_SECRET_KEY is not set in environment variables');
  }

  return new ChargilyClient({
    api_key: apiKey,
    mode: env.CHARGILY_MODE,
  });
};

interface CheckoutDraft {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  cartSnapshot: {
    items: Array<{
      productId: string;
      variantId: string;
      quantity: number;
      price: number;
      title?: string;
    }>;
    subtotal: number;
    currency: string;
  };
}

interface ChargilyCheckoutResult {
  customerId: string;
  productId: string;
  priceId: string;
  checkoutId: string;
  paymentUrl: string;
}

export const chargilyService = {
  /**
   * Create a complete Chargily checkout flow
   * Creates: Customer -> Product -> Price -> Checkout
   */
  async createCheckout(draft: CheckoutDraft): Promise<ChargilyCheckoutResult> {
    const client = getChargilyClient();
    
    try {
      const customerData = {
        name: draft.fullName,
        email: draft.email,
        phone: draft.phone.startsWith('+213') ? draft.phone : `+213${draft.phone}`,
        address: {
          country: 'dz',
          state: 'Algiers',
          address: 'N/A',
        },
      };
      
      const customer = await client.createCustomer(customerData);

      // 2. Create product (one per order as requested)
      const itemCount = draft.cartSnapshot.items.length;
      const productData = {
        name: `Order #${draft.id.slice(-8).toUpperCase()}`,
        description: `Payment for ${itemCount} item${itemCount > 1 ? 's' : ''} from LootZone`,
      };
      
      const product = await client.createProduct(productData);

      // 3. Create price (DZD amount in base currency, no conversion needed)
      const amount = Math.round(draft.cartSnapshot.subtotal);
      const priceData = {
        amount: amount,
        currency: 'dzd',
        product_id: product.id,
      };
      
      const price = await client.createPrice(priceData);

      // 4. Create checkout
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const checkoutData = {
        items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/checkout/success?draft=${draft.id}`,
        failure_url: `${baseUrl}/checkout/failure?draft=${draft.id}`,
        customer_id: customer.id,
        locale: 'ar' as 'ar' | 'en' | 'fr',
        // Remove webhook_url and metadata for now - might not be supported
      };
      
      const checkout = await client.createCheckout(checkoutData);

      return {
        customerId: customer.id,
        productId: product.id,
        priceId: price.id,
        checkoutId: checkout.id,
        paymentUrl: checkout.checkout_url || '',
      };
    } catch (error) {
      console.error('[Chargily] Error creating checkout:', error);
      
      // Log more details about the error
      if (error && typeof error === 'object') {
        console.error('[Chargily] Error details:', JSON.stringify(error, null, 2));
      }
      
      throw new Error(`Failed to create Chargily checkout: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Verify webhook signature
   * @param rawBody - Raw request body string exactly as received
   * @param signatureHeader - Signature header value
   */
  verifyWebhook(rawBody: string, signatureHeader: string | null): boolean {
    try {
      const secret = env.CHARGILY_SECRET_KEY;

      if (!secret) {
        console.warn('[Chargily] CHARGILY_SECRET_KEY not set, skipping verification');
        return true;
      }

      if (!signatureHeader) {
        console.error('[Chargily] No signature provided in webhook');
        return false;
      }

      // Normalize signature: support formats like "sha256=...", "v1=...", or plain hex
      let provided = signatureHeader.trim();
      if (provided.includes(',')) {
        // Try to find v1 or sha256 entry in comma-separated header
        const parts = provided.split(',').map((p) => p.trim());
        const v1 = parts.find((p) => p.startsWith('v1='));
        const s256 = parts.find((p) => p.startsWith('sha256='));
        provided = (v1?.split('=')[1] || s256?.split('=')[1] || parts.pop() || '').trim();
      } else if (provided.includes('=')) {
        provided = provided.split('=')[1]?.trim() || '';
      }

      const crypto = require('crypto');
      const expected = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');

      // Constant-time comparison
      const providedBuf = Buffer.from(provided, 'hex');
      const expectedBuf = Buffer.from(expected, 'hex');
      if (providedBuf.length !== expectedBuf.length) return false;
      return crypto.timingSafeEqual(providedBuf, expectedBuf);
    } catch (error) {
      console.error('[Chargily] Error verifying webhook:', error);
      return false;
    }
  },

  /**
   * Get checkout/payment status from Chargily
   */
  async getCheckoutStatus(checkoutId: string) {
    const client = getChargilyClient();
    
    try {
      // Use getCheckout instead of retrieveCheckout
      const checkout = await client.getCheckout(checkoutId);
      return checkout;
    } catch (error) {
      console.error('[Chargily] Error retrieving checkout:', error);
      throw error;
    }
  },
};
