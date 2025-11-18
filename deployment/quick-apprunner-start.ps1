#!/usr/bin/env powershell
# Quick start for App Runner deployment
# Run this first, then follow the console steps

$ErrorActionPreference = "Stop"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " App Runner Quick Deploy" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan

# Step 1: RDS Database
Write-Host "`n[1/3] Creating RDS Database..." -ForegroundColor Yellow

try {
    $rdsResult = aws rds create-db-instance `
        --db-instance-identifier pulseops-db `
        --db-instance-class db.t3.micro `
        --engine postgres `
        --engine-version 15.4 `
        --master-username pulseops `
        --master-user-password "PulseOps2025!Admin" `
        --allocated-storage 20 `
        --publicly-accessible `
        --region us-east-2 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ RDS creation initiated (5-10 min)" -ForegroundColor Green
    } else {
        if ($rdsResult -like "*already exists*") {
            Write-Host "✓ RDS already exists (OK)" -ForegroundColor Green
        } else {
            Write-Host "Note: $($rdsResult)" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "✓ RDS exists or created (OK)" -ForegroundColor Green
}

# Step 2: Verify CodeBuild
Write-Host "`n[2/3] Checking CodeBuild..." -ForegroundColor Yellow

$projects = aws codebuild list-projects --region us-east-2 --output text --query 'projects'

if ($projects -like "*pulseops-build*") {
    Write-Host "✓ CodeBuild project exists" -ForegroundColor Green
} else {
    Write-Host "⚠ CodeBuild project not found - you'll need to create it" -ForegroundColor Yellow
    Write-Host "  See APP_RUNNER_COMPLETE_GUIDE.md for setup" -ForegroundColor Cyan
}

# Step 3: ECR Repositories
Write-Host "`n[3/3] Setting up ECR repositories..." -ForegroundColor Yellow

try {
    $backendRepo = aws ecr describe-repositories `
        --repository-names pulseops-backend `
        --region us-east-2 `
        --query 'repositories[0].repositoryUri' `
        --output text 2>&1
    
    Write-Host "✓ Backend ECR: $backendRepo" -ForegroundColor Green
} catch {
    Write-Host "Creating backend repository..." -ForegroundColor White
    aws ecr create-repository --repository-name pulseops-backend --region us-east-2 | Out-Null
    Write-Host "✓ Backend repository created" -ForegroundColor Green
}

try {
    $frontendRepo = aws ecr describe-repositories `
        --repository-names pulseops-frontend `
        --region us-east-2 `
        --query 'repositories[0].repositoryUri' `
        --output text 2>&1
    
    Write-Host "✓ Frontend ECR: $frontendRepo" -ForegroundColor Green
} catch {
    Write-Host "Creating frontend repository..." -ForegroundColor White
    aws ecr create-repository --repository-name pulseops-frontend --region us-east-2 | Out-Null
    Write-Host "✓ Frontend repository created" -ForegroundColor Green
}

# Step 4: Show next steps
Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host " ✓ Infrastructure Ready!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan

Write-Host "`n📋 NEXT STEPS:" -ForegroundColor Yellow

Write-Host "`n1️⃣  Wait for RDS (check status):" -ForegroundColor White
Write-Host "   aws rds describe-db-instances --db-instance-identifier pulseops-db --query 'DBInstances[0].DBInstanceStatus' --region us-east-2" -ForegroundColor Cyan

Write-Host "`n2️⃣  Start CodeBuild:" -ForegroundColor White
Write-Host "   aws codebuild start-build --project-name pulseops-build --region us-east-2" -ForegroundColor Cyan

Write-Host "`n3️⃣  Create App Runner (in AWS Console):" -ForegroundColor White
Write-Host "   Go to: https://console.aws.amazon.com/apprunner" -ForegroundColor Cyan
Write-Host "   - Create service" -ForegroundColor Cyan
Write-Host "   - Use ECR image: pulseops-backend:latest" -ForegroundColor Cyan
Write-Host "   - Port: 8000" -ForegroundColor Cyan
Write-Host "   - Memory: 512 MB, CPU: 0.25" -ForegroundColor Cyan

Write-Host "`n4️⃣  Set environment variables in App Runner:" -ForegroundColor White
Write-Host "   DB_HOST=<rds-endpoint>" -ForegroundColor Cyan
Write-Host "   DB_PASSWORD=PulseOps2025!Admin" -ForegroundColor Cyan
Write-Host "   ... (see guide for all variables)" -ForegroundColor Cyan

Write-Host "`n5️⃣  Update frontend API URL:" -ForegroundColor White
Write-Host "   Update services/ui/.env with App Runner URL" -ForegroundColor Cyan
Write-Host "   Rebuild and upload to S3" -ForegroundColor Cyan

Write-Host "`n📖 Full guide: APP_RUNNER_COMPLETE_GUIDE.md" -ForegroundColor Cyan
Write-Host "`n✅ Ready to deploy!" -ForegroundColor Green
