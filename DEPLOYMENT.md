# CalorieSnap Deployment Guide

## Option 1: Vercel + Railway (Recommended)

### Frontend Deployment (Vercel)
1. **Build the client:**
```bash
cd client
npm run build
```

2. **Deploy to Vercel:**
- Connect your GitHub repo to Vercel
- Set build command: `cd client && npm run build`
- Set output directory: `client/dist`
- You'll get: `https://your-app.vercel.app`

### Backend Deployment (Railway)
1. **Connect to Railway:**
- Go to railway.app
- Connect your GitHub repo
- Select the root directory

2. **Environment Variables on Railway:**
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=your_postgresql_url
N8N_WEBHOOK_URL=https://glorious-orca-novel.ngrok-free.app/webhook/e52946b4-075f-472b-8242-d245d1b12a92
```

3. **Railway gives you:**
- A backend URL like: `https://your-app.railway.app`
- Port 3000 becomes irrelevant - Railway handles it

### Update Frontend for Production
Update `client/src/lib/queryClient.ts`:
```typescript
const API_BASE = import.meta.env.PROD 
  ? 'https://your-app.railway.app'  // Your Railway backend URL
  : 'http://localhost:3000';
```

## Option 2: Netlify (Frontend Only)

If you want to use Netlify for frontend:

1. **Build:**
```bash
cd client && npm run build
```

2. **Deploy:**
- Drag `client/dist` folder to Netlify
- You'll get: `https://your-app.netlify.app`

## Option 3: GitHub Pages (Free, Frontend Only)

For a completely free option:

1. **Build and deploy:**
```bash
cd client
npm run build
# Push dist/ contents to gh-pages branch
```

2. **Enable GitHub Pages:**
- Go to your repo settings
- Enable Pages from gh-pages branch
- You'll get: `https://marvel202.github.io/calories-saver-ai`

## Port Information

**Important**: Once deployed to any hosting platform:
- Port 3000 is only for local development
- Production platforms assign their own ports automatically
- Your app will be accessible via standard HTTPS (port 443)
- You don't need to worry about ports in production

## Recommended Steps for You:

1. **Use Railway for backend** (easiest for file uploads)
2. **Use Vercel/Netlify for frontend** 
3. **Update frontend to point to Railway backend URL**
4. **Share the frontend URL with friends**

This gives you:
- ✅ Shareable production link
- ✅ Working file uploads
- ✅ Database connectivity
- ✅ n8n webhook integration
