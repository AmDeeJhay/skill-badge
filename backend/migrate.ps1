# PowerShell script to run Prisma migrations
Write-Host "🗄️ Running Prisma migrations..." -ForegroundColor Green

# Navigate to backend directory
Set-Location backend

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file from example..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "✅ .env file created. Please edit it with your database configuration." -ForegroundColor Green
}

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
npm run db:generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}

# Run migrations
Write-Host "🚀 Running database migrations..." -ForegroundColor Yellow
npm run db:migrate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to run migrations" -ForegroundColor Red
    Write-Host "💡 Make sure PostgreSQL is running and DATABASE_URL is correct in .env" -ForegroundColor Yellow
    exit 1
}

# Seed database
Write-Host "🌱 Seeding database..." -ForegroundColor Yellow
npm run db:seed

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to seed database" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Database setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Start the backend server: npm run dev" -ForegroundColor White
Write-Host "2. Start the frontend: cd .. && npm run dev" -ForegroundColor White
Write-Host "3. Test the integration: npm run backend:test:ps1" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Database status:" -ForegroundColor Cyan
Write-Host "- PostgreSQL connection: ✅" -ForegroundColor Green
Write-Host "- Prisma client: ✅" -ForegroundColor Green
Write-Host "- Migrations: ✅" -ForegroundColor Green
Write-Host "- Sample data: ✅" -ForegroundColor Green

# Return to parent directory
Set-Location ..
