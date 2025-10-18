# Telegram Order Notifications - Quick Reference

## Environment Variables

```env
TELEGRAM_BOT_TOKEN="your_bot_token_here"
TELEGRAM_CHAT_ID="your_chat_id_here"
```

## Quick Setup (2 minutes)

1. **Create Bot:** Message @BotFather → `/newbot` → Get token
2. **Get Chat ID:** 
   - Message your bot
   - Visit: `https://api.telegram.org/bot<TOKEN>/getUpdates`
   - Copy `chat.id`
3. **Add to .env:** Set both variables above
4. **Restart app:** `npm run dev`

## Test Command

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{"chat_id": "<CHAT_ID>", "text": "Test ✅"}'
```

## What Gets Notified

- ✅ New Flexy orders (with receipt)
- ✅ New Chargily orders (Edahabia/CIB)
- ✅ All orders with "pending" status
- ❌ Draft checkouts (not yet completed)
- ❌ Failed/cancelled payments

## Notification Contents

- Order ID, status, payment info
- Customer details (name, email, phone)
- All items with quantities and prices
- Flexy receipt link (if applicable)
- Total amount with fees

## Files Modified

```
src/env.js                                    ← Environment config
src/server/services/telegram.service.ts       ← New service
src/server/api/routers/checkout.ts            ← Flexy integration
src/app/api/webhooks/chargily/route.ts        ← Chargily integration
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No notifications | Check logs for `[Telegram]` messages |
| Invalid token | Test with `/getMe` API endpoint |
| Wrong chat ID | Verify with `/getUpdates` after messaging bot |
| Not configured | System skips gracefully - orders still created |

## Log Messages

```
[Telegram] Bot token or chat ID not configured. Skipping notification.
[Telegram] Order notification sent successfully for order: cm123abc
[Telegram] Failed to send notification: <error>
```

## Admin Panel Link (Optional)

To add admin panel links to notifications, modify `telegram.service.ts`:

```typescript
adminPanelUrl: `${process.env.ADMIN_PANEL_URL}/orders/${data.orderId}`
```

Then add to `.env`:
```env
ADMIN_PANEL_URL="https://admin.lootzone.com"
```
