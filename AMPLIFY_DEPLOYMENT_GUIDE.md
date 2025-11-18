# AWS Amplify Deployment Guide - 10 Minutes

## Step 1: Open AWS Amplify Console
- Go to: https://console.aws.amazon.com/amplify/apps
- Sign in with your AWS account

## Step 2: Create New App
1. Click **"Create app"** or **"New app"**
2. Choose **"Host web app"**
3. Select **GitHub** as the source
4. Click **"Authorize GitHub"** (if prompted)

## Step 3: Connect Repository
1. Find your repository: `simisgithome/SuperOps-hackathon`
2. Select it
3. Click **"Connect"**

## Step 4: Select Branch
- Branch: **`branch1`**
- Click **"Next"**

## Step 5: Build Settings (Auto-detected)
Amplify will auto-detect React app. Confirm these settings:
```
Framework: React
Build command: npm run build
Output directory: build
Env variable: (leave empty for now)
```
Click **"Next"**

## Step 6: Review & Deploy
- Review all settings
- Click **"Save and deploy"**
- **WAIT 5-10 MINUTES** for build & deployment

## Step 7: Get Your Live URL
Once deployment completes, you'll see:
```
Live URL: https://branch1.xxxxxxxxxxxxx.amplifyapp.com
```

This URL will show your REAL app with backend connectivity!

## What Amplify Does
✅ Builds React frontend  
✅ Creates CloudFront CDN  
✅ Enables custom domain (optional)  
✅ Auto-rebuilds on GitHub push  
✅ Provides SSL certificate  

## Estimated Cost
- Free tier: Up to 5GB storage, 15GB bandwidth/month
- Your app: ~$0-5/month for low traffic

---

## IMPORTANT CONFIGURATION AFTER DEPLOYMENT

Once Amplify shows your app is live:

1. **Add Backend Environment Variables**
   - In Amplify console
   - Click **"Environment variables"**
   - Add these variables:
   ```
   REACT_APP_API_URL = http://localhost:8000
   REACT_APP_API_BACKEND = http://localhost:8000
   ```
   (Or use actual backend URL once deployed)

2. **For Production, You Still Need**:
   - Backend API running somewhere (App Runner, EC2, or Lambda)
   - RDS PostgreSQL database
   - Environment variables pointing to real backend

---

## Next Steps After Amplify Deployment

1. Get backend running (Option A or C)
2. Update REACT_APP_API_URL to point to backend
3. Redeploy from Amplify
4. Test full application

