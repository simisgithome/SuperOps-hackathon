# Quick Backend Deployment - Using AWS Lambda (No Docker)

This approach deploys FastAPI backend to AWS Lambda without needing Docker.

## Why This Works
- Lambda = Serverless (no server to manage)
- Can deploy Python code directly
- Auto-scales with traffic
- Pay only when used (~$1-5/month for development)

## Step-by-Step (15 minutes)

### 1. Create Lambda Function

```powershell
$AWS_CLI = "C:\Program Files\Amazon\AWSCLIV2\aws.exe"

# Create function
& $AWS_CLI lambda create-function `
  --function-name pulseops-api `
  --runtime python3.11 `
  --role arn:aws:iam::285168796475:role/lambda-execution-role `
  --handler main.handler `
  --region us-east-2
```

### 2. Package Backend Code

```bash
cd services/api
pip install -r requirements.txt -t ./package
cd package
# Add lambda handler wrapper
```

### 3. Create Lambda Handler

Add this to `services/api/main.py`:

```python
from fastapi import FastAPI
from mangum import Mangum  # Adapter for Lambda

app = FastAPI()

# Your existing routes here...

# Lambda handler
handler = Mangum(app)
```

### 4. Deploy to Lambda

```powershell
cd services/api
zip -r function.zip .
aws lambda update-function-code `
  --function-name pulseops-api `
  --zip-file fileb://function.zip
```

### 5. Create API Gateway

Connect Lambda to API Gateway for HTTPS endpoint:
- AWS Console → API Gateway
- Create REST API
- Add Lambda integration
- Deploy stage

## Pros & Cons

**Pros:**
- No Docker needed
- Very fast to deploy
- Cheap for low traffic
- Auto-scales

**Cons:**
- Cold start (first request takes 3-5s)
- Limited to Lambda constraints
- Not ideal for heavy ML workloads

## Cost Estimation
- 1M requests/month: ~$0.20
- 100GB storage: ~$0.02/month
- RDS database: ~$30/month
- **Total: ~$30-50/month**

