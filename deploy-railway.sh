#!/bin/bash

# Railway Backend Deployment Script for CalorieSnap

echo "🚀 Deploying CalorieSnap Backend to Railway..."

# Initialize Railway project
echo "📦 Initializing Railway project..."
railway project create calorie-snap-backend --json

# Set environment variables
echo "⚙️ Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set N8N_WEBHOOK_URL=https://app.n8n.cloud/webhook/e52946b4-075f-472b-8242-d245d1b12a92
railway variables set UPLOADS_DIR=/tmp/uploads

# Deploy
echo "🚀 Deploying to Railway..."
railway deploy

echo "✅ Backend deployment complete!"
echo "🔗 Your backend will be available at: https://[project-name].railway.app"
echo ""
echo "Next steps:"
echo "1. Copy the Railway backend URL"
echo "2. Update the frontend to use this URL"
echo "3. Redeploy frontend to Vercel"
