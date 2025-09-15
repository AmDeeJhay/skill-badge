#!/bin/bash

# Skill Badge Platform Startup Script
echo "🚀 Starting Skill Badge Platform..."

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

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ Backend directory not found. Please ensure you're in the correct directory."
    exit 1
fi

# Check if backend is set up
if [ ! -f "backend/.env" ]; then
    echo "📝 Setting up backend environment..."
    cd backend
    cp env.example .env
    echo "✅ Environment file created. Please edit backend/.env with your configuration."
    cd ..
fi

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

# Check if database is set up
if [ ! -f "backend/dev.db" ]; then
    echo "🗄️ Setting up database..."
    cd backend
    npm run db:generate
    npm run db:push
    npm run db:seed
    cd ..
fi

# Check if frontend dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Starting the platform..."
echo ""

# Start both frontend and backend
echo "🌐 Starting frontend (http://localhost:3000)..."
echo "🔧 Starting backend (http://localhost:3001)..."
echo ""

# Use concurrently if available, otherwise start them separately
if command -v concurrently &> /dev/null; then
    concurrently "npm run dev" "cd backend && npm run dev"
else
    echo "⚠️  concurrently not found. Starting servers separately..."
    echo "   Frontend: npm run dev"
    echo "   Backend: cd backend && npm run dev"
    echo ""
    echo "   Or install concurrently: npm install -g concurrently"
    echo ""
    
    # Start frontend in background
    npm run dev &
    FRONTEND_PID=$!
    
    # Start backend
    cd backend && npm run dev &
    BACKEND_PID=$!
    
    echo "   Frontend PID: $FRONTEND_PID"
    echo "   Backend PID: $BACKEND_PID"
    echo ""
    echo "   Press Ctrl+C to stop both servers"
    
    # Wait for interrupt
    trap "kill $FRONTEND_PID $BACKEND_PID; exit" INT
    wait
fi
