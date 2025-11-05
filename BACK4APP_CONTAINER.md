# Back4App Container Deployment Guide

## ✅ Dockerfile Created!

Your repository is now ready to deploy on Back4App Container.

## Files Created

1. **`Dockerfile`** - Multi-stage build for optimized Next.js container
2. **`.dockerignore`** - Excludes unnecessary files from Docker build
3. **`next.config.mjs`** - Updated with `output: 'standalone'` for Docker

## Environment Variables for Back4App

Add these environment variables in Back4App Container settings:

```
NEXT_PUBLIC_PARSE_APP_ID=JatLLoWEzO3UX0SqIgsojzf7COmzmPDJ9DrtEY6g
NEXT_PUBLIC_PARSE_JS_KEY=TpxQPT1ogHyaaY79TNujFEbC8XAQKVWBAxeBaLJI
NEXT_PUBLIC_PARSE_SERVER_URL=https://parseapi.back4app.com
NEXT_PUBLIC_APP_URL=https://your-back4app-url.app
```

## Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Dockerfile for Back4App Container deployment"
   git push origin main
   ```

2. **In Back4App Dashboard:**
   - Go to your Container App
   - Click "Select Actions"
   - Choose "Deploy from GitHub"
   - Select your repository
   - Add environment variables
   - Click "Deploy"

3. **Wait for Build** (~3-5 minutes)
   - Back4App will build your Docker container
   - Deploy to their infrastructure
   - Provide you with a URL

4. **Update Environment Variable**
   - After deployment, update `NEXT_PUBLIC_APP_URL` with your actual Back4App URL
   - Redeploy if needed

5. **Update CORS on Parse Server**
   - Go to Back4App → Your Parse App → Server Settings
   - Add your container URL to Allowed Client Origins

## Container Specifications

- **Base Image**: Node.js 18 Alpine (minimal size)
- **Build Type**: Multi-stage (optimized for production)
- **Exposed Port**: 3000
- **Runtime**: Standalone Next.js server
- **User**: Non-root (nextjs user for security)

## Container Size

- **Base layers**: ~50 MB
- **Node modules**: ~100-150 MB
- **Next.js build**: ~20-30 MB
- **Total**: ~200-250 MB (optimized)

## Testing Locally with Docker

Before deploying, you can test locally:

```bash
# Build the image
docker build -t lifelink .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_PARSE_APP_ID=JatLLoWEzO3UX0SqIgsojzf7COmzmPDJ9DrtEY6g \
  -e NEXT_PUBLIC_PARSE_JS_KEY=TpxQPT1ogHyaaY79TNujFEbC8XAQKVWBAxeBaLJI \
  -e NEXT_PUBLIC_PARSE_SERVER_URL=https://parseapi.back4app.com \
  -e NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  lifelink

# Test at http://localhost:3000
```

## Troubleshooting

**Build fails?**
- Check Dockerfile syntax
- Ensure package.json is valid
- Check Back4App build logs

**Container crashes?**
- Verify environment variables are set
- Check container logs in Back4App
- Ensure port 3000 is exposed

**CORS errors?**
- Add container URL to Parse Server CORS settings
- Include both http and https versions

**Cannot connect to Parse?**
- Verify PARSE_SERVER_URL is correct
- Check that Parse app is running on Back4App
- Verify APP_ID and JS_KEY are correct

## Performance Tips

1. **CDN**: Back4App containers come with CDN enabled
2. **Caching**: Static assets are automatically cached
3. **Scaling**: Can scale up containers in Back4App dashboard
4. **Health Checks**: Container automatically monitored

## Cost Estimate

**Back4App Container Pricing:**
- Free Tier: Limited resources (good for testing)
- Basic: $5-10/month (1 container)
- Pro: $25+/month (multiple containers, auto-scaling)

## What's Different from Vercel?

| Feature | Vercel | Back4App Container |
|---------|--------|-------------------|
| Deployment | Git push | Git push |
| Build | Automatic | Docker build |
| Scaling | Automatic | Manual/Auto |
| CDN | Global | Global |
| Price | $0-20/mo | $5-25/mo |
| Setup | Easier | More control |

## Security Notes

✅ Container runs as non-root user (nextjs)
✅ Environment variables injected at runtime
✅ Multi-stage build (smaller attack surface)
✅ Alpine Linux (minimal, secure base)
✅ No sensitive data in image layers

---

**Status**: ✅ Ready to deploy!
**Container**: Optimized for production
**Size**: ~200-250 MB
**Build Time**: 3-5 minutes
