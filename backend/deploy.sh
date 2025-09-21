#!/bin/bash

# Production Deployment Script for Skill Badge Backend
set -e

echo "🚀 Starting Skill Badge Backend Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="skill-badge-backend"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"

# Check if required files exist
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Error: $ENV_FILE not found!${NC}"
    echo -e "${YELLOW}Please create $ENV_FILE with your production environment variables.${NC}"
    exit 1
fi

if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
    echo -e "${RED}❌ Error: $DOCKER_COMPOSE_FILE not found!${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Checking environment configuration...${NC}"

# Load environment variables
set -a
source "$ENV_FILE"
set +a

# Validate required environment variables
REQUIRED_VARS=("DATABASE_URL" "REDIS_URL" "JWT_SECRET" "API_KEY" "FRONTEND_URL")
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Error: Required environment variable $var is not set!${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ Environment configuration validated${NC}"

# Create necessary directories
echo -e "${BLUE}📁 Creating necessary directories...${NC}"
mkdir -p logs uploads ssl

# Stop existing containers
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
docker-compose -f "$DOCKER_COMPOSE_FILE" down || true

# Remove old images
echo -e "${BLUE}🗑️  Cleaning up old images...${NC}"
docker image prune -f

# Build and start services
echo -e "${BLUE}🏗️  Building and starting services...${NC}"
docker-compose -f "$DOCKER_COMPOSE_FILE" up --build -d

# Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Health check
echo -e "${BLUE}🔍 Performing health check...${NC}"
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Health check passed!${NC}"
        break
    fi

    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -e "${YELLOW}⏳ Waiting for service to be ready... (Attempt $RETRY_COUNT/$MAX_RETRIES)${NC}"
    sleep 5
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}❌ Error: Service failed to start after $MAX_RETRIES attempts${NC}"
    echo -e "${YELLOW}📋 Checking logs...${NC}"
    docker-compose -f "$DOCKER_COMPOSE_FILE" logs
    exit 1
fi

# Run database migrations
echo -e "${BLUE}🗃️  Running database migrations...${NC}"
docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T app npm run db:migrate || echo -e "${YELLOW}⚠️  Database migration failed or already applied${NC}"

# Display service information
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}📊 Service Information:${NC}"
echo -e "  - App URL: http://localhost:3001"
echo -e "  - Health Check: http://localhost:3001/health"
echo -e "  - API Base URL: http://localhost:3001/api/v1"

echo -e "${YELLOW}🔧 Useful commands:${NC}"
echo -e "  - View logs: docker-compose -f $DOCKER_COMPOSE_FILE logs -f"
echo -e "  - Stop services: docker-compose -f $DOCKER_COMPOSE_FILE down"
echo -e "  - Restart services: docker-compose -f $DOCKER_COMPOSE_FILE restart"
echo -e "  - Scale app: docker-compose -f $DOCKER_COMPOSE_FILE up -d --scale app=3"

echo -e "${GREEN}✅ Skill Badge Backend is now running in production mode!${NC}"
