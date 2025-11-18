# Health Score Testing Guide

## 🎯 Overview

This guide provides specific test values to generate health scores in each range. All tests have been validated against the ML-based health score calculator.

---

## ✅ Validated Test Scenarios

### 🔴 AT RISK (<50 points)

**Characteristics:** Very low utilization (<25%) OR very low spending (<$400/month)

| Test # | Total Licenses | Total Users | Monthly Spend | Utilization | Expected Score | Status |
|--------|----------------|-------------|---------------|-------------|----------------|--------|
| 1      | 100            | 5           | $100          | 5%          | 41.3           | ✅ At Risk |
| 2      | 200            | 10          | $200          | 5%          | 41.3           | ✅ At Risk |
| 3      | 50             | 10          | $100          | 20%         | 44.3           | ✅ At Risk |
| 4      | 100            | 15          | $300          | 15%         | 43.3           | ✅ At Risk |

**UI Testing Steps:**
1. Edit any client
2. Set values from table above (e.g., 100 licenses, 5 users, $100 spend)
3. Clear health score field (leave empty)
4. Save
5. Observe: Score should be ~41-44 (At Risk)

---

### 🟡 FAIR (50-69 points)

**Characteristics:** Moderate utilization (45-60%) with moderate spending ($600-1000/month)

| Test # | Total Licenses | Total Users | Monthly Spend | Utilization | Expected Score | Status |
|--------|----------------|-------------|---------------|-------------|----------------|--------|
| 1      | 100            | 45          | $600          | 45%         | 60.5           | ✅ Fair |
| 2      | 50             | 25          | $800          | 50%         | 61.5           | ✅ Fair |
| 3      | 80             | 45          | $1000         | 56%         | 68.4           | ✅ Fair |

**UI Testing Steps:**
1. Edit any client
2. Set values from table above (e.g., 100 licenses, 45 users, $600 spend)
3. Clear health score field
4. Save
5. Observe: Score should be ~60-68 (Fair)

---

### 🔵 GOOD (70-84 points)

**Characteristics:** Good utilization (70-75%) with good spending ($1200-1600/month)

| Test # | Total Licenses | Total Users | Monthly Spend | Utilization | Expected Score | Status |
|--------|----------------|-------------|---------------|-------------|----------------|--------|
| 1      | 100            | 75          | $1500         | 75%         | 83.0           | ✅ Good |
| 2      | 50             | 35          | $1200         | 70%         | 83.0           | ✅ Good |
| 3      | 80             | 60          | $1600         | 75%         | 83.0           | ✅ Good |

**UI Testing Steps:**
1. Edit any client
2. Set values from table above (e.g., 100 licenses, 75 users, $1500 spend)
3. Clear health score field
4. Save
5. Observe: Score should be ~83 (Good)

---

### 🟢 EXCELLENT (85-100 points)

**Characteristics:** Optimal utilization (80%+) with high spending ($2500+/month)

| Test # | Total Licenses | Total Users | Monthly Spend | Utilization | Expected Score | Status |
|--------|----------------|-------------|---------------|-------------|----------------|--------|
| 1      | 100            | 80          | $3000         | 80%         | 93.3           | ✅ Excellent |
| 2      | 50             | 40          | $2500         | 80%         | 93.3           | ✅ Excellent |
| 3      | 80             | 65          | $2800         | 81%         | 93.3           | ✅ Excellent |

**UI Testing Steps:**
1. Edit any client
2. Set values from table above (e.g., 100 licenses, 80 users, $3000 spend)
3. Clear health score field
4. Save
5. Observe: Score should be ~93 (Excellent)

---

## 🔬 How the Scoring Works

### Combined Health Indicator

The system calculates a **combined health indicator** based on:
- **Utilization (60% weight)**: `users / licenses * 100`
- **Spending (40% weight)**: Normalized against $2000/month baseline

### Default Metric Adjustment

Based on the combined indicator, the system assigns defaults for unmeasured metrics:

| Combined Indicator | Range | Default Metrics Profile |
|-------------------|-------|------------------------|
| <40               | At Risk | Poor payment history (65%), high support tickets (6/mo), low satisfaction (55%), poor communication (120 days) |
| 40-55             | At Risk/Fair | Below average metrics (75% payments, 4 tickets/mo, 65% satisfaction, 75 days) |
| 55-70             | Fair | Average metrics (80% payments, 3 tickets/mo, 72% satisfaction, 50 days) |
| 70-85             | Good | Above average metrics (85% payments, 3 tickets/mo, 78% satisfaction, 30 days) |
| 85+               | Excellent | Excellent metrics (95% payments, 1 ticket/mo, 90% satisfaction, 14 days) |

### Factor Weights

The ML model uses these weights:
- **Payment History:** 25%
- **Support Engagement:** 20%
- **License Utilization:** 20%
- **Contract Stability:** 15%
- **Feature Adoption:** 10%
- **Communication Frequency:** 10%

---

## 🧪 Quick Test Commands

### Run Validation Script

```powershell
cd D:\Superops_hackathon\PulseOPs_Final\SuperOps-hackathon\services\api
python test_health_ranges.py
```

### Manual Test in Python

```python
from routers.clients import calculate_health_score_ml

# Test At Risk
test_data = {
    'total_licenses': 100,
    'total_users': 5,
    'monthly_spend': 100,
    'contract_value': None
}
score = calculate_health_score_ml(test_data)
print(f"At Risk Score: {score}")  # Should be ~41.3

# Test Excellent
test_data = {
    'total_licenses': 100,
    'total_users': 80,
    'monthly_spend': 3000,
    'contract_value': None
}
score = calculate_health_score_ml(test_data)
print(f"Excellent Score: {score}")  # Should be ~93.3
```

---

## 📊 Score Range Summary

| Score Range | Status | Color | Characteristics |
|------------|--------|-------|----------------|
| 0-49 | At Risk | 🔴 Red | <25% utilization OR <$400/month spend |
| 50-69 | Fair | 🟡 Yellow | 45-60% utilization, $600-1000/month |
| 70-84 | Good | 🔵 Blue | 70-75% utilization, $1200-1600/month |
| 85-100 | Excellent | 🟢 Green | 80%+ utilization, $2500+/month |

---

## 🎯 Key Testing Tips

1. **Always clear the health score field** before testing auto-calculation
2. **Only change 3 fields**: total_licenses, total_users, monthly_spend
3. **Check the browser console** for calculation logs
4. **Success message** should show the calculated score
5. **Backend logs** show "🔄 Key fields changed - will auto-recalculate health score"

---

## 🐛 Troubleshooting

### Score Not Updating
- Check if health score field is empty (not manually set)
- Verify one of the 3 key fields changed
- Check browser console for errors
- Verify backend is running (port 8000)

### Unexpected Score
- Verify exact values entered (especially decimals)
- Check if contract_value is set (affects scoring)
- Run test_health_ranges.py to validate calculation logic
- Check backend logs for "ML Calculated health score: X"

### Manual Override Not Working
- Enter health score value before saving
- Check that value is between 0-100
- Verify "Manual value set" helper text appears

---

## ✅ Validation Checklist

Test each scenario:
- [ ] At Risk: 100 licenses, 5 users, $100 → Score ~41
- [ ] Fair: 100 licenses, 45 users, $600 → Score ~61
- [ ] Good: 100 licenses, 75 users, $1500 → Score ~83
- [ ] Excellent: 100 licenses, 80 users, $3000 → Score ~93
- [ ] Manual Override: Enter 50 manually → Saves as 50
- [ ] Auto-Recalc: Change users → Score recalculates
- [ ] Multiple Updates: Edit same client repeatedly → Works each time

---

## 📝 Notes

- All scores validated on November 18, 2025
- ML model: `HealthScoreCalculator` with 6-factor weighted system
- Backend: FastAPI with SQLAlchemy
- Frontend: React with Material-UI
- Auto-recalculation triggers: licenses, users, monthly_spend changes
