# ⚠️ CRITICAL ISSUE: Permission Denied for BloodRequest Creation

## Root Cause
Parse Server has **Class-Level Permissions (CLP)** that control who can perform operations on classes. By default, Parse restricts the `addField` operation, which causes the error:

```
Permission denied for action addfield on class BloodRequest
```

## The Problem
- CLP is separate from object-level ACLs
- CLP is enforced BEFORE cloud code runs
- Back4App blocks CLP changes via REST API (even with Master Key)
- **CLP MUST be set via the Back4App Dashboard**

## THE SOLUTION ✅

### Required Steps (MUST BE DONE):

1. **Login to Back4App Dashboard**
   - Go to: https://dashboard.back4app.com
   - Select your LifeLink app

2. **Configure Class-Level Permissions**
   - Go to: **Database** → **Browser**
   - For **BloodRequest** class:
     - Click ⚙️ (Settings icon) → **Security**
     - Under "Public":
       - ✅ Check ALL boxes (Find, Get, Count, Create, Update, Delete, **Add Field**)
     - Click **Save**
   
   - Repeat for these classes:
     - **DonorResponse**
     - **DonorProfile** 
     - **HospitalProfile**

3. **Approve Hospitals**
   - Go to: **Database** → **Browser** → **HospitalProfile**
   - Click on `apollo_mumbai` hospital row
   - Change `verificationStatus` to: `"Approved"`
   - Set `approvedAt` to current date
   - Click **Save**
   - Repeat for any other hospitals

4. **Deploy Cloud Code**
   - Go to: **Cloud Code** section
   - Upload: `cloud/main.js`
   - Click **Deploy**

### Verify It Works

After completing the above steps, run:

```bash
node scripts/test-blood-request.js
```

All tests should pass! ✅

## Why This Happens

```
User Creates Request
    ↓
Parse Server Checks CLP
    ↓
❌ BLOCKED if AddField permission is not enabled
    ↓
Cloud Code beforeSave hook (never reaches here if CLP blocks)
    ↓
ACL is set
    ↓
Object is saved
```

## What We've Fixed

### 1. Cloud Code (`cloud/main.js`)
- ✅ Enhanced `beforeSave(BloodRequest)` hook
- ✅ Validates hospital is approved
- ✅ Sets proper ACLs (public read, hospital write)
- ✅ Validates user ownership

### 2. Test Scripts
- ✅ `scripts/test-blood-request.js` - Comprehensive test suite
- ✅ `scripts/setup-database.js` - Attempts CLP setup (blocked by Back4App)
- ✅ `scripts/approve-all-hospitals.js` - Approve hospitals (needs master key permissions)

### 3. Documentation
- ✅ `BACK4APP_SETUP.md` - Complete setup guide
- ✅ `FIX_PERMISSIONS.md` - This file

## Alternative (NOT RECOMMENDED)

If you absolutely cannot access the dashboard, you can temporarily modify `stores/requestStore.ts`:

```typescript
// DEVELOPMENT ONLY - NEVER USE IN PRODUCTION!
await request.save(null, { 
  useMasterKey: true,
  sessionToken: Parse.User.current()?.getSessionToken() 
});
```

**WARNING**: This bypasses all security! Only for local testing.

## Testing Checklist

After dashboard changes:

- [ ] Set CLP for BloodRequest (all public permissions enabled)
- [ ] Set CLP for DonorResponse
- [ ] Set CLP for DonorProfile
- [ ] Set CLP for HospitalProfile
- [ ] Approve apollo_mumbai hospital
- [ ] Deploy cloud/main.js
- [ ] Run `node scripts/test-blood-request.js`
- [ ] Test via UI: Login → Create Request
- [ ] Verify donors can see requests
- [ ] Verify donors can respond
- [ ] Verify hospitals can view responses

## Need Help?

Check the Parse Dashboard documentation:
https://www.back4app.com/docs/platform/parse-dashboard

Or Back4App support:
https://www.back4app.com/help
