import nodemailer from 'nodemailer';

// Email transporter configuration
// You'll need to set these environment variables in your .env file:
// SMTP_HOST=smtp.gmail.com (or your email provider)
// SMTP_PORT=587
// SMTP_USER=your-email@example.com
// SMTP_PASS=your-app-password
// SMTP_FROM="LootZone <noreply@lootzone.com>"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const emailService = {
  /**
   * Send email notification when Flexy payment receipt is submitted
   */
  async sendFlexyPaymentSubmittedEmail({
    customerEmail,
    orderId,
    totalAmount,
  }: {
    customerEmail: string;
    orderId: string;
    totalAmount: number;
  }) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'LootZone <noreply@lootzone.com>',
        to: customerEmail,
        subject: 'Payment Receipt Received - LootZone',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              .highlight { color: #667eea; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Payment Receipt Received</h1>
              </div>
              <div class="content">
                <p>Thank you for your order!</p>
                
                <div class="order-details">
                  <p><strong>Order ID:</strong> <span class="highlight">${orderId}</span></p>
                  <p><strong>Total Amount:</strong> <span class="highlight">${totalAmount.toFixed(2)} DZD</span></p>
                </div>
                
                <p>Your Flexy payment receipt has been received and is currently under verification by our team.</p>
                
                <p><strong>What happens next?</strong></p>
                <ul>
                  <li>Our team will review your payment receipt</li>
                  <li>Verification usually takes <strong>1-2 hours</strong> during business hours</li>
                  <li>You'll receive another email once your payment is verified</li>
                  <li>After verification, we'll process and deliver your digital items</li>
                </ul>
                
                <p>If you have any questions, please don't hesitate to contact our support team.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} LootZone. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      
      console.log('[Email] Flexy payment submission notification sent to:', customerEmail);
    } catch (error) {
      console.error('[Email] Failed to send Flexy submission email:', error);
      // Don't throw - we don't want email failures to break the payment flow
    }
  },

  /**
   * Send email notification when admin approves Flexy payment
   */
  async sendPaymentApprovedEmail({
    customerEmail,
    orderId,
  }: {
    customerEmail: string;
    orderId: string;
  }) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'LootZone <noreply@lootzone.com>',
        to: customerEmail,
        subject: '🎉 Payment Approved - Order Confirmed',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .success-badge { background: #48bb78; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 20px 0; }
              .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              .highlight { color: #38a169; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Payment Approved!</h1>
              </div>
              <div class="content">
                <div class="success-badge">
                  ✓ Payment Verified Successfully
                </div>
                
                <p>Great news! Your Flexy payment has been verified and approved.</p>
                
                <div class="order-details">
                  <p><strong>Order ID:</strong> <span class="highlight">${orderId}</span></p>
                  <p><strong>Status:</strong> <span class="highlight">Processing</span></p>
                </div>
                
                <p><strong>What happens next?</strong></p>
                <ul>
                  <li>Your order is now being processed</li>
                  <li>You'll receive your digital items shortly via email</li>
                  <li>Check your account for order details and downloads</li>
                </ul>
                
                <p>Thank you for choosing LootZone! Enjoy your purchase.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} LootZone. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      
      console.log('[Email] Payment approval notification sent to:', customerEmail);
    } catch (error) {
      console.error('[Email] Failed to send payment approval email:', error);
    }
  },

  /**
   * Send email notification when admin rejects Flexy payment
   */
  async sendPaymentRejectedEmail({
    customerEmail,
    orderId,
    reason,
  }: {
    customerEmail: string;
    orderId: string;
    reason: string;
  }) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'LootZone <noreply@lootzone.com>',
        to: customerEmail,
        subject: 'Payment Issue - Action Required',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .warning-badge { background: #fed7d7; color: #c53030; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f56565; }
              .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              .contact-btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Payment Verification Issue</h1>
              </div>
              <div class="content">
                <p>We encountered an issue while verifying your Flexy payment.</p>
                
                <div class="order-details">
                  <p><strong>Order ID:</strong> ${orderId}</p>
                  <p><strong>Status:</strong> Payment Rejected</p>
                </div>
                
                <div class="warning-badge">
                  <strong>Reason:</strong> ${reason}
                </div>
                
                <p><strong>What should you do?</strong></p>
                <ul>
                  <li>Review the rejection reason above</li>
                  <li>Make sure your receipt shows the correct payment amount and time</li>
                  <li>Contact our support team for assistance</li>
                  <li>You may need to submit a new order with a valid payment receipt</li>
                </ul>
                
                <p>We're here to help! Please reach out to our support team if you need clarification.</p>
                
                <a href="mailto:support@lootzone.com" class="contact-btn">Contact Support</a>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} LootZone. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      
      console.log('[Email] Payment rejection notification sent to:', customerEmail);
    } catch (error) {
      console.error('[Email] Failed to send payment rejection email:', error);
    }
  },
};
