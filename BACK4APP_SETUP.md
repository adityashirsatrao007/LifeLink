# Back4App Dashboard Setup Guide

## Critical Setup Required for LifeLink

### 1. Class-Level Permissions (CLP)

**⚠️ IMPORTANT**: You MUST configure these via Back4App Dashboard. The API blocks CLP changes even with Master Key.

#### Steps:
1. Login to [Back4App Dashboard](https://dashboard.back4app.com)
2. Select your app: **LifeLink**
3. Go to **Database** → **Browser**
4. For each class below, click the **⚙️ (Settings)** icon → **Security**

#### Required CLP for Each Class:

**BloodRequest:**
```
Public:
✅ Find
✅ Get
✅ Count
✅ Create
✅ Update  
✅ Delete
✅ Add Field

Authenticated Users: (all checkboxes can be on)
Specific Roles: (none needed)
```

**DonorResponse:**
```
Public:
✅ Find
✅ Get
✅ Count
✅ Create
✅ Update
✅ Delete
✅ Add Field
```

**DonorProfile:**
```
Public:
✅ Find
✅ Get
✅ Count
✅ Create
✅ Update
✅ Delete
✅ Add Field
```

**HospitalProfile:**
```
Public:
✅ Find
✅ Get
✅ Count
✅ Create
✅ Update
✅ Delete
✅ Add Field
```

### 2. Approve Hospitals

After setting CLP, approve hospitals via Dashboard:

1. Go to **Database** → **Browser** → **HospitalProfile**
2. For each hospital record:
   - Click the row to edit
   - Change `verificationStatus` to **"Approved"**
   - Set `approvedAt` to current date/time
   - Click **Save**

**Hospitals to approve:**
- apollo_mumbai
- lifebridge_pune  
- carewell_delhi
- (any others in database)

### 3. Deploy Cloud Code

1. Go to **Cloud Code** section
2. Click **Upload File**
3. Select `cloud/main.js` from your project
4. Click **Deploy**
5. Wait for deployment to complete (usually 1-2 minutes)

### 4. Verify Setup

Run the test script:
```bash
node scripts/test-blood-request.js
```

All tests should pass if:
- ✅ CLP is configured correctly
- ✅ Hospitals are approved
- ✅ Cloud code is deployed

### 5. Container Environment Variables

In Back4App Container dashboard, set these environment variables:

```
NEXT_PUBLIC_PARSE_APP_ID=JatLLoWEzO3UX0SqIgsojzf7COmzmPDJ9DrtEY6g
NEXT_PUBLIC_PARSE_JS_KEY=TpxQPT1ogHyaaY79TNujFEbC8XAQKVWBAxeBaLJI
NEXT_PUBLIC_PARSE_SERVER_URL=https://parseapi.back4app.com
NEXT_PUBLIC_APP_URL=<your-container-url>
```

---

## Why This is Needed

### The Permission Error Explained:

**Error**: `Permission denied for action addfield on class BloodRequest`

**Cause**: Parse Server has TWO levels of permissions:
1. **Class-Level Permissions (CLP)** - Controls who can perform operations on the class itself
2. **Object-Level ACLs** - Controls who can access specific objects

The error happens because:
- CLP was blocking the ability to add fields to BloodRequest objects
- Even though our cloud code sets ACLs (object-level), it can't bypass CLP restrictions
- CLP must be set via Back4App Dashboard (API blocks it for security)

### Security Model:

```
Request → CLP Check → Cloud Code beforeSave → ACL Set → Object Saved
                ❌ Failed here!
```

After CLP fix:
```
Request → CLP ✅ → Cloud Code beforeSave → ACL Set ✅ → Object Saved ✅
```

---

## Alternative: Use Master Key (NOT RECOMMENDED)

If you can't access the dashboard, you can modify `requestStore.ts` to use master key for saves, but this is **not secure for production**:

```typescript
// ONLY FOR TESTING - NOT PRODUCTION!
await request.save(null, { useMasterKey: true });
```

This bypasses all security, which is dangerous for a live app.

---

## Troubleshooting

### Test fails: "Hospital is not approved"
→ Go to HospitalProfile in dashboard and set verificationStatus to "Approved"

### Test fails: "Permission denied"  
→ Check CLP settings for all classes as shown above

### Test fails: "Invalid function"
→ Deploy cloud code via Cloud Code section in dashboard

### Container shows white screen
→ Check environment variables are set in Container settings
