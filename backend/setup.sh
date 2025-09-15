#!/bin/bash

# Skill Badge Backend Setup Script
echo "🚀 Setting up Skill Badge Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Navigate to backend directory
cd backend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create environment file
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp env.example .env
    echo "✅ Environment file created. Please edit .env with your configuration."
else
    echo "✅ Environment file already exists"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs uploads

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

# Push database schema
echo "🗄️ Setting up database..."
npm run db:push

if [ $? -ne 0 ]; then
    echo "❌ Failed to setup database"
    exit 1
fi

# Seed database
echo "🌱 Seeding database with sample data..."
npm run db:seed

if [ $? -ne 0 ]; then
    echo "❌ Failed to seed database"
    exit 1
fi

echo ""
echo "🎉 Backend setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start the development server: npm run dev"
echo "3. The API will be available at http://localhost:3001"
echo "4. Health check: http://localhost:3001/health"
echo ""
echo "📚 Documentation:"
echo "- API Documentation: README.md"
echo "- Database Schema: prisma/schema.prisma"
echo "- Environment Variables: env.example"
echo ""
echo "🔧 Available commands:"
echo "- npm run dev          # Start development server"
echo "- npm run build        # Build for production"
echo "- npm run start        # Start production server"
echo "- npm run test         # Run tests"
echo "- npm run db:studio    # Open Prisma Studio"
echo "- npm run db:seed      # Reseed database"
echo ""
echo "Happy coding! 🚀"
