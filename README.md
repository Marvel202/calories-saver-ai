# Calories Saver AI 🥗📸

A mobile-first web application that uses AI to analyze meal photos and provide detailed nutritional information including calorie counts, macronutrients, and food identification with confidence ratings.

## 🏗️ Architecture

- **Frontend**: React with TypeScript, Vite, Tailwind CSS, and Shadcn/ui components
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM (Neon serverless)
- **Storage**: Google Cloud Storage for image uploads
- **AI Processing**: n8n workflow with Mistral AI for image analysis
- **Deployment**: Designed for Replit but can run locally

## 🚀 Quick Start

### Prerequisites

- Node.js 18.18+ (recommended: 20+ for full compatibility)
- npm or yarn
- PostgreSQL database (or Neon account)
- Google Cloud Storage bucket
- n8n instance with Mistral AI integration

### 1. Clone and Setup

```bash
git clone https://github.com/Marvel202/calories-saver-ai.git
cd calories-saver-ai
npm install
```

### 2. Environment Configuration

Copy the `.env` file and update with your credentials:

```bash
cp .env .env.local  # Then edit .env.local with your actual values
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://username:password@host:5432/database"

# Google Cloud Storage
GOOGLE_CLOUD_PROJECT_ID="your_project_id"
GCS_BUCKET_NAME="your_bucket_name"

# n8n Webhook (update with your n8n instance)
N8N_WEBHOOK_URL="https://your-n8n-instance.com/webhook-test/e52946b4-075f-472b-8242-d245d1b12a92"

# App URL
APP_URL="http://localhost:5000"

# Other
SESSION_SECRET="your_random_session_secret"
PUBLIC_OBJECT_SEARCH_PATHS="/objects/"
```

### 3. Database Setup

```bash
# Push database schema
npm run db:push
```

### 4. Start Development

```bash
# Option 1: Use the convenience script
./start-dev.sh

# Option 2: Manual start
npm run dev
```

The app will be available at `http://localhost:5000`

## 🔧 Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Update database schema

## 🌐 n8n Workflow Setup

### Current Issue & Solution

The main issue was a mismatch between what the n8n workflow expects and what the server sends:

- **n8n expects**: `$json.body.originalUrl`
- **Server was sending**: `imageUrl`
- **Fixed**: Now sends both `originalUrl` and `imageUrl` for compatibility

### n8n Workflow Configuration

1. Import the workflow from `Calories Reading.json`
2. Configure your Mistral AI credentials
3. Update the webhook URL in your `.env` file
4. Ensure the webhook is active (not in test mode)

### Webhook Payload Format

The server now sends this payload to n8n:

```json
{
  "originalUrl": "https://your-app.com/objects/uploads/image.jpg",
  "imageUrl": "https://your-app.com/objects/uploads/image.jpg", 
  "normalizedPath": "/objects/uploads/image.jpg",
  "mimeType": "image/jpeg",
  "timestamp": "2025-09-02T..."
}
```

## 🏭 Production Deployment

### Replit Deployment

1. Import this repository to Replit
2. Configure environment variables in Replit secrets
3. The app will auto-deploy on Replit

### Other Platforms

1. Build the application: `npm run build`
2. Deploy the `dist` folder and server files
3. Ensure environment variables are configured
4. Run `npm start`

## 🛠️ Troubleshooting

### Common Issues

1. **Image upload fails**
   - Check Google Cloud Storage credentials
   - Verify bucket permissions
   - Ensure `PUBLIC_OBJECT_SEARCH_PATHS` is set

2. **n8n webhook errors**
   - Verify webhook URL is correct
   - Check if n8n workflow is active
   - Ensure Mistral AI credentials are configured

3. **Database connection issues**
   - Verify `DATABASE_URL` format
   - Check if database is accessible
   - Run `npm run db:push` to sync schema

### Debug Mode

Set `NODE_ENV=development` for verbose logging.

## 📱 Mobile-First Design

The app is optimized for mobile devices with:

- Responsive design using Tailwind CSS
- Touch-friendly interface
- Camera integration for photo uploads
- Neomorphic soft UI elements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- Create an issue on GitHub for bugs
- Check the Replit documentation for deployment issues
- Review n8n documentation for workflow problems
