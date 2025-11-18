# Health Score Update - Testing Guide

## ✅ Fixed Behavior

### When Opening Edit Dialog:
- ✅ Shows existing health score (e.g., "85.3")
- ✅ Helper text: "🔄 Current score. Changes to licenses/users/spend will trigger recalculation"

### When Changing Key Fields (licenses/users/spend):
- ✅ Health score field automatically clears (becomes empty)
- ✅ Helper text: "🤖 Will auto-calculate using ML model when you save"
- ✅ Can continue editing other fields

### When Saving:
- ✅ Backend calculates new health score using ML model
- ✅ Returns updated health score to frontend
- ✅ UI updates the health score field with new value
- ✅ Dialog stays open showing the new score
- ✅ Success message shows: "Client updated successfully! Health Score: 72.5"
- ✅ Client list also updates with new score

### When Manually Entering Health Score:
- ✅ User can type any value (0-100)
- ✅ Helper text: "✏️ Manual value - will override auto-calculation"
- ✅ That exact value is saved (no ML calculation)

---

## 🧪 Test Scenarios

### Test 1: Basic Recalculation
1. Open any client for editing
2. Note current health score (e.g., 85)
3. Change Total Licenses from 100 to 50
4. Health score field should clear automatically
5. Click Save
6. New health score appears in the field (e.g., 72.5)
7. Success message shows the new score
8. Close dialog and verify score in list

### Test 2: Multiple Changes
1. Open client
2. Change Total Licenses: 100 → 200
3. Health score clears
4. Change Total Users: 50 → 150
5. Health score stays empty
6. Change Monthly Spend: 1000 → 3000
7. Health score stays empty
8. Save
9. New health score calculated and displayed

### Test 3: Manual Override
1. Open client
2. Change Total Licenses to 100
3. Health score clears
4. Manually type "95" in health score field
5. Helper text shows "✏️ Manual value"
6. Save
7. Health score saved as exactly 95 (not calculated)

### Test 4: Cancel and Re-edit
1. Open client
2. Change licenses (health score clears)
3. Click Cancel
4. Open same client again
5. Health score shows original value (not cleared)
6. Can edit again

### Test 5: See Updated Score Without Closing
1. Open client
2. Change values (licenses: 100, users: 5, spend: 100)
3. Health score clears
4. Save
5. Health score field updates to show ~41 (At Risk)
6. Dialog stays open
7. Can see new score immediately
8. Can continue editing if needed

---

## 🎯 Expected Results

| Action | Health Score Field | Helper Text |
|--------|-------------------|-------------|
| Open dialog | Shows current score (e.g., 85) | "🔄 Current score..." |
| Change licenses | Clears to empty | "🤖 Will auto-calculate..." |
| Change users | Clears to empty | "🤖 Will auto-calculate..." |
| Change spend | Clears to empty | "🤖 Will auto-calculate..." |
| Type manual value | Shows typed value | "✏️ Manual value..." |
| Save (auto) | Shows new ML score | "🔄 Current score..." |
| Save (manual) | Shows manual value | "🔄 Current score..." |

---

## 🔍 Backend Logs to Watch

When you save, look for these logs in the backend terminal:

```
=== UPDATE CLIENT 27 ===
Update data received: {...}
Health score in update: None
🔄 Key fields changed - will auto-recalculate health score
Client dict for calculation: {'total_licenses': 100, 'total_users': 5, 'monthly_spend': 100.0, 'contract_value': None}
✓ ML Calculated health score: 41.3
Final health score saved: 41.3
```

---

## ✅ Success Criteria

- [x] Opening dialog shows existing health score
- [x] Changing licenses/users/spend clears health score
- [x] Saving triggers ML calculation
- [x] New health score appears in UI immediately
- [x] Dialog stays open to show new score
- [x] Client list updates with new score
- [x] Can edit multiple times in a row
- [x] Manual override works
- [x] Success message shows calculated score

---

## 🚀 Key Improvements

1. **No longer closes dialog after save** - You can see the updated score immediately
2. **Health score updates in real-time** - Field populates with new ML-calculated value
3. **Clear visual feedback** - Helper text changes based on state
4. **Continuous editing** - Can save multiple times without reopening dialog
5. **Both UI and backend update** - Consistent state everywhere

