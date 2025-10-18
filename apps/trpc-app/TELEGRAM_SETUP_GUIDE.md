# Telegram Order Notifications - Setup Guide

## Overview

The system now automatically sends Telegram notifications to admin when new orders are created (both Flexy and Chargily payment methods) with status "pending" awaiting approval.

## Implementation Summary

### Files Modified/Created

1. **`src/env.js`** - Added Telegram environment variables
2. **`src/server/services/telegram.service.ts`** - New service for Telegram notifications (CREATED)
3. **`src/server/api/routers/checkout.ts`** - Added notification for Flexy orders
4. **`src/app/api/webhooks/chargily/route.ts`** - Added notification for Chargily orders

## Setup Instructions

### 1. Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot` command
3. Follow the prompts to create your bot:
   - Choose a name (e.g., "LootZone Orders Bot")
   - Choose a username (e.g., "lootzone_orders_bot")
4. Copy the **Bot Token** (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Get Your Chat ID

**Option A: Using Your Personal Chat**
1. Search for your bot in Telegram
2. Start a conversation and send any message
3. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Look for `"chat":{"id":123456789}` in the response
5. Copy the `id` value

**Option B: Using a Channel or Group**
1. Create a channel/group and add your bot as admin
2. Post a message in the channel/group
3. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. For channels, the ID will start with `-100` (e.g., `-1001234567890`)
5. Copy the chat ID

### 3. Add Environment Variables

Add the following to your `.env` file:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
TELEGRAM_CHAT_ID="123456789"  # or "-1001234567890" for channels
```

**Note:** Both variables are optional. If not configured, the system will simply skip sending notifications without affecting order creation.

### 4. Restart Your Application

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Notification Format

Each order notification includes:

- 📦 Order ID and status
- 💳 Payment method and status
- 📅 Order date and time
- 👤 Customer details (name, email, phone)
- 🛍️ Complete list of ordered items with:
  - Product title and variant
  - SKU/Variant ID
  - Quantity and price
  - Item total
- 💰 Payment summary (subtotal, fees, total)
- 📸 Flexy receipt URL and payment time (for Flexy orders only)
- 📝 Order notes
- 🔗 Admin panel link (if configured)

### Example Message

```
🔔 NEW ORDER RECEIVED

📦 Order ID: `cm123abc456`
📊 Status: ⏳ PENDING
💳 Payment: FLEXY - PENDING
📅 Date: Oct 18, 2025, 2:30 PM

👤 CUSTOMER DETAILS
Name: John Doe
Email: john@example.com
Phone: +213555123456

🛍️ ORDER ITEMS
1. **PlayStation 5 Console** (Digital Edition)
   SKU: `cm456def789`
   Qty: 1 × 45000.00 DZD
   Total: **45000.00 DZD**

2. **DualSense Controller** (White)
   SKU: `cm789ghi012`
   Qty: 2 × 8500.00 DZD
   Total: **17000.00 DZD**

💰 PAYMENT SUMMARY
Subtotal: 62000.00 DZD
Fees: 12400.00 DZD
**Total: 74400.00 DZD**

📸 FLEXY PAYMENT INFO
Payment Time: 2025-10-18 14:25:00
[View Receipt](https://example.com/receipt.jpg)

⚠️ **Action Required:** Review and approve this order in the admin panel.
```

## Features

### Non-Blocking Execution
- Notifications are sent asynchronously
- Order creation never fails due to Telegram errors
- All errors are logged for debugging

### Graceful Degradation
- If `TELEGRAM_BOT_TOKEN` or `TELEGRAM_CHAT_ID` is not set, the system logs a message and continues
- No impact on order processing if Telegram service is unavailable

### Complete Order Details
- All relevant order information in one message
- Markdown formatting for readability
- Status emojis for quick visual identification
- Direct links to receipts and admin panel

### Payment Method Support
- ✅ Flexy payments (with receipt URL and payment time)
- ✅ Chargily payments (Edahabia, CIB)
- 🔄 Ready for future payment methods (PayPal, RedotPay, etc.)

## Testing

### 1. Test Bot Connection

Send a test message using curl:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "<YOUR_CHAT_ID>",
    "text": "🔔 LootZone Orders Bot is connected!",
    "parse_mode": "Markdown"
  }'
```

### 2. Test with Real Orders

**Flexy Order:**
1. Go through checkout flow
2. Select Flexy payment
3. Submit payment receipt
4. Check Telegram for notification

**Chargily Order:**
1. Go through checkout flow
2. Select Edahabia/CIB payment
3. Complete payment on Chargily
4. Check Telegram for notification

## Troubleshooting

### No Notifications Received

1. **Check environment variables:**
   ```bash
   echo $TELEGRAM_BOT_TOKEN
   echo $TELEGRAM_CHAT_ID
   ```

2. **Check application logs:**
   ```bash
   # Look for lines starting with [Telegram]
   tail -f logs/app.log | grep Telegram
   ```

3. **Verify bot token:**
   ```bash
   curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe"
   ```
   Should return bot information.

4. **Verify chat ID:**
   - Make sure you've sent at least one message to the bot
   - For channels, ensure bot is added as admin
   - Chat ID should be a number (positive or negative)

### Markdown Formatting Issues

If message formatting appears broken:
- Check for special characters in product names/descriptions
- Telegram uses Markdown v1 (not v2)
- Characters like `_`, `*`, `[`, `` ` `` need escaping if used literally

### Rate Limiting

Telegram has rate limits:
- 30 messages per second to same chat
- 20 messages per minute to same group

For high-volume stores, consider:
- Batching notifications
- Using channels instead of personal chats
- Implementing a queue system

## Security Considerations

1. **Bot Token Protection**
   - Never commit bot token to git
   - Use environment variables only
   - Rotate tokens if exposed

2. **Chat ID Privacy**
   - Don't share your chat ID publicly
   - Use private channels for sensitive data

3. **Message Content**
   - Contains customer PII (name, email, phone)
   - Ensure bot chat/channel is private
   - Consider encryption for sensitive channels

## Future Enhancements

Potential improvements:
- [ ] Order status updates (processing, shipped, delivered)
- [ ] Interactive buttons for quick actions (approve, reject)
- [ ] Admin commands via Telegram bot
- [ ] Daily/weekly sales summaries
- [ ] Low stock alerts
- [ ] Payment failure notifications
- [ ] Customer support integration

## Support

If you encounter issues:
1. Check logs: `[Telegram]` prefix in console
2. Verify environment variables are set
3. Test bot connection with curl
4. Check Telegram Bot API status: https://telegram.org/blog

## References

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Telegram Markdown Formatting](https://core.telegram.org/bots/api#markdown-style)
- [BotFather Commands](https://core.telegram.org/bots#botfather)
