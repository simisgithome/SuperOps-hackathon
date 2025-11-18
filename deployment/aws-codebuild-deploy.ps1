# AWS CodeBuild Deployment for PulseOps
# Builds Docker images in AWS Cloud without local Docker

param(
    [string]$Region = "us-east-2",
    [string]$AccountId = "285168796475"
)

$AWS_CLI = "C:\Program Files\Amazon\AWSCLIV2\aws.exe"
$ProjectRoot = "d:\Superops_hackathon\PulseOPs_Final\SuperOps-hackathon"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   AWS CodeBuild Deployment Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create S3 Bucket for Source Code
$BucketName = "pulseops-build-source-$AccountId"
Write-Host "[STEP 1] Creating S3 bucket for source code..." -ForegroundColor Cyan
$bucketResult = & $AWS_CLI s3 mb s3://$BucketName --region $Region 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "S3 bucket created: $BucketName" -ForegroundColor Green
} else {
    Write-Host "S3 bucket already exists (OK)" -ForegroundColor Green
}

# Step 2: Create ZIP of source code
Write-Host "`n[STEP 2] Creating source code package..." -ForegroundColor Cyan
$SourceZip = "$ProjectRoot\pulseops-source.zip"

if (Test-Path $SourceZip) {
    Remove-Item $SourceZip -Force
}

# Create ZIP with required files
$FilesToInclude = @(
    "services\",
    "buildspec.yml"
)

Write-Host "Compressing source code..." -ForegroundColor Yellow
Push-Location $ProjectRoot

# Create temporary directory structure
$TempDir = "$env:TEMP\pulseops-build"
if (Test-Path $TempDir) {
    Remove-Item $TempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $TempDir | Out-Null

# Copy necessary files
Copy-Item "services" "$TempDir\services" -Recurse -Force
Copy-Item "buildspec.yml" "$TempDir\" -Force

# Remove unnecessary files
Get-ChildItem "$TempDir" -Recurse -Include "node_modules","__pycache__","*.pyc","*.db","test_*.py" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

# Create ZIP
Compress-Archive -Path "$TempDir\*" -DestinationPath $SourceZip -Force
Remove-Item $TempDir -Recurse -Force

Pop-Location

$zipSize = (Get-Item $SourceZip).Length / 1MB
Write-Host "Source package created: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Green

# Step 3: Upload to S3
Write-Host "`n[STEP 3] Uploading source code to S3..." -ForegroundColor Cyan
& $AWS_CLI s3 cp $SourceZip s3://$BucketName/source.zip --region $Region
Write-Host "Source code uploaded to S3" -ForegroundColor Green

# Step 4: Create IAM Role for CodeBuild
Write-Host "`n[STEP 4] Creating IAM role for CodeBuild..." -ForegroundColor Cyan

$TrustPolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "codebuild.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
"@

$TrustPolicyFile = "$env:TEMP\trust-policy.json"
$TrustPolicy | Out-File -FilePath $TrustPolicyFile -Encoding utf8

& $AWS_CLI iam create-role --role-name PulseOpsCodeBuildRole --assume-role-policy-document file://$TrustPolicyFile --region $Region 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "IAM role created" -ForegroundColor Green
} else {
    Write-Host "IAM role already exists (OK)" -ForegroundColor Green
}

# Attach policies
Write-Host "Attaching policies to role..." -ForegroundColor Yellow
& $AWS_CLI iam attach-role-policy --role-name PulseOpsCodeBuildRole --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser --region $Region 2>&1 | Out-Null
& $AWS_CLI iam attach-role-policy --role-name PulseOpsCodeBuildRole --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess --region $Region 2>&1 | Out-Null
& $AWS_CLI iam attach-role-policy --role-name PulseOpsCodeBuildRole --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess --region $Region 2>&1 | Out-Null
Write-Host "Policies attached" -ForegroundColor Green

Write-Host "`nWaiting for IAM role to propagate (15 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Step 5: Create CodeBuild Project
Write-Host "`n[STEP 5] Creating CodeBuild project..." -ForegroundColor Cyan

$BuildSpec = @"
{
  "name": "pulseops-build",
  "description": "Build Docker images for PulseOps",
  "source": {
    "type": "S3",
    "location": "$BucketName/source.zip"
  },
  "artifacts": {
    "type": "NO_ARTIFACTS"
  },
  "environment": {
    "type": "LINUX_CONTAINER",
    "image": "aws/codebuild/standard:7.0",
    "computeType": "BUILD_GENERAL1_SMALL",
    "privilegedMode": true,
    "environmentVariables": [
      {
        "name": "AWS_DEFAULT_REGION",
        "value": "$Region"
      },
      {
        "name": "AWS_ACCOUNT_ID",
        "value": "$AccountId"
      }
    ]
  },
  "serviceRole": "arn:aws:iam::${AccountId}:role/PulseOpsCodeBuildRole"
}
"@

$BuildSpecFile = "$env:TEMP\codebuild-project.json"
$BuildSpec | Out-File -FilePath $BuildSpecFile -Encoding utf8

& $AWS_CLI codebuild create-project --cli-input-json file://$BuildSpecFile --region $Region 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "CodeBuild project created" -ForegroundColor Green
} else {
    Write-Host "CodeBuild project already exists, updating..." -ForegroundColor Yellow
    & $AWS_CLI codebuild update-project --cli-input-json file://$BuildSpecFile --region $Region
}

# Step 6: Start Build
Write-Host "`n[STEP 6] Starting CodeBuild..." -ForegroundColor Cyan
Write-Host "This will take 5-10 minutes to build both Docker images..." -ForegroundColor Yellow

$buildResult = & $AWS_CLI codebuild start-build --project-name pulseops-build --region $Region | ConvertFrom-Json
$buildId = $buildResult.build.id

Write-Host "Build started: $buildId" -ForegroundColor Green
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Build In Progress" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Monitor build progress:" -ForegroundColor White
Write-Host "  AWS Console: https://console.aws.amazon.com/codesuite/codebuild/projects/pulseops-build/history" -ForegroundColor Cyan
Write-Host ""
Write-Host "Or check status with:" -ForegroundColor White
Write-Host "  & '$AWS_CLI' codebuild batch-get-builds --ids $buildId --region $Region" -ForegroundColor Cyan
Write-Host ""
Write-Host "Once build completes (5-10 minutes), proceed to create App Runner services" -ForegroundColor Yellow
Write-Host ""
