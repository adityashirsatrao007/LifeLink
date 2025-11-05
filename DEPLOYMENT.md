# LifeLink Deployment Guide - Vercel

## Prerequisites
- GitHub account
- Vercel account (free tier available)
- Back4App account with Parse Server app already configured

## Deployment Steps

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository (LifeLink)
4. Vercel will auto-detect Next.js configuration

### 3. Configure Environment Variables

In Vercel project settings, add these environment variables:

**Required Variables:**
- `NEXT_PUBLIC_PARSE_APP_ID` = `JatLLoWEzO3UX0SqIgsojzf7COmzmPDJ9DrtEY6g`
- `NEXT_PUBLIC_PARSE_JS_KEY` = `TpxQPT1ogHyaaY79TNujFEbC8XAQKVWBAxeBaLJI`
- `NEXT_PUBLIC_PARSE_SERVER_URL` = `https://parseapi.back4app.com`
- `NEXT_PUBLIC_APP_URL` = `https://your-app-name.vercel.app` (update with your actual Vercel URL)

**Optional Variables (for admin scripts only, not needed for deployment):**
- `PARSE_MASTER_KEY` = Your master key (only if running admin scripts)
- `BACK4APP_ACCOUNT_KEY` = Your Back4App account key (only for cloud code deployment)

### 4. Deploy

1. Click "Deploy"
2. Wait for build to complete (usually 2-3 minutes)
3. Vercel will provide you with a production URL

### 5. Update Back4App CORS Settings

1. Go to Back4App Dashboard → Your App → Server Settings → Advanced Settings
2. Update **Allowed Client Origins** to include:
   - `https://your-app-name.vercel.app`
   - `https://*.vercel.app` (for preview deployments)

### 6. Test Your Deployment

1. Visit your Vercel URL
2. Test login with existing credentials:
   - **Admin**: `admin` / `admin123`
   - **Hospital**: `apollo_mumbai` / `hospital123`
   - **Donor**: `rahul_sharma` / `password123`

## Post-Deployment

### Custom Domain (Optional)
1. Go to Vercel Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable

### Monitoring
- Vercel Dashboard provides real-time logs and analytics
- Monitor Parse Dashboard on Back4App for database activity

### Automatic Deployments
- Every push to `main` branch triggers a new deployment
- Pull requests create preview deployments automatically

## Troubleshooting

### Build Errors
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify TypeScript types are correct

### Runtime Errors
- Check Vercel Function logs
- Verify environment variables are set correctly
- Check Parse Dashboard for database connectivity

### CORS Errors
- Ensure Vercel URL is added to Back4App CORS settings
- Check browser console for specific CORS error messages

## Architecture Notes

- **Frontend**: Next.js 14 (App Router) hosted on Vercel
- **Backend**: Parse Server on Back4App
- **Database**: MongoDB (managed by Back4App)
- **Cloud Functions**: Hosted on Back4App Parse Server
- **Static Assets**: Served via Vercel CDN

## Security Checklist

✅ Environment variables are configured in Vercel (not in code)
✅ `.env.local` is in `.gitignore`
✅ Master Key is never exposed to client
✅ CORS is properly configured on Back4App
✅ User authentication is required for sensitive operations
✅ ACLs are set correctly on Parse objects

## Performance Optimization

- Next.js automatically optimizes images
- Static pages are cached by Vercel CDN
- Parse queries use proper indexes (configured in Back4App)
- Client-side caching with Zustand stores

## Cost Estimation

**Free Tier Limits:**
- Vercel: 100GB bandwidth, unlimited requests
- Back4App: 25k requests/month, 1GB database

**Recommended for Production:**
- Vercel Pro: $20/month
- Back4App Parse Server: Starting at $5/month

## Support

For issues:
1. Check Vercel deployment logs
2. Check Back4App Parse Dashboard
3. Review browser console errors
4. Contact support: Vercel or Back4App

---

**Deployment Status**: ✅ Ready for Vercel
**Last Updated**: November 5, 2025
