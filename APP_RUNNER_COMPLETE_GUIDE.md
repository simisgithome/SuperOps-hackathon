# App Runner Backend Deployment Guide (Option B)

## Overview
This is the **complete** backend deployment without Docker Desktop installed. We'll use AWS-hosted solutions to build and run your FastAPI backend.

**Timeline:** 15-20 minutes total (5-10 min RDS creation + 5-10 min App Runner deployment)

---

## Architecture

```
GitHub (branch1)
    ↓
AWS CodeBuild (builds Docker image)
    ↓
Amazon ECR (stores Docker image)
    ↓
AWS App Runner (runs container)
    ↓
RDS PostgreSQL (database)
```

**Why this works without Docker Desktop:**
- CodeBuild has Docker pre-installed in the build environment
- You don't build locally - AWS builds it for you
- App Runner manages container orchestration automatically

---

## Step-by-Step Deployment

### Step 1: Verify CodeBuild Project Exists (1 minute)

```powershell
# Check if CodeBuild project exists
aws codebuild list-projects --region us-east-2

# You should see: pulseops-build
```

**Expected Output:**
```json
{
    "projects": ["pulseops-build"]
}
```

If not listed, create it using:
```powershell
# Create CodeBuild project
aws codebuild create-project `
    --name pulseops-build `
    --source type=GITHUB,location=https://github.com/simisgithome/SuperOps-hackathon.git,gitCloneDepth=1,gitSubmodulesConfig={submodules={}} `
    --artifacts type=NO_ARTIFACTS `
    --environment type=LINUX_CONTAINER,image=aws/codebuild/standard:7.0,computeType=BUILD_GENERAL1_MEDIUM,environmentVariables='[{name=AWS_ACCOUNT_ID,value=285168796475},{name=AWS_DEFAULT_REGION,value=us-east-2},{name=IMAGE_REPO_NAME_BACKEND,value=pulseops-backend},{name=IMAGE_REPO_NAME_FRONTEND,value=pulseops-frontend},{name=IMAGE_TAG,value=latest}]' `
    --service-role arn:aws:iam::285168796475:role/CodeBuildRole `
    --region us-east-2
```

---

### Step 2: Create/Verify RDS Database (5-10 minutes)

```powershell
# Create RDS instance
aws rds create-db-instance `
    --db-instance-identifier pulseops-db `
    --db-instance-class db.t3.micro `
    --engine postgres `
    --engine-version 15.4 `
    --master-username pulseops `
    --master-user-password "PulseOps2025!Admin" `
    --allocated-storage 20 `
    --storage-type gp2 `
    --publicly-accessible `
    --region us-east-2
```

**Expected Output:** Database creation initiated

**Check Status:**
```powershell
aws rds describe-db-instances `
    --db-instance-identifier pulseops-db `
    --query 'DBInstances[0].DBInstanceStatus' `
    --region us-east-2
```

**Wait for Status:** `available` (takes 5-10 minutes)

**Get Connection Details:**
```powershell
aws rds describe-db-instances `
    --db-instance-identifier pulseops-db `
    --query 'DBInstances[0].[Endpoint.Address,Endpoint.Port]' `
    --region us-east-2
```

**Example Output:**
```
pulseops-db.c1abc2defg.us-east-2.rds.amazonaws.com  5432
```

---

### Step 3: Start CodeBuild (5-10 minutes)

```powershell
# Start build
$buildId = aws codebuild batch-get-builds `
    --ids $(aws codebuild start-build --project-name pulseops-build --region us-east-2 --query 'build.id' --output text) `
    --region us-east-2 `
    --query 'builds[0].id' `
    --output text

Write-Host "Build started: $buildId"

# Wait 5 minutes
Start-Sleep -Seconds 300

# Check status
aws codebuild batch-get-builds --ids $buildId --region us-east-2 --query 'builds[0].buildStatus'
```

**Expected Status:** `SUCCEEDED`

**If FAILED:** Check logs:
```powershell
aws codebuild batch-get-builds `
    --ids $buildId `
    --region us-east-2 `
    --query 'builds[0].logs.cloudWatchLogs'
```

---

### Step 4: Verify Docker Images in ECR (1 minute)

```powershell
# List images in backend repository
aws ecr list-images `
    --repository-name pulseops-backend `
    --region us-east-2
```

**Expected Output:**
```json
{
    "imageIds": [
        {
            "imageTag": "latest",
            "imageDigest": "sha256:abc123..."
        }
    ]
}
```

Get the full image URI:
```powershell
$backendImage = "285168796475.dkr.ecr.us-east-2.amazonaws.com/pulseops-backend:latest"
Write-Host "Backend Image: $backendImage"
```

---

### Step 5: Create App Runner Service (2 minutes)

**Option A: AWS Console (Recommended)**

1. Go to: https://console.aws.amazon.com/apprunner
2. Click "Create service"
3. Select "Container registry"
4. Choose "Amazon ECR"
5. Select repository: `pulseops-backend`
6. Select image tag: `latest`
7. Click "Next"
8. Service name: `pulseops-backend-service`
9. Port: `8000`
10. CPU: `0.25 vCPU`
11. Memory: `512 MB`
12. Click "Create & Deploy"

**Option B: AWS CLI**

```powershell
# Create App Runner service
aws apprunner create-service `
    --service-name pulseops-backend-service `
    --source-configuration ImageRepository={ImageIdentifier='285168796475.dkr.ecr.us-east-2.amazonaws.com/pulseops-backend:latest',ImageRepositoryType=ECR,ImageConfiguration={Port=8000}} `
    --instance-configuration Cpu=0.25,Memory=512,InstanceRoleArn=arn:aws:iam::285168796475:role/PulseOpsAppRunnerRole `
    --region us-east-2
```

---

### Step 6: Configure Environment Variables (2 minutes)

Once App Runner service is created and running:

1. Open the App Runner service: https://console.aws.amazon.com/apprunner/services/pulseops-backend-service
2. Click "Configuration"
3. Click "Edit" on "Environment variables"
4. Add these variables:

| Variable | Value |
|----------|-------|
| `DB_HOST` | `pulseops-db.xxxxx.us-east-2.rds.amazonaws.com` |
| `DB_PORT` | `5432` |
| `DB_NAME` | `pulseops` |
| `DB_USER` | `pulseops` |
| `DB_PASSWORD` | `PulseOps2025!Admin` |
| `ALLOWED_ORIGINS` | `https://pulseops-ui-202604.s3.amazonaws.com` |

5. Click "Save"
6. Service will restart automatically

---

### Step 7: Update Frontend to Connect to Backend (2 minutes)

The frontend needs the App Runner backend URL.

1. Get the App Runner service URL:
```powershell
aws apprunner describe-service `
    --service-arn arn:aws:apprunner:us-east-2:285168796475:service/pulseops-backend-service `
    --query 'Service.ServiceUrl' `
    --region us-east-2
```

2. Update `services/ui/.env`:
```
REACT_APP_API_URL=https://your-apprunner-url
```

3. Rebuild React app:
```powershell
cd services/ui
npm run build
```

4. Upload to S3:
```powershell
aws s3 sync build/ s3://pulseops-ui-202604 --delete
```

---

## Verification Checklist

- [ ] RDS database status: `available`
- [ ] CodeBuild status: `SUCCEEDED`
- [ ] ECR image listed in `pulseops-backend` repository
- [ ] App Runner service status: `RUNNING`
- [ ] App Runner environment variables configured
- [ ] Frontend deployed to S3 with updated API URL
- [ ] Can access backend: `curl https://<apprunner-url>/api/health`

---

## Costs

| Service | Cost |
|---------|------|
| RDS (db.t3.micro) | ~$30/month |
| App Runner (0.25 vCPU, on-demand) | ~$20/month (dev) |
| CodeBuild (free tier) | ~$0 (1,000 min/month) |
| **Total** | **~$50/month** |

---

## Troubleshooting

### CodeBuild Fails
- Check buildspec.yml syntax in `deployment/` folder
- View CloudWatch logs in CodeBuild console
- Verify GitHub token has repo access

### App Runner Service Won't Start
- Check environment variables are set correctly
- Verify RDS database is accessible (publicly-accessible = true)
- Check service logs in App Runner console

### Frontend Can't Connect to Backend
- Verify API URL in environment variables
- Check CORS configuration in backend
- Test with: `curl https://<backend-url>/api/health`

---

## Next Steps

1. ✅ Deploy backend with Option B (this guide)
2. ✅ Connect frontend to backend
3. ⏳ Set up custom domain (optional)
4. ⏳ Configure monitoring and alerts
5. ⏳ Set up GitHub Actions for auto-deployment

---

**Ready to deploy?** Run the pre-deployment script:
```powershell
.\deployment\apprunner-deploy.ps1
```

This will set up the IAM roles and RDS database automatically, then guide you through the manual App Runner creation (which is simpler via console).
