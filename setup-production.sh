#!/bin/bash

# Production Setup Script for Skill Badge
set -e

echo "🚀 Setting up Skill Badge for Production..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 20+${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker is not installed. Some deployment options won't be available.${NC}"
fi

echo -e "${BLUE}📦 Installing dependencies...${NC}"

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Generate Prisma client
echo -e "${BLUE}🗄️  Setting up database...${NC}"
cd backend
npm run db:generate

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  Production environment file not found${NC}"
    echo -e "${YELLOW}📝 Creating production environment template...${NC}"

    # Create production environment file from template
    cp .env.production.template .env.production 2>/dev/null || echo -e "${RED}❌ Template file not found. Please create .env.production manually${NC}"
fi

cd ..

echo -e "${BLUE}🔧 Building applications...${NC}"

# Build frontend
npm run build:prod

# Build backend
cd backend
npm run build

echo -e "${GREEN}✅ Build completed${NC}"

# Create necessary directories
echo -e "${BLUE}📁 Creating directories...${NC}"
mkdir -p backend/logs backend/uploads backend/ssl

echo -e "${GREEN}✅ Setup completed!${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "1. Configure your production environment variables in backend/.env.production"
echo -e "2. Set up your PostgreSQL database"
echo -e "3. Set up your Redis instance"
echo -e "4. Run database migrations: cd backend && npm run db:migrate:prod"
echo -e "5. Deploy using one of these options:"
echo -e "   - Docker: cd backend && ./deploy.sh"
echo -e "   - Manual: cd backend && npm start"
echo -e "   - PM2: cd backend && npm run pm2:start"
echo ""
echo -e "${GREEN}🎉 Your Skill Badge application is ready for production!${NC}"
