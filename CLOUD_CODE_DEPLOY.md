# Deploy Cloud Code to Back4App

## Method 1: Dashboard Upload (Recommended)
1. Login to Back4App Dashboard: https://dashboard.back4app.com
2. Select your Parse Server app
3. Go to "Cloud Code" section
4. Click "Upload" or "Files"
5. Upload `cloud/main.js`
6. Click "Deploy"

## Method 2: Using Back4App CLI
```bash
# Install Back4App CLI (if not installed)
npm install -g back4app-cli

# Login
b4a login

# Navigate to project
cd Z:\LifeLink

# Deploy cloud code
b4a deploy
```

## Method 3: Git Integration
1. Go to Back4App Dashboard → Your App → Cloud Code
2. Connect to GitHub repository
3. Select branch: main
4. Set cloud code path: /cloud
5. Enable auto-deploy on push

## Verify Deployment
After deployment, check:
1. Back4App Dashboard → Cloud Code → should show "main.js" with recent timestamp
2. Check logs for any deployment errors
3. Test creating a blood request from the hospital dashboard

## Important Notes
- Cloud Code must be deployed separately from Container App
- Cloud Code runs on Parse Server, not in your Container
- Changes to cloud/main.js require redeployment to take effect
- The createBloodRequest cloud function will be available after deployment

## Troubleshooting
- If "invalid function" error persists, cloud code is not deployed
- Check Back4App logs for deployment errors
- Ensure you're deploying to the correct Parse App
- Verify file name is exactly `main.js` in the `cloud/` folder
