# Option B: App Runner Backend Deployment - Step-by-Step Console Guide

## 🎯 Overview

Since your Docker Desktop isn't functional, we'll deploy the backend using **AWS App Runner** - no Docker needed on your machine. All builds happen in the cloud.

**Total Time:** ~20-30 minutes  
**Cost:** ~$50/month

---

## Architecture Diagram

```
Your GitHub Repo (branch1)
         ↓
    [You manually upload or GitHub trigger]
         ↓
AWS CodeBuild (builds Docker image in cloud)
         ↓
Amazon ECR (stores Docker image)
         ↓
AWS App Runner (runs container, auto-scales)
         ↓
RDS PostgreSQL (database)
```

---

## 🚀 Step 1: Create RDS Database (5 minutes)

### 1.1 Open RDS Console
Go to: https://console.aws.amazon.com/rds

### 1.2 Create Database Instance
1. Click **Create database**
2. Select **PostgreSQL** (Standard create)
3. Fill in these settings:

| Field | Value |
|-------|-------|
| DB instance identifier | `pulseops-db` |
| DB instance class | `db.t3.micro` (Free tier) |
| Storage | 20 GB (gp2) |
| Master username | `pulseops` |
| Master password | `PulseOps2025!Admin` |
| Public accessibility | **Yes** |

4. Expand **Additional configuration**:
   - Initial database name: `pulseops`
   - Backup retention: `7 days`

5. Click **Create database**

**Status Check:**
- Database creation takes **5-10 minutes**
- Status changes: `Creating` → `Modifying` → `Available`
- Wait until status is **Available** before proceeding

---

## 📦 Step 2: Build Docker Images (5 minutes)

### Why CodeBuild?
Since Docker Desktop isn't working on your Windows machine, AWS CodeBuild will build Docker images **in the cloud** for free (1000 min/month included).

### 2.1 Check ECR Repositories
Go to: https://console.aws.amazon.com/ecr

You should see:
- ✅ `pulseops-backend`
- ✅ `pulseops-frontend`

If not, create them:
1. Click **Create repository**
2. Repository name: `pulseops-backend` → Create
3. Repeat for `pulseops-frontend`

### 2.2 Trigger CodeBuild
Go to: https://console.aws.amazon.com/codebuild/

1. Click **Build projects**
2. Select **pulseops-build**
3. Click **Start build**
4. Leave defaults, click **Start build**

**Wait for build:**
- Status: `QUEUED` → `IN_PROGRESS` → `SUCCEEDED`
- Takes ~5 minutes
- If FAILED, check the logs (Cloudwatch tab)

**Verify Docker images were created:**
1. Go to: https://console.aws.amazon.com/ecr
2. Click `pulseops-backend`
3. You should see an image with tag `latest`

---

## 🚀 Step 3: Create App Runner Service (3 minutes)

### 3.1 Open App Runner Console
Go to: https://console.aws.amazon.com/apprunner

### 3.2 Create Service
1. Click **Create service**
2. Select **Container registry**
3. Select **Amazon ECR**

### 3.3 Select Container Image
1. **AWS account**: `285168796475` (selected)
2. **ECR repository**: `pulseops-backend`
3. **Image tag**: `latest`
4. **Deployment trigger**: `Manual` (you'll redeploy after updating code)
5. Click **Next**

### 3.4 Configure Service
1. **Service name**: `pulseops-backend-service`
2. Port: `8000`
3. Environment variables: (Add after service is created)
4. Instance configuration:
   - CPU: `0.25 vCPU`
   - Memory: `512 MB`
   - Concurrency: `100`
5. Click **Create & deploy**

**Wait for deployment:**
- Status: `RUNNING` (takes 1-2 minutes)
- You'll see a public URL like: `https://abc123xyz.us-east-2.awsapprunner.com`
- **Copy this URL** - you'll need it

---

## ⚙️ Step 4: Configure Database Connection (2 minutes)

### 4.1 Get RDS Endpoint
1. Go to: https://console.aws.amazon.com/rds
2. Click **Databases**
3. Click `pulseops-db`
4. Copy the **Endpoint** (looks like: `pulseops-db.c1abc2defg.us-east-2.rds.amazonaws.com`)

### 4.2 Set App Runner Environment Variables
1. Go back to App Runner: https://console.aws.amazon.com/apprunner
2. Click `pulseops-backend-service`
3. Click **Configuration** tab
4. Scroll to **Environment variables**
5. Click **Edit**

Add these variables:

| Variable | Value |
|----------|-------|
| `DB_HOST` | `pulseops-db.xxxxx.us-east-2.rds.amazonaws.com` (your RDS endpoint) |
| `DB_PORT` | `5432` |
| `DB_NAME` | `pulseops` |
| `DB_USER` | `pulseops` |
| `DB_PASSWORD` | `PulseOps2025!Admin` |
| `ALLOWED_ORIGINS` | `https://pulseops-ui-202604.s3.amazonaws.com` |

6. Click **Save**
7. Service will restart automatically

---

## 🧪 Step 5: Test Backend (2 minutes)

### 5.1 Test Health Endpoint
1. Get your App Runner URL from the dashboard
2. Open in browser: `https://<your-apprunner-url>/api/health`
   
**Expected response:**
```json
{
    "status": "healthy",
    "database": "connected"
}
```

### 5.2 Test API Endpoint
Try: `https://<your-apprunner-url>/api/clients`

You should get a JSON list of clients (or empty list if no data).

---

## 📱 Step 6: Update Frontend (3 minutes)

Now connect your React app to the backend.

### 6.1 Update Environment Variables
1. Open `services/ui/` folder
2. Create or edit `.env` file:
```
REACT_APP_API_URL=https://<your-apprunner-url>
```

### 6.2 Rebuild React App
```powershell
cd services/ui
npm run build
```

### 6.3 Upload to S3
```powershell
aws s3 sync build/ s3://pulseops-ui-202604 --delete
```

### 6.4 Test in Browser
1. Go to: `https://pulseops-ui-202604.s3.amazonaws.com/index.html`
2. You should now see:
   - ✅ Dashboard loads
   - ✅ Data appears (clients, licenses, etc.)
   - ✅ Active Licenses page works
   - ✅ Color coding displays

---

## 📊 Final Architecture

```
┌─────────────────────────────────────┐
│     Users                           │
│     (Browser)                       │
└──────────┬──────────────────────────┘
           │
      ┌────┴──────┐
      ↓           ↓
┌──────────┐  ┌──────────────┐
│ Frontend │  │ API Requests │
│ (S3)     │  │ JSON/REST    │
└──────────┘  └──────┬───────┘
                     ↓
            ┌────────────────┐
            │ App Runner     │
            │ (FastAPI)      │
            │ Port 8000      │
            └────────┬───────┘
                     ↓
            ┌────────────────┐
            │ RDS PostgreSQL │
            │ Port 5432      │
            └────────────────┘
```

---

## 💰 Cost Breakdown

| Service | Cost | Notes |
|---------|------|-------|
| App Runner (0.25 vCPU, on-demand) | $20/month | Only charged when handling requests |
| RDS (db.t3.micro) | $30/month | First year eligible for free tier |
| CodeBuild | ~$0 | Free 1,000 minutes/month |
| S3 (frontend) | <$1 | Minimal storage |
| **Total** | **~$50/month** | Very affordable for production |

---

## ✅ Verification Checklist

Before considering deployment complete:

- [ ] RDS status is **Available**
- [ ] CodeBuild status is **SUCCEEDED**
- [ ] ECR has `pulseops-backend:latest` image
- [ ] App Runner status is **RUNNING**
- [ ] App Runner environment variables are set
- [ ] Health check endpoint returns JSON
- [ ] Frontend loads in browser
- [ ] Frontend can fetch data from backend

---

## 🐛 Troubleshooting

### Issue: App Runner service won't start
**Solution:**
1. Check the service logs (App Runner dashboard → Logs)
2. Verify environment variables are correct (especially DB_HOST)
3. Ensure RDS database is in "Available" status
4. Check RDS security group allows port 5432 from App Runner

### Issue: Health check fails
**Solution:**
```powershell
# Test connectivity from your machine
curl https://<app-runner-url>/api/health

# If it times out:
# 1. Verify App Runner is RUNNING (not DEPLOYING)
# 2. Check that the port is 8000
# 3. Wait 2 minutes for App Runner to fully initialize
```

### Issue: Frontend can't connect to backend
**Solution:**
1. Open browser DevTools (F12)
2. Check Network tab for API requests
3. Verify CORS configuration in backend (`ALLOWED_ORIGINS` environment variable)
4. Verify `REACT_APP_API_URL` is set correctly in frontend .env

---

## 📝 Summary

You've successfully:
- ✅ Deployed **RDS PostgreSQL** database (5-10 min)
- ✅ Built **Docker images** in CodeBuild (5 min)
- ✅ Deployed **FastAPI backend** on App Runner (3 min)
- ✅ Connected **React frontend** to backend (3 min)

**Total setup time:** ~20-30 minutes

**Next steps:**
- Monitor performance in App Runner dashboard
- Set up CloudWatch alarms for errors
- Configure custom domain (optional)
- Set up CI/CD pipeline for automatic deployments

---

## 🔗 Important URLs

| Service | URL |
|---------|-----|
| RDS Console | https://console.aws.amazon.com/rds |
| ECR Console | https://console.aws.amazon.com/ecr |
| CodeBuild | https://console.aws.amazon.com/codebuild |
| App Runner | https://console.aws.amazon.com/apprunner |
| Your Frontend | https://pulseops-ui-202604.s3.amazonaws.com/index.html |
| Your Backend | https://<your-app-runner-url> |

---

**Ready?** Start with Step 1 now! 🚀
