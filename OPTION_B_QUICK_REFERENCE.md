# 🚀 Option B - App Runner Deployment Quick Reference

## Your Choice: App Runner (Option B) ✅

**Status:** Ready to deploy  
**Time:** 20-30 minutes  
**Cost:** ~$50/month  
**Difficulty:** Easy (point & click in AWS Console)

---

## 📖 Which Guide to Follow?

```
┌─────────────────────────────────────────────────────────┐
│ I want STEP-BY-STEP instructions with SCREENSHOTS      │
│ → Use: APP_RUNNER_VISUAL_GUIDE.md                       │
│ (Recommended for beginners)                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ I want DETAILED reference with all options              │
│ → Use: APP_RUNNER_COMPLETE_GUIDE.md                     │
│ (Complete reference)                                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ I want to understand the STATUS                         │
│ → Use: DEPLOYMENT_OPTION_B_STATUS.md                    │
│ (Current state summary)                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 6 Simple Steps

### 1️⃣ Create Database (5 min)
```
AWS Console → RDS → Create Database
PostgreSQL 15.4, db.t3.micro, publicly accessible
Name: pulseops-db
User: pulseops / Password: PulseOps2025!Admin
```

### 2️⃣ Build Docker (5 min)
```
AWS Console → CodeBuild → Start Build
Project: pulseops-build
Wait for status: SUCCEEDED
Check: Images in ECR
```

### 3️⃣ Deploy Backend (3 min)
```
AWS Console → App Runner → Create Service
Image: pulseops-backend:latest
Port: 8000, CPU: 0.25, Memory: 512 MB
Click: Create & Deploy
```

### 4️⃣ Configure Database (2 min)
```
App Runner → Configuration → Environment Variables
Add: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
Add: ALLOWED_ORIGINS
Save → Service restarts
```

### 5️⃣ Test Backend (2 min)
```
Browser: https://<app-runner-url>/api/health
Expected: {"status": "healthy", "database": "connected"}
```

### 6️⃣ Update Frontend (3 min)
```
Edit: services/ui/.env
Set: REACT_APP_API_URL=<app-runner-url>
Run: npm run build
Upload: aws s3 sync build/ s3://pulseops-ui-202604
```

**Total: 20-30 minutes**

---

## 🔐 Credentials You'll Need

```
AWS Account ID: 285168796475
AWS Region: us-east-2

RDS Database
├── Instance: pulseops-db
├── User: pulseops
├── Password: PulseOps2025!Admin
└── Database: pulseops

App Runner Service
├── Name: pulseops-backend-service
├── Port: 8000
├── CPU: 0.25 vCPU
└── Memory: 512 MB
```

---

## 🎯 Key URLs

| What | URL |
|------|-----|
| RDS Console | https://console.aws.amazon.com/rds |
| ECR Console | https://console.aws.amazon.com/ecr |
| CodeBuild | https://console.aws.amazon.com/codebuild |
| App Runner | https://console.aws.amazon.com/apprunner |
| Frontend (After deploy) | https://pulseops-ui-202604.s3.amazonaws.com/index.html |
| Backend Health (After deploy) | https://<app-runner-url>/api/health |

---

## ✅ Success Indicators

After deployment, you should see:

- [ ] RDS status: **Available**
- [ ] CodeBuild: **SUCCEEDED**
- [ ] App Runner: **RUNNING**
- [ ] Health endpoint returns: `{"status": "healthy"}`
- [ ] Frontend loads: Shows dashboard, data appears
- [ ] Active Licenses: Color-coded (red/yellow/green)

---

## 💡 Why No Docker Desktop?

Your Docker Desktop isn't working, but that's **OK**:

- ❌ Can't build Docker images locally
- ✅ AWS CodeBuild builds them in the cloud
- ✅ AWS App Runner hosts the container
- ✅ No Docker Desktop needed!

**Architecture:**
```
You → GitHub (code) → CodeBuild (builds) → ECR (stores) → App Runner (runs)
```

---

## 🆘 If Something Goes Wrong

| Problem | Check |
|---------|-------|
| CodeBuild fails | CloudWatch logs in CodeBuild console |
| App Runner won't start | App Runner logs + environment variables |
| Frontend blank | Browser dev tools (F12) → Network tab → API calls |
| Can't connect to DB | RDS endpoint in App Runner env vars |
| CORS errors | ALLOWED_ORIGINS environment variable |

See detailed troubleshooting in: `APP_RUNNER_VISUAL_GUIDE.md`

---

## 📊 Cost Estimate

| Service | Cost | Notes |
|---------|------|-------|
| App Runner | $20/mo | 0.25 vCPU on-demand |
| RDS | $30/mo | db.t3.micro, eligible for free tier |
| CodeBuild | ~$0 | 1,000 min/month free |
| S3 | <$1 | Frontend hosting |
| **Total** | **~$50/mo** | Scales with usage |

---

## 🗺️ Architecture Diagram

```
┌─────────────────────────────────┐
│  Your Browser                   │
├─────────────────────────────────┤
│  Frontend React App             │
│  (S3: pulseops-ui-202604)       │
├─────────────────────────────────┤
│ HTTPS/JSON API Calls             │
└──────────────┬──────────────────┘
               │
        ┌──────▼────────┐
        │ App Runner    │
        │ Port 8000     │
        │ FastAPI       │
        ├───────────────┤
        │ pulseops-     │
        │ backend       │
        └──────┬────────┘
               │
        ┌──────▼────────┐
        │ RDS Database  │
        │ Port 5432     │
        │ PostgreSQL    │
        └───────────────┘
```

---

## 📋 Checklist Before Starting

- [ ] AWS Console access (logged in)
- [ ] Read at least one deployment guide
- [ ] Have 20-30 minutes available
- [ ] Know your AWS account ID: 285168796475
- [ ] Remember RDS password: PulseOps2025!Admin
- [ ] App Runner URL saved (you'll need it)

---

## 🎬 Ready?

**Start here:** Open `APP_RUNNER_VISUAL_GUIDE.md` and follow Step 1

**Or read first:** Open `DEPLOYMENT_OPTION_B_STATUS.md` for more context

**Questions?** Check `APP_RUNNER_COMPLETE_GUIDE.md` for detailed info

---

**Status: ✅ Ready to Deploy**  
**Approach: AWS App Runner (Recommended)**  
**Timeline: 20-30 minutes**  
**Difficulty: Easy**

Let's go! 🚀
