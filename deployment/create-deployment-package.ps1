# Create Deployment Package for AWS Cloud9
# Excludes unnecessary files and creates a clean ZIP

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$outputFile = "pulseops-cloud9-deployment-$timestamp.zip"
$sourceDir = "d:\Superops_hackathon\PulseOPs_Final\SuperOps-hackathon"
$tempDir = "$env:TEMP\pulseops-deploy"

Write-Host "Creating deployment package..." -ForegroundColor Green

# Create temp directory
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Files and folders to include
$includeItems = @(
    "services\api\*.py",
    "services\api\models\",
    "services\api\routers\",
    "services\api\schemas\",
    "services\api\requirements.txt",
    "services\api\config.py",
    "services\api\database.py",
    "services\api\main.py",
    "services\api\*.pkl",
    "services\ml\*.py",
    "services\ml\models\",
    "services\ml\requirements.txt",
    "services\ui\src\",
    "services\ui\public\",
    "services\ui\package.json",
    "services\ui\package-lock.json",
    "infrastructure\",
    "data\",
    "*.md",
    "*.bat",
    "*.ps1"
)

# Copy essential files
Write-Host "Copying files..." -ForegroundColor Yellow

foreach ($item in $includeItems) {
    $sourcePath = Join-Path $sourceDir $item
    
    if (Test-Path $sourcePath) {
        $destPath = Join-Path $tempDir $item
        $destDir = Split-Path $destPath -Parent
        
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        
        if (Test-Path $sourcePath -PathType Container) {
            Copy-Item $sourcePath $destPath -Recurse -Force
        } else {
            Copy-Item $sourcePath $destPath -Force
        }
    }
}

# Exclude patterns
$excludePatterns = @(
    "node_modules",
    "__pycache__",
    "*.pyc",
    ".git",
    "build",
    "dist",
    "package",
    "*.db",
    "test_*.py",
    ".env"
)

# Clean up excluded files from temp directory
Write-Host "Cleaning up excluded files..." -ForegroundColor Yellow

foreach ($pattern in $excludePatterns) {
    Get-ChildItem -Path $tempDir -Recurse -Include $pattern -Force | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
}

# Create ZIP file
Write-Host "Creating ZIP archive..." -ForegroundColor Yellow

$zipPath = Join-Path $sourceDir $outputFile

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -CompressionLevel Optimal

# Cleanup temp directory
Remove-Item $tempDir -Recurse -Force

# Display results
$zipSize = (Get-Item $zipPath).Length / 1MB
Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "✅ Deployment package created successfully!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host "File: $outputFile" -ForegroundColor Cyan
Write-Host "Size: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Cyan
Write-Host "Location: $zipPath" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Upload this ZIP to AWS Cloud9" -ForegroundColor White
Write-Host "2. Extract and run deployment from Cloud9" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Green
