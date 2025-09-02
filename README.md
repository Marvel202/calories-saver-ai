# 🥗 CalorieSnap - AI-Powered Nutrition Analysis

A modern, mobile-first web application that analyzes food images and provides detailed nutritional breakdowns using AI. Simply snap a photo of your meal and get instant macronutrient analysis with individual food item detection.

![CalorieSnap Demo](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20TypeScript-blue)
![AI Powered](https://img.shields.io/badge/AI-Mistral%20Cloud-purple)

## ✨ Features

- 📸 **Instant Photo Analysis** - Upload meal photos and get results in under 3 seconds
- 🍽️ **Individual Food Detection** - Identifies each food item with estimated quantities
- 📊 **Detailed Nutrition Breakdown** - Complete macronutrient analysis (calories, protein, carbs, fat)
- 📱 **Mobile-First Design** - Responsive neomorphic UI optimized for all devices
- 🎯 **Real-Time Processing** - Direct binary image uploads to AI workflow
- ⭐ **User Feedback System** - Rate analysis accuracy to improve results
- 🚀 **Production Ready** - Full-stack TypeScript application

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling with custom neomorphic design
- **Tanstack Query** for state management
- **Uppy** for advanced file uploads
- **Lucide React** for beautiful icons

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Multer** for file upload handling
- **Axios** for HTTP requests
- **Drizzle ORM** with PostgreSQL
- **Zod** for schema validation

### AI & Infrastructure
- **n8n** workflow automation
- **Mistral AI** for image analysis
- **ngrok** for webhook tunneling (development)
- **Local file storage** with multipart uploads

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- n8n instance with Mistral AI integration

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Marvel202/calories-saver-ai.git
cd calories-saver-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file in the root directory:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=your_postgresql_connection_string
N8N_WEBHOOK_URL=your_n8n_webhook_url
```

4. **Database Setup**
```bash
npm run db:push
```

5. **Start Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
calories-saver-ai/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
│   └── public/             # Static assets
├── server/                 # Backend Express server
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API route handlers
│   ├── storage.ts         # Database operations
│   └── objectStorage.ts   # File handling
├── shared/                 # Shared TypeScript definitions
│   └── schema.ts          # Zod schemas and types
└── uploads/               # Local file storage
```

## 🎯 API Endpoints

### File Upload
- `POST /api/objects/upload` - Get upload URL
- `PUT /api/upload-image` - Upload image file
- `POST /api/upload-image` - Upload via multipart form

### Analysis
- `POST /api/analyze-meal` - Analyze uploaded meal image
- `POST /api/feedback` - Submit analysis feedback

### Health Check
- `GET /` - Basic health check

## 🔧 n8n Workflow Configuration

The application integrates with an n8n workflow for AI analysis:

1. **Webhook Node**: Receives multipart/form-data with image
2. **Mistral AI Node**: Analyzes image and extracts nutrition data
3. **Response Format**:
```json
{
  "status": "success",
  "food": [
    {
      "name": "Food Item",
      "quantity": "150g",
      "calories": 248,
      "protein": 46,
      "carbs": 0,
      "fat": 5.3
    }
  ],
  "total": {
    "calories": 372,
    "protein": 12.4,
    "carbs": 26.9,
    "fat": 24.2
  }
}
```

**Important**: Set webhook to "Wait for workflow to finish" for synchronous responses.

## 📱 Usage

1. **Upload Photo**: Click the upload area or camera icon
2. **Wait for Analysis**: AI processes the image (2-3 seconds)
3. **View Results**: See detailed breakdown of detected food items
4. **Rate Accuracy**: Provide feedback to improve future results

## 🚀 Deployment

### Frontend (Static Hosting)
```bash
cd client
npm run build
# Deploy dist/ folder to your hosting platform
```

### Backend (Node.js Hosting)
```bash
npm run build
npm start
```

### Environment Variables (Production)
```env
NODE_ENV=production
DATABASE_URL=your_production_db_url
N8N_WEBHOOK_URL=your_production_webhook_url
PORT=3000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Mistral AI** for powerful image analysis capabilities
- **n8n** for workflow automation platform
- **Uppy** for excellent file upload experience
- **TailwindCSS** for beautiful styling system

## 📞 Support

For support, email support@caloriesaver.ai or open an issue on GitHub.

---

Built with ❤️ by [Marvel202](https://github.com/Marvel202)

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
