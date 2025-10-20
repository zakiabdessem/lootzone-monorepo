#!/bin/bash

# Re-sync all products to Algolia with updated variant fields
# This adds stock, isInfiniteStock, and isActive fields to variants

echo "🔄 Re-syncing products to Algolia..."
cd /home/zak/lootzone-monorepo/apps/trpc-app
npx tsx scripts/sync-algolia.ts
