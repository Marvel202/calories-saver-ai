# Render.com Deployment Guide for CalorieSnap Backend

## FREE Render Deployment Steps:

### 1. Go to https://render.com and sign up (FREE)

### 2. Connect your GitHub account

### 3. Create a new "Web Service":
   - **Repository**: Marvel202/calories-saver-ai
   - **Branch**: main
   - **Root Directory**: leave blank
   - **Runtime**: Node
   - **Build Command**: `chmod +x render-build.sh && ./render-build.sh`
   - **Start Command**: `npm start`

### 4. Set Environment Variables:
   ```
   NODE_ENV=production
   N8N_WEBHOOK_URL=https://app.n8n.cloud/webhook/e52946b4-075f-472b-8242-d245d1b12a92
   PORT=10000
   ```

### 5. Deploy!

## Your URLs will be:
- **Backend**: https://your-app-name.onrender.com
- **Frontend**: https://calorie-snap-sigma.vercel.app

## Benefits:
✅ Completely FREE for personal projects
✅ 750 hours/month (more than enough)
✅ Automatic HTTPS
✅ File uploads work perfectly
✅ Connects directly to your GitHub

## Important Notes:
- FREE tier "sleeps" after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- Perfect for demos and personal projects
- No credit card required!
