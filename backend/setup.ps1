# Skill Badge Backend Setup Script for Windows PowerShell
Write-Host "🚀 Setting up Skill Badge Backend..." -ForegroundColor Green

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

# Navigate to backend directory
Set-Location backend

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green

# Create environment file
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating environment file..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "✅ Environment file created. Please edit .env with your configuration." -ForegroundColor Green
} else {
    Write-Host "✅ Environment file already exists" -ForegroundColor Green
}

# Create necessary directories
Write-Host "📁 Creating necessary directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "logs" -Force | Out-Null
New-Item -ItemType Directory -Path "uploads" -Force | Out-Null

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
npm run db:generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}

# Push database schema
Write-Host "🗄️ Setting up database..." -ForegroundColor Yellow
npm run db:push

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to setup database" -ForegroundColor Red
    exit 1
}

# Seed database
Write-Host "🌱 Seeding database with sample data..." -ForegroundColor Yellow
npm run db:seed

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to seed database" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Backend setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env file with your configuration" -ForegroundColor White
Write-Host "2. Start the development server: npm run dev" -ForegroundColor White
Write-Host "3. The API will be available at http://localhost:3001" -ForegroundColor White
Write-Host "4. Health check: http://localhost:3001/health" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "- API Documentation: README.md" -ForegroundColor White
Write-Host "- Database Schema: prisma/schema.prisma" -ForegroundColor White
Write-Host "- Environment Variables: env.example" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Available commands:" -ForegroundColor Cyan
Write-Host "- npm run dev          # Start development server" -ForegroundColor White
Write-Host "- npm run build        # Build for production" -ForegroundColor White
Write-Host "- npm run start        # Start production server" -ForegroundColor White
Write-Host "- npm run test         # Run tests" -ForegroundColor White
Write-Host "- npm run db:studio    # Open Prisma Studio" -ForegroundColor White
Write-Host "- npm run db:seed      # Reseed database" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green

# Return to parent directory
Set-Location ..
