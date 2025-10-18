import { env } from '~/env';

interface OrderItem {
  product: {
    title: string;
  };
  variant: {
    sku: string;
    title?: string;
  };
  quantity: number;
  price: number;
  totalPrice: number;
}

interface OrderNotificationData {
  orderId: string;
  orderStatus: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: string;
  paymentStatus: string;
  items: OrderItem[];
  subtotal: number;
  fees?: number;
  totalAmount: number;
  currency: string;
  createdAt: Date;
  notes?: string;
  flexyReceiptUrl?: string;
  flexyPaymentTime?: string;
  adminPanelUrl?: string;
}

const TELEGRAM_API_URL = 'https://api.telegram.org/bot';

export const telegramService = {
  /**
   * Send order notification to Telegram
   */
  async sendOrderNotification(data: OrderNotificationData): Promise<void> {
    // Check if Telegram is configured
    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      console.log('[Telegram] Bot token or chat ID not configured. Skipping notification.');
      return;
    }

    try {
      const message = this.formatOrderMessage(data);
      
      await fetch(`${TELEGRAM_API_URL}${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
        }),
      });

      console.log('[Telegram] Order notification sent successfully for order:', data.orderId);
    } catch (error) {
      // Log error but don't throw - we don't want to block order creation
      console.error('[Telegram] Failed to send notification:', error);
    }
  },

  /**
   * Format order data into a readable Telegram message
   */
  formatOrderMessage(data: OrderNotificationData): string {
    const {
      orderId,
      orderStatus,
      customerName,
      customerEmail,
      customerPhone,
      paymentMethod,
      paymentStatus,
      items,
      subtotal,
      fees,
      totalAmount,
      currency,
      createdAt,
      notes,
      flexyReceiptUrl,
      flexyPaymentTime,
      adminPanelUrl,
    } = data;

    // Header with emoji
    let message = '🔔 *NEW ORDER RECEIVED*\n\n';
    
    // Order info
    message += `📦 *Order ID:* \`${orderId}\`\n`;
    message += `📊 *Status:* ${this.getStatusEmoji(orderStatus)} ${orderStatus.toUpperCase()}\n`;
    message += `💳 *Payment:* ${paymentMethod.toUpperCase()} - ${paymentStatus.toUpperCase()}\n`;
    message += `📅 *Date:* ${createdAt.toLocaleString('en-US', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    })}\n\n`;

    // Customer info
    message += `👤 *CUSTOMER DETAILS*\n`;
    message += `Name: ${customerName}\n`;
    message += `Email: ${customerEmail}\n`;
    message += `Phone: ${customerPhone}\n\n`;

    // Items
    message += `🛍️ *ORDER ITEMS*\n`;
    items.forEach((item, index) => {
      const variantInfo = item.variant.title ? ` (${item.variant.title})` : '';
      message += `${index + 1}. *${item.product.title}*${variantInfo}\n`;
      message += `   SKU: \`${item.variant.sku}\`\n`;
      message += `   Qty: ${item.quantity} × ${item.price.toFixed(2)} ${currency}\n`;
      message += `   Total: *${item.totalPrice.toFixed(2)} ${currency}*\n\n`;
    });

    // Totals
    message += `💰 *PAYMENT SUMMARY*\n`;
    message += `Subtotal: ${subtotal.toFixed(2)} ${currency}\n`;
    if (fees && fees > 0) {
      message += `Fees: ${fees.toFixed(2)} ${currency}\n`;
    }
    message += `*Total: ${totalAmount.toFixed(2)} ${currency}*\n\n`;

    // Flexy-specific info
    if (flexyReceiptUrl || flexyPaymentTime) {
      message += `📸 *FLEXY PAYMENT INFO*\n`;
      if (flexyPaymentTime) {
        message += `Payment Time: ${flexyPaymentTime}\n`;
      }
      if (flexyReceiptUrl) {
        message += `[View Receipt](${flexyReceiptUrl})\n`;
      }
      message += '\n';
    }

    // Notes
    if (notes) {
      message += `📝 *Notes:* ${notes}\n\n`;
    }

    // Admin panel link
    if (adminPanelUrl) {
      message += `[🔗 View in Admin Panel](${adminPanelUrl})\n\n`;
    }

    // Footer
    message += '⚠️ *Action Required:* Review and approve this order in the admin panel.';

    return message;
  },

  /**
   * Get status emoji based on order status
   */
  getStatusEmoji(status: string): string {
    const emojiMap: Record<string, string> = {
      pending: '⏳',
      processing: '⚙️',
      shipped: '🚚',
      delivered: '✅',
      cancelled: '❌',
      refunded: '💸',
    };
    return emojiMap[status.toLowerCase()] || '📦';
  },
};
