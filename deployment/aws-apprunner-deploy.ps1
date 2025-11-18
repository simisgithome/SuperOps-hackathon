# AWS App Runner Deployment Script for PulseOps
param(
    [string]$Region = "us-east-2",
    [string]$AccountId = ""
)

$ErrorActionPreference = "Continue"
$AWS_CLI = "C:\Program Files\Amazon\AWSCLIV2\aws.exe"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   PulseOps AWS App Runner Deployment" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Get AWS Account ID
if ([string]::IsNullOrEmpty($AccountId)) {
    Write-Host "Getting AWS Account ID..." -ForegroundColor Yellow
    $identityJson = & $AWS_CLI sts get-caller-identity --region $Region
    $identity = $identityJson | ConvertFrom-Json
    $AccountId = $identity.Account
    Write-Host "Account ID: $AccountId" -ForegroundColor Green
}

$ECR_BACKEND = "$AccountId.dkr.ecr.$Region.amazonaws.com/pulseops-backend"
$ECR_FRONTEND = "$AccountId.dkr.ecr.$Region.amazonaws.com/pulseops-frontend"

# Step 1: Create ECR Repositories
Write-Host "`n[STEP 1] Creating ECR Repositories..." -ForegroundColor Cyan

Write-Host "Creating backend repository..." -ForegroundColor Yellow
& $AWS_CLI ecr create-repository --repository-name pulseops-backend --region $Region 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Backend repository created" -ForegroundColor Green
} else {
    Write-Host "Backend repository already exists (OK)" -ForegroundColor Green
}

Write-Host "Creating frontend repository..." -ForegroundColor Yellow
& $AWS_CLI ecr create-repository --repository-name pulseops-frontend --region $Region 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Frontend repository created" -ForegroundColor Green
} else {
    Write-Host "Frontend repository already exists (OK)" -ForegroundColor Green
}

# Step 2: Login to ECR
Write-Host "`n[STEP 2] Logging in to Amazon ECR..." -ForegroundColor Cyan
$ecrPassword = & $AWS_CLI ecr get-login-password --region $Region
$ecrPassword | docker login --username AWS --password-stdin "$AccountId.dkr.ecr.$Region.amazonaws.com"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Logged in to ECR successfully" -ForegroundColor Green
} else {
    Write-Host "ERROR: Failed to login to ECR" -ForegroundColor Red
    exit 1
}

# Step 3: Build Docker Images
Write-Host "`n[STEP 3] Building Docker Images..." -ForegroundColor Cyan

# Build Backend
Write-Host "Building backend image (this may take several minutes)..." -ForegroundColor Yellow
Push-Location "services\api"
docker build -t pulseops-backend:latest .
docker tag pulseops-backend:latest $ECR_BACKEND:latest
Pop-Location
Write-Host "Backend image built" -ForegroundColor Green

# Build Frontend
Write-Host "Building frontend image (this may take several minutes)..." -ForegroundColor Yellow
Push-Location "services\ui"
docker build -t pulseops-frontend:latest .
docker tag pulseops-frontend:latest $ECR_FRONTEND:latest
Pop-Location
Write-Host "Frontend image built" -ForegroundColor Green

# Step 4: Push to ECR
Write-Host "`n[STEP 4] Pushing Images to ECR..." -ForegroundColor Cyan

Write-Host "Pushing backend image..." -ForegroundColor Yellow
docker push $ECR_BACKEND:latest
Write-Host "Backend image pushed" -ForegroundColor Green

Write-Host "Pushing frontend image..." -ForegroundColor Yellow
docker push $ECR_FRONTEND:latest
Write-Host "Frontend image pushed" -ForegroundColor Green

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "   Docker Images Ready!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend Image URI:  $ECR_BACKEND:latest" -ForegroundColor Cyan
Write-Host "Frontend Image URI: $ECR_FRONTEND:latest" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Go to AWS App Runner Console: https://console.aws.amazon.com/apprunner" -ForegroundColor White
Write-Host "2. Create two services (backend and frontend) using these image URIs" -ForegroundColor White
Write-Host "3. Configure environment variables for backend service" -ForegroundColor White
Write-Host ""
