# Algolia Integration Testing Guide

## 🚀 Quick Start

### 1. Local Development Testing

```bash
# 1. Start the development server
npm run dev

# 2. Open your browser to http://localhost:3000
# 3. Try searching for products in the navbar search bar
# 4. Test with these queries:
#    - "cyberpunk" (should find Cyberpunk 2077)
#    - "steam" (should find Steam products)
#    - "windows" (should find Windows 11 Pro)
#    - "nettflix" (typo test - should find Netflix)
```

### 2. Test Search Functionality

The search now has **dual fallback**:
- **Primary**: Algolia search (fast, typo-tolerant)
- **Fallback**: Database search (when Algolia is not configured)

#### Test Cases:

1. **Exact Match**: "Cyberpunk 2077"
2. **Partial Match**: "cyber"
3. **Typo Test**: "cyberpuk" (should still find Cyberpunk)
4. **Platform Search**: "steam"
5. **Description Search**: "gaming" (should find games)
6. **Empty Query**: Should show popular products

### 3. Algolia Configuration

#### Environment Variables Required:

```env
# For Local Development
ALGOLIA_APP_ID="your_app_id"
ALGOLIA_SEARCH_KEY="your_search_key"  # Read-only key for frontend
ALGOLIA_ADMIN_KEY="your_admin_key"     # Read-write key for syncing
ALGOLIA_PRODUCTS_INDEX="products"
```

#### For Production:

```env
# Production Environment Variables
ALGOLIA_APP_ID="your_prod_app_id"
ALGOLIA_SEARCH_KEY="your_prod_search_key"
ALGOLIA_ADMIN_KEY="your_prod_admin_key"
ALGOLIA_PRODUCTS_INDEX="products_prod"
```

## 🔧 Setup Instructions

### Step 1: Get Algolia Credentials

1. Go to [Algolia Dashboard](https://www.algolia.com/dashboard)
2. Create a new application or use existing
3. Go to **API Keys** section
4. Copy:
   - **Application ID**
   - **Search API Key** (for frontend)
   - **Admin API Key** (for syncing data)

### Step 2: Update Environment Variables

```bash
# Update your .env file
ALGOLIA_APP_ID="Q8WFYCC024"
ALGOLIA_SEARCH_KEY="your_search_key_here"
ALGOLIA_ADMIN_KEY="your_admin_key_here"
ALGOLIA_PRODUCTS_INDEX="products"
```

### Step 3: Sync Products to Algolia

```bash
# Run the sync script
npx tsx scripts/sync-algolia.ts
```

### Step 4: Test the Search

1. Start the development server: `npm run dev`
2. Open http://localhost:3000
3. Try searching in the navbar
4. Check browser console for any errors

## 🧪 Testing Scenarios

### Scenario 1: Algolia Working
- Search should be fast and typo-tolerant
- Results should be highlighted
- Should handle complex queries well

### Scenario 2: Algolia Not Available
- Search should fallback to database
- Should still return results (slower but functional)
- Console should show "Algolia not available" message

### Scenario 3: No Products in Database
- Should return empty results gracefully
- Should not crash the application

## 🚀 Production Deployment

### Step 1: Set Production Environment Variables

```bash
# In your production environment
ALGOLIA_APP_ID="your_prod_app_id"
ALGOLIA_SEARCH_KEY="your_prod_search_key"
ALGOLIA_ADMIN_KEY="your_prod_admin_key"
ALGOLIA_PRODUCTS_INDEX="products_prod"
```

### Step 2: Deploy Database

```bash
# Run database migrations
npx prisma migrate deploy

# Seed production database
npx tsx prisma/seed.ts
```

### Step 3: Sync to Production Algolia

```bash
# Run production sync
npx tsx scripts/deploy-prod.ts
```

### Step 4: Verify Production

1. Check Algolia dashboard for indexed products
2. Test search functionality on production site
3. Monitor search performance and errors

## 🔍 Monitoring and Debugging

### Check Algolia Index

1. Go to Algolia Dashboard
2. Navigate to **Search** → **Browse**
3. Verify products are indexed
4. Test search queries directly

### Debug Search Issues

```bash
# Check server logs for search errors
npm run dev

# Check browser console for client-side errors
# Open DevTools → Console
```

### Common Issues

1. **403 Forbidden**: Wrong API key (use Admin key for sync)
2. **Empty Results**: Products not synced to Algolia
3. **Slow Search**: Algolia not configured, using database fallback
4. **No Results**: Database has no products

## 📊 Performance Comparison

| Method | Speed | Typo Tolerance | Features |
|--------|-------|----------------|----------|
| Algolia | ⚡ Fast | ✅ Excellent | Highlighting, Faceting, Analytics |
| Database | 🐌 Slower | ❌ Basic | Simple text search |

## 🎯 Next Steps

1. **Configure Algolia Analytics** for search insights
2. **Set up Search Analytics** to track popular queries
3. **Implement Search Suggestions** for better UX
4. **Add Search Filters** by category, price, platform
5. **Set up Real-time Sync** when products are added/updated

## 🆘 Troubleshooting

### Search Not Working
1. Check if products exist in database
2. Verify Algolia credentials
3. Check browser console for errors
4. Test with database fallback

### Slow Search Performance
1. Ensure Algolia is properly configured
2. Check network connectivity
3. Verify search index is populated

### Empty Search Results
1. Run the sync script: `npx tsx scripts/sync-algolia.ts`
2. Check Algolia dashboard for indexed products
3. Verify search query is not too restrictive
