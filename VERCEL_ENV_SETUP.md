# Vercel Environment Variables Setup Guide

## Copy these into Vercel Dashboard

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Click "Add New" for each variable below:

---

### Variable 1
- **Key/Name**: `NEXT_PUBLIC_PARSE_APP_ID`
- **Value**: `JatLLoWEzO3UX0SqIgsojzf7COmzmPDJ9DrtEY6g`
- **Environments**: Production, Preview, Development

---

### Variable 2
- **Key/Name**: `NEXT_PUBLIC_PARSE_JS_KEY`
- **Value**: `TpxQPT1ogHyaaY79TNujFEbC8XAQKVWBAxeBaLJI`
- **Environments**: Production, Preview, Development

---

### Variable 3
- **Key/Name**: `NEXT_PUBLIC_PARSE_SERVER_URL`
- **Value**: `https://parseapi.back4app.com`
- **Environments**: Production, Preview, Development

---

### Variable 4
- **Key/Name**: `NEXT_PUBLIC_APP_URL`
- **Value**: `https://your-app-name.vercel.app`
- **Environments**: Production, Preview, Development
- **Note**: Update this after your first deployment with the actual Vercel URL

---

## Step-by-Step Instructions

1. Open your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the left sidebar
4. For each variable above:
   - Click "Add New"
   - Copy the Key/Name into the "Key" field
   - Copy the Value into the "Value" field
   - Select all three checkboxes: Production, Preview, Development
   - Click "Save"
5. After adding all 4 variables, redeploy your app

## After First Deployment

1. Copy your Vercel deployment URL (e.g., `https://lifelink-abc123.vercel.app`)
2. Go back to Environment Variables
3. Edit `NEXT_PUBLIC_APP_URL` and replace with your actual URL
4. Save and redeploy if needed

## Important Notes

- ⚠️ Do NOT commit `.env.local` to git (it's already in .gitignore)
- ✅ Vercel reads environment variables from the dashboard, not from files
- ✅ These variables are injected at build time (NEXT_PUBLIC_* prefix)
- ✅ You can also add them during the initial import process
