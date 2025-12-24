# Fix Migration Drift Issue

The database already has the Netflix tables, but Prisma's migration history doesn't reflect this. Here's how to fix it without dropping the database:

## Option 1: Mark Migration as Applied (Recommended)

Since the tables already exist in the database, mark the migration as applied:

```bash
cd apps/trpc-app
npx prisma migrate resolve --applied 20241225000000_add_netflix_models
```

This tells Prisma that the migration has already been applied, so it won't try to run it again.

## Option 2: Use db push (Alternative)

If Option 1 doesn't work, use `db push` to sync the schema without migrations:

```bash
cd apps/trpc-app
    npx prisma db push
```

This will sync your Prisma schema with the database without creating a migration file. Note: This is fine for development but not recommended for production.

## Option 3: Create Baseline Migration

If you want to create a proper baseline:

```bash
cd apps/trpc-app
# First, mark the existing migration as applied
npx prisma migrate resolve --applied 20241225000000_add_netflix_models

# Then generate Prisma client
npx prisma generate
```

## After Fixing

Once resolved, you can continue using normal migrations:

```bash
# For future schema changes
npx prisma migrate dev --name your_migration_name

# Generate Prisma client
npx prisma generate
```

