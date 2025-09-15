# Skill Badge Platform Startup Script for Windows PowerShell
Write-Host "🚀 Starting Skill Badge Platform..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ and try again." -ForegroundColor Red
    exit 1
}

# Check Node.js version
$versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
if ($versionNumber -lt 18) {
    Write-Host "❌ Node.js version 18+ is required. Current version: $nodeVersion" -ForegroundColor Red
    exit 1
}

# Check if backend directory exists
if (-not (Test-Path "backend")) {
    Write-Host "❌ Backend directory not found. Please ensure you're in the correct directory." -ForegroundColor Red
    exit 1
}

# Check if backend is set up
if (-not (Test-Path "backend\.env")) {
    Write-Host "📝 Setting up backend environment..." -ForegroundColor Yellow
    Copy-Item "backend\env.example" "backend\.env"
    Write-Host "✅ Environment file created. Please edit backend\.env with your configuration." -ForegroundColor Green
}

# Check if backend dependencies are installed
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

# Check if database is set up
if (-not (Test-Path "backend\dev.db")) {
    Write-Host "🗄️ Setting up database..." -ForegroundColor Yellow
    Set-Location backend
    npm run db:generate
    npm run db:push
    npm run db:seed
    Set-Location ..
}

# Check if frontend dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Starting the platform..." -ForegroundColor Cyan
Write-Host ""

# Start both frontend and backend
Write-Host "🌐 Starting frontend (http://localhost:3000)..." -ForegroundColor Blue
Write-Host "🔧 Starting backend (http://localhost:3001)..." -ForegroundColor Blue
Write-Host ""

# Check if concurrently is available
try {
    $concurrentlyVersion = npm list -g concurrently 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Using concurrently to start both servers..." -ForegroundColor Green
        concurrently "npm run dev" "cd backend && npm run dev"
    } else {
        throw "concurrently not found"
    }
} catch {
    Write-Host "⚠️  concurrently not found. Starting servers separately..." -ForegroundColor Yellow
    Write-Host "   Frontend: npm run dev" -ForegroundColor Cyan
    Write-Host "   Backend: cd backend && npm run dev" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Or install concurrently: npm install -g concurrently" -ForegroundColor Yellow
    Write-Host ""
    
    # Start frontend in background
    Write-Host "🚀 Starting frontend server..." -ForegroundColor Green
    Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run", "dev"
    
    # Start backend
    Write-Host "🚀 Starting backend server..." -ForegroundColor Green
    Set-Location backend
    Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run", "dev"
    Set-Location ..
    
    Write-Host ""
    Write-Host "✅ Both servers started!" -ForegroundColor Green
    Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "   Backend: http://localhost:3001" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Press Ctrl+C to stop both servers" -ForegroundColor Yellow
    
    # Wait for user input
    Read-Host "Press Enter to continue..."
}
