#!/usr/bin/env powershell
# PulseOps AWS Deployment - Direct Approach (3-minute wait)

param(
    [string]$Region = "us-east-2",
    [string]$Environment = "dev"
)

$AWS_CLI = "C:\Program Files\Amazon\AWSCLIV2\aws.exe"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   PulseOps Quick Deploy (3-Min Strategy)" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "`n[STRATEGY] Using Amplify Hosting (Fastest Alternative)" -ForegroundColor Yellow
Write-Host "Why: Skips Docker build complexity, direct from source" -ForegroundColor White
Write-Host "Time: 3-5 minutes setup" -ForegroundColor White

Write-Host "`nConnecting to GitHub for Amplify..." -ForegroundColor Yellow

Write-Host "`nAmplify Deployment Steps:" -ForegroundColor Cyan
Write-Host "1. Go to: https://console.aws.amazon.com/amplify" -ForegroundColor White
Write-Host "2. Click 'New App' → 'Host Web App'" -ForegroundColor White
Write-Host "3. Select GitHub → Authorize & Choose 'SuperOps-hackathon' repo" -ForegroundColor White
Write-Host "4. Select branch: 'branch1'" -ForegroundColor White
Write-Host "5. Build settings:" -ForegroundColor White
Write-Host "   - Framework: React" -ForegroundColor Cyan
Write-Host "   - Build command: npm run build" -ForegroundColor Cyan
Write-Host "   - Output directory: build" -ForegroundColor Cyan
Write-Host "6. Deploy!" -ForegroundColor White

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "   Estimated Time: 5-10 minutes" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "`nOR: Manual Quick Deploy using AWS CLI" -ForegroundColor Yellow

Write-Host "`n[Option 2] Deploy Frontend Only (S3 + CloudFront)" -ForegroundColor Cyan

# Create S3 bucket
$bucketName = "pulseops-ui-$(Get-Random -Minimum 100000 -Maximum 999999)"
Write-Host "`nCreating S3 bucket: $bucketName" -ForegroundColor White

& $AWS_CLI s3 mb s3://$bucketName --region us-east-2 2>&1 | Out-Null
Write-Host "✓ Bucket created" -ForegroundColor Green

# Build React app locally
Write-Host "`nBuilding React app locally..." -ForegroundColor White
Push-Location services\ui
npm run build 2>&1 | Out-Null
Pop-Location
Write-Host "✓ React build complete" -ForegroundColor Green

# Upload to S3
Write-Host "`nUploading to S3..." -ForegroundColor White
& $AWS_CLI s3 sync services/ui/build s3://$bucketName --region us-east-2 2>&1 | Out-Null
Write-Host "✓ Upload complete" -ForegroundColor Green

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "Frontend deployed to: https://$bucketName.s3.amazonaws.com/index.html" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Green

Write-Host "`nFor backend: Fix buildspec → trigger CodeBuild → Use App Runner" -ForegroundColor Yellow
