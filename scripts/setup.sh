#!/bin/bash

# DebtTracker Setup Script
# This script sets up the development environment for the DebtTracker project

set -e # Exit on any error

echo "🚀 Setting up DebtTracker development environment..."

# Check if bun is installed
if ! command -v bun &>/dev/null; then
  echo "❌ Bun is not installed. Please install Bun first:"
  echo "   curl -fsSL https://bun.sh/install | bash"
  exit 1
fi

echo "📦 Installing dependencies with Bun..."
bun install

echo "⚙️ Setting up environment variables..."

# Copy .env.example to .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env.local
    echo "✅ Copied .env.example to .env.local"
  else
    echo "❌ .env.example file not found!"
    exit 1
  fi
else
  echo "⚠️  .env.local already exists, skipping creation"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env.local and fill in your actual environment variables:"
echo "   - Get Clerk keys from: https://clerk.com/dashboard"
echo "   - Get Supabase keys from: https://supabase.com/dashboard"
echo ""
echo "2. Start the development server:"
echo "   bun run dev"
echo ""
echo "3. Open your browser to: http://localhost:3000"
echo ""
echo "📚 For more information, see the README.md file"
