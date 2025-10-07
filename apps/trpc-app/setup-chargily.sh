#!/bin/bash

# Chargily Integration Setup Script
# Run this script to complete the installation

echo "🚀 Setting up Chargily Payment Integration..."
echo ""

# Navigate to trpc-app directory
cd ~/lootzone-monorepo/apps/trpc-app

# Install Chargily SDK
echo "📦 Installing @chargily/chargily-pay..."
npm install @chargily/chargily-pay

# Generate Prisma Client
echo "🔄 Regenerating Prisma Client..."
npx prisma generate

# Run migration (if needed)
echo "🗄️  Running database migrations..."
npx prisma migrate dev --name add_checkout_draft_and_payment_integration

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Restart VS Code TypeScript server: Ctrl+Shift+P -> 'TypeScript: Restart TS Server'"
echo "2. Copy .env.chargily.example to .env and add your Chargily keys"
echo "3. Configure webhook URL in Chargily dashboard"
echo "4. Start your dev server: npm run dev"
echo ""
echo "📚 Read CHARGILY_INTEGRATION.md for full documentation"
