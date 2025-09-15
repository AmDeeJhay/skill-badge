# Test script for the backend API - PowerShell Version
Write-Host "🧪 Testing Skill Badge Backend API..." -ForegroundColor Green
Write-Host ""

try {
    # Test 1: Health Check
    Write-Host "1. Testing health check..." -ForegroundColor Yellow
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get
    Write-Host "✅ Health check passed: $($healthResponse.status)" -ForegroundColor Green
    Write-Host "   Uptime: $([math]::Round($healthResponse.uptime)) seconds" -ForegroundColor Cyan
    Write-Host "   Environment: $($healthResponse.environment)" -ForegroundColor Cyan
    Write-Host ""

    # Test 2: Create a test user
    Write-Host "2. Creating test user..." -ForegroundColor Yellow
    $testWallet = "0x" + (-join ((1..40) | ForEach-Object { Get-Random -Maximum 16 -Minimum 0 | ForEach-Object { "{0:x}" -f $_ } }))
    $testDID = "did:polkadot:test-$(Get-Date -Format 'yyyyMMddHHmmss')"
    
    $userData = @{
        wallet = $testWallet
        did = $testDID
        name = "Test User"
        bio = "Test user for API testing"
    } | ConvertTo-Json

    $userResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/users" -Method Post -Body $userData -ContentType "application/json" -Headers @{"x-api-key"="dev-api-key"}
    Write-Host "✅ User created: $($userResponse.data.name)" -ForegroundColor Green
    Write-Host "   Wallet: $($userResponse.data.wallet)" -ForegroundColor Cyan
    Write-Host "   DID: $($userResponse.data.did)" -ForegroundColor Cyan
    Write-Host ""

    # Test 3: Create a credential
    Write-Host "3. Creating test credential..." -ForegroundColor Yellow
    $credentialData = @{
        skill = "TypeScript Development"
        organization = "Test Organization"
        issuer = $testDID
        expirationDate = (Get-Date).AddYears(1).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        metadata = @{
            level = "intermediate"
            description = "Test credential for API testing"
            evidenceUrl = "https://github.com/test/typescript-projects"
        }
    } | ConvertTo-Json

    $credentialResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/credentials" -Method Post -Body $credentialData -ContentType "application/json" -Headers @{"x-api-key"="dev-api-key"}
    Write-Host "✅ Credential created: $($credentialResponse.data.skill)" -ForegroundColor Green
    Write-Host "   Credential ID: $($credentialResponse.data.id)" -ForegroundColor Cyan
    Write-Host "   Organization: $($credentialResponse.data.organization)" -ForegroundColor Cyan
    Write-Host ""

    # Test 4: Get user credentials
    Write-Host "4. Fetching user credentials..." -ForegroundColor Yellow
    $credentialsResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/credentials/$testWallet" -Method Get -Headers @{"x-api-key"="dev-api-key"}
    Write-Host "✅ Credentials fetched: $($credentialsResponse.data.Count) credential(s)" -ForegroundColor Green
    for ($i = 0; $i -lt $credentialsResponse.data.Count; $i++) {
        $cred = $credentialsResponse.data[$i]
        Write-Host "   $($i + 1). $($cred.skill) ($($cred.status))" -ForegroundColor Cyan
    }
    Write-Host ""

    # Test 5: Get credential status
    Write-Host "5. Checking credential status..." -ForegroundColor Yellow
    $statusResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/credentials/status/$($credentialResponse.data.id)" -Method Get -Headers @{"x-api-key"="dev-api-key"}
    Write-Host "✅ Credential status: $($statusResponse.data.status)" -ForegroundColor Green
    Write-Host ""

    # Test 6: Get platform analytics
    Write-Host "6. Fetching platform analytics..." -ForegroundColor Yellow
    $analyticsResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/analytics/overview" -Method Get -Headers @{"x-api-key"="dev-api-key"}
    Write-Host "✅ Analytics fetched:" -ForegroundColor Green
    Write-Host "   Total users: $($analyticsResponse.data.users.total)" -ForegroundColor Cyan
    Write-Host "   Total credentials: $($analyticsResponse.data.credentials.total)" -ForegroundColor Cyan
    Write-Host "   Valid credentials: $($analyticsResponse.data.credentials.valid)" -ForegroundColor Cyan
    Write-Host "   Verification success rate: $([math]::Round($analyticsResponse.data.verifications.successRate, 1))%" -ForegroundColor Cyan
    Write-Host ""

    # Test 7: Get trending skills
    Write-Host "7. Fetching trending skills..." -ForegroundColor Yellow
    $trendingResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/analytics/skills-trending?limit=5" -Method Get -Headers @{"x-api-key"="dev-api-key"}
    Write-Host "✅ Trending skills:" -ForegroundColor Green
    for ($i = 0; $i -lt $trendingResponse.data.Count; $i++) {
        $skill = $trendingResponse.data[$i]
        Write-Host "   $($i + 1). $($skill.name) ($($skill.count) credentials)" -ForegroundColor Cyan
    }
    Write-Host ""

    Write-Host "🎉 All tests passed! Backend API is working correctly." -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Test Summary:" -ForegroundColor Cyan
    Write-Host "- Health check: ✅" -ForegroundColor Green
    Write-Host "- User creation: ✅" -ForegroundColor Green
    Write-Host "- Credential creation: ✅" -ForegroundColor Green
    Write-Host "- Data retrieval: ✅" -ForegroundColor Green
    Write-Host "- Status checking: ✅" -ForegroundColor Green
    Write-Host "- Analytics: ✅" -ForegroundColor Green
    Write-Host "- Trending skills: ✅" -ForegroundColor Green

} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure the backend server is running on http://localhost:3001" -ForegroundColor White
    Write-Host "2. Check that the database is properly set up" -ForegroundColor White
    Write-Host "3. Verify environment variables are configured" -ForegroundColor White
    Write-Host "4. Check backend logs for detailed error information" -ForegroundColor White
}
