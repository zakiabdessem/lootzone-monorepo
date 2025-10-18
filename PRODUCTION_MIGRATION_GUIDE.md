# Production Database Migration Guide

## Issue
The Flexy payment receipt images are not showing in the production admin dashboard because the production database is missing the `checkoutDraftId` column in the `Order` table.

## Solution
You need to apply the Prisma migrations to your production database.

### Step 1: Check Current Migration Status (Optional)
SSH into your production server and run:
```bash
cd /path/to/your/app
npx prisma migrate status
```

This will show which migrations are pending.

### Step 2: Apply Pending Migrations

#### Option A: Using Prisma Migrate (Recommended)
```bash
cd apps/trpc-app
npx prisma migrate deploy
```

This command:
- Applies all pending migrations to the production database
- Is safe to run - it won't modify the migration files
- Uses your `DATABASE_URL` from `.env` or environment variables

#### Option B: Manual SQL (If you prefer)
If you want to apply the migration manually, run this SQL in your production database:

```sql
-- Add checkoutDraftId column to Order table
ALTER TABLE "Order" ADD COLUMN "checkoutDraftId" TEXT;

-- Create unique index
CREATE UNIQUE INDEX "Order_checkoutDraftId_key" ON "Order"("checkoutDraftId");

-- Add foreign key constraint
ALTER TABLE "Order" ADD CONSTRAINT "Order_checkoutDraftId_fkey" 
  FOREIGN KEY ("checkoutDraftId") REFERENCES "CheckoutDraft"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;
```

### Step 3: Restart Your Application
After applying migrations, restart your production app:
```bash
# For PM2
pm2 restart your-app-name

# For Docker
docker-compose restart

# For systemd
sudo systemctl restart your-app
```

### Step 4: Verify
1. Create a new Flexy order in production
2. Check the admin dashboard - the receipt image should now appear
3. Check server logs for the console.log messages we added

## Important Notes

⚠️ **Backup First**: Always backup your production database before running migrations!

```bash
# PostgreSQL backup example
pg_dump -h localhost -U your_user -d your_database > backup_$(date +%Y%m%d_%H%M%S).sql
```

⚠️ **Environment Variables**: Make sure your production environment has the correct `DATABASE_URL` set.

⚠️ **Existing Orders**: Old Flexy orders created before this fix will still have `checkoutDraftId: null`. Only NEW orders will have the receipt images. If you need to fix old orders, we can create a migration script.

## Troubleshooting

### Error: "column already exists"
If you get this error, it means the column is already there. Run:
```bash
npx prisma db pull
npx prisma generate
```

Then check if your production database schema matches your Prisma schema.

### Error: "relation does not exist"
Make sure all previous migrations have been applied:
```bash
npx prisma migrate status
npx prisma migrate deploy
```

## Need Help?
If you encounter any issues, share the error message and we can troubleshoot together!
