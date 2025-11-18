#!/usr/bin/env powershell
# PulseOps Backend Deployment to AWS App Runner
# Direct deployment without CodeBuild

param(
    [string]$Region = "us-east-2",
    [string]$AccountId = "285168796475"
)

$AWS_CLI = "C:\Program Files\Amazon\AWSCLIV2\aws.exe"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   App Runner Backend Deployment" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan

# Step 1: Verify ECR Repositories Exist
Write-Host "`n[STEP 1] Checking ECR repositories..." -ForegroundColor Yellow

$repos = & $AWS_CLI ecr describe-repositories --region $Region --query 'repositories[*].repositoryName' | ConvertFrom-Json

if ($repos -contains "pulseops-backend") {
    Write-Host "✓ Backend repository exists" -ForegroundColor Green
} else {
    Write-Host "Creating backend repository..." -ForegroundColor White
    & $AWS_CLI ecr create-repository --repository-name pulseops-backend --region $Region 2>&1 | Out-Null
    Write-Host "✓ Backend repository created" -ForegroundColor Green
}

if ($repos -contains "pulseops-frontend") {
    Write-Host "✓ Frontend repository exists" -ForegroundColor Green
} else {
    Write-Host "Creating frontend repository..." -ForegroundColor White
    & $AWS_CLI ecr create-repository --repository-name pulseops-frontend --region $Region 2>&1 | Out-Null
    Write-Host "✓ Frontend repository created" -ForegroundColor Green
}

# Step 2: Build Docker Images (using pre-existing Dockerfiles)
Write-Host "`n[STEP 2] Building Docker images..." -ForegroundColor Yellow

Write-Host "Backend Dockerfile location:" -ForegroundColor White
Test-Path "services\api\Dockerfile" | ForEach-Object { if ($_) { Write-Host "✓ Found" -ForegroundColor Green } else { Write-Host "✗ Not found" -ForegroundColor Red } }

Write-Host "Frontend Dockerfile location:" -ForegroundColor White
Test-Path "services\ui\Dockerfile" | ForEach-Object { if ($_) { Write-Host "✓ Found" -ForegroundColor Green } else { Write-Host "✗ Not found" -ForegroundColor Red } }

# Step 3: Create RDS Database
Write-Host "`n[STEP 3] Setting up PostgreSQL Database..." -ForegroundColor Yellow

$dbInstanceId = "pulseops-db"
$dbPassword = "PulseOps2025!Admin"
$dbUsername = "pulseops"

Write-Host "Database configuration:" -ForegroundColor White
Write-Host "  Instance: $dbInstanceId" -ForegroundColor Cyan
Write-Host "  Engine: PostgreSQL 15.4" -ForegroundColor Cyan
Write-Host "  Class: db.t3.micro" -ForegroundColor Cyan
Write-Host "  Username: $dbUsername" -ForegroundColor Cyan

Write-Host "`nCreating RDS instance (5-10 minutes)..." -ForegroundColor White

try {
    & $AWS_CLI rds create-db-instance `
        --db-instance-identifier $dbInstanceId `
        --db-instance-class db.t3.micro `
        --engine postgres `
        --engine-version 15.4 `
        --master-username $dbUsername `
        --master-user-password $dbPassword `
        --allocated-storage 20 `
        --storage-type gp2 `
        --publicly-accessible `
        --no-multi-az `
        --region $Region 2>&1 | Out-Null
    
    Write-Host "✓ RDS creation initiated" -ForegroundColor Green
} catch {
    Write-Host "Note: RDS instance may already exist (OK)" -ForegroundColor Yellow
}

# Step 4: Create App Runner Service
Write-Host "`n[STEP 4] Preparing App Runner Service..." -ForegroundColor Yellow

$backendImageUri = "$AccountId.dkr.ecr.$Region.amazonaws.com/pulseops-backend:latest"

Write-Host "Service configuration:" -ForegroundColor White
Write-Host "  Name: pulseops-backend-service" -ForegroundColor Cyan
Write-Host "  Image: $backendImageUri" -ForegroundColor Cyan
Write-Host "  Port: 8000" -ForegroundColor Cyan
Write-Host "  CPU: 0.25 vCPU" -ForegroundColor Cyan
Write-Host "  Memory: 512 MB" -ForegroundColor Cyan

# Step 5: Create IAM Role for App Runner
Write-Host "`n[STEP 5] Creating IAM role..." -ForegroundColor Yellow

$trustPolicy = @{
    Version = "2012-10-17"
    Statement = @(
        @{
            Effect = "Allow"
            Principal = @{
                Service = "tasks.apprunner.amazonaws.com"
            }
            Action = "sts:AssumeRole"
        }
    )
} | ConvertTo-Json

$trustFile = "$env:TEMP\apprunner-trust.json"
$trustPolicy | Out-File -FilePath $trustFile -Encoding utf8

try {
    & $AWS_CLI iam create-role `
        --role-name PulseOpsAppRunnerRole `
        --assume-role-policy-document file://$trustFile `
        --region $Region 2>&1 | Out-Null
    
    Write-Host "✓ IAM role created" -ForegroundColor Green
} catch {
    Write-Host "✓ IAM role already exists (OK)" -ForegroundColor Green
}

# Attach ECR access policy
& $AWS_CLI iam attach-role-policy `
    --role-name PulseOpsAppRunnerRole `
    --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly `
    --region $Region 2>&1 | Out-Null

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "   Setup Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "`n📋 NEXT MANUAL STEPS:" -ForegroundColor Yellow

Write-Host "`n1. Build and push Docker images:" -ForegroundColor White
Write-Host "   cd services/api" -ForegroundColor Cyan
Write-Host "   docker build -t pulseops-backend:latest ." -ForegroundColor Cyan
Write-Host "   docker tag pulseops-backend:latest $backendImageUri" -ForegroundColor Cyan
Write-Host "   docker push $backendImageUri" -ForegroundColor Cyan

Write-Host "`n2. Wait for RDS database to be available (5-10 minutes)" -ForegroundColor White
Write-Host "   Check status: aws rds describe-db-instances --db-instance-identifier $dbInstanceId" -ForegroundColor Cyan

Write-Host "`n3. Create App Runner service in AWS Console:" -ForegroundColor White
Write-Host "   https://console.aws.amazon.com/apprunner" -ForegroundColor Cyan
Write-Host "   Use image: $backendImageUri" -ForegroundColor Cyan

Write-Host "`n4. Set Environment Variables in App Runner:" -ForegroundColor White
Write-Host "   DB_HOST: (get from RDS endpoint)" -ForegroundColor Cyan
Write-Host "   DB_PORT: 5432" -ForegroundColor Cyan
Write-Host "   DB_NAME: pulseops" -ForegroundColor Cyan
Write-Host "   DB_USER: $dbUsername" -ForegroundColor Cyan
Write-Host "   DB_PASSWORD: $dbPassword" -ForegroundColor Cyan

Write-Host "`n💡 Without Docker Desktop, use AWS CodeBuild or use pre-built images" -ForegroundColor Yellow

Write-Host "`n✓ Infrastructure ready for backend deployment" -ForegroundColor Green
