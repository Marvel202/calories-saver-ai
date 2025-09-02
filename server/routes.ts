import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { insertMealAnalysisSchema, nutritionDataSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import FormData from "form-data";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for local file storage
const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `image-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Add debugging middleware to track API route hits
  app.use('/api/*', (req, res, next) => {
    const userAgent = req.headers['user-agent']?.substring(0, 50) || 'Unknown';
    console.log(`🔍 API Route intercepted: ${req.method} ${req.url} from ${userAgent}`);
    next();
  });

  // Handle CORS preflight requests for API endpoints
  app.options('/api/*', (req, res) => {
    console.log(`🔧 CORS preflight for ${req.url}`);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
  });

  // Serve uploaded files statically
  app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // Real file upload endpoint - handles both PUT (Uppy) and POST (form data)
  app.post("/api/upload-image", upload.single('image'), (req, res) => {
    console.log("📸 REAL: POST multipart image upload received");
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Generate the public URL for the uploaded image
    const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    console.log("📸 REAL: Image saved at:", imageUrl);

    res.json({ 
      success: true,
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  });

  // Handle PUT uploads from Uppy (raw file data)
  app.put("/api/upload-image", (req, res) => {
    console.log("📸 REAL: PUT raw image upload received");
    
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `image-${uniqueSuffix}.jpg`; // Default to jpg for raw uploads
    const filepath = path.join(__dirname, '../uploads', filename);
    
    // Write the raw file data
    const chunks: Buffer[] = [];
    
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    
    req.on('end', () => {
      const fileBuffer = Buffer.concat(chunks);
      
      fs.writeFile(filepath, fileBuffer, (err: any) => {
        if (err) {
          console.error("📸 REAL: Error saving file:", err);
          return res.status(500).json({ error: 'Failed to save file' });
        }
        
        // Generate the public URL for the uploaded image
        const imageUrl = `http://localhost:3000/uploads/${filename}`;
        console.log("📸 REAL: Raw image saved at:", imageUrl);
        
        // For Uppy, the response should be the URL directly or a simple success
        res.status(200).send(imageUrl);
      });
    });
    
    req.on('error', (err) => {
      console.error("📸 REAL: Upload error:", err);
      res.status(500).json({ error: 'Upload failed' });
    });
  });

  // Object storage routes for public file uploading
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", async (req, res) => {
    const isBrowser = req.headers['user-agent']?.includes('Mozilla') || req.headers['user-agent']?.includes('Chrome');
    const logPrefix = isBrowser ? "🌐 BROWSER" : "📡 CURL";
    
    console.log(`${logPrefix} Upload URL request received:`, {
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      contentType: req.headers['content-type'],
      body: req.body,
      timestamp: new Date().toISOString()
    });
    
    // Add CORS headers explicitly  
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    // Development mode: return real local upload URL  
    if (process.env.NODE_ENV === 'development') {
      console.log(`${logPrefix} Development mode: returning real local upload URL`);
      const realUploadURL = "http://localhost:3000/api/upload-image";
      res.json({ uploadURL: realUploadURL });
      return;
    }
    
    // Production mode: use actual Google Cloud Storage
    const objectStorageService = new ObjectStorageService();
    try {
      console.log(`${logPrefix} Attempting to generate upload URL...`);
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      console.log(`${logPrefix} Upload URL generated successfully:`, uploadURL.substring(0, 100) + "...");
      res.json({ uploadURL });
    } catch (error) {
      console.error(`${logPrefix} Error generating upload URL:`, error);
      console.error(`${logPrefix} Error details:`, {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'Unknown',
        timestamp: new Date().toISOString()
      });
      res.status(500).json({ 
        error: "Failed to generate upload URL", 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Mock upload endpoint for development mode
  app.put("/api/mock-upload", async (req, res) => {
    console.log("📸 DEV: Mock upload received, simulating successful upload");
    
    // Add CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    // Simulate upload success
    res.status(200).json({ success: true });
  });

  // Handle CORS preflight for mock upload
  app.options("/api/mock-upload", (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
  });

  // Development endpoint to test n8n workflow without file upload
  app.post("/api/test-analyze", async (req, res) => {
    try {
      console.log("🧪 TEST: Testing n8n workflow with mock image URL");
      
      // Use the image from your seafood pasta attachment or a public URL
      const testImageUrl = "https://images.unsplash.com/photo-1551326844-4df70f78d0e9?w=500";
      
      // Call n8n webhook with the test image URL
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || "https://glorious-orca-novel.ngrok-free.app/webhook-test/e52946b4-075f-472b-8242-d245d1b12a92/";
      
      const webhookPayload = {
        originalUrl: testImageUrl,  // n8n expects 'originalUrl'
        imageUrl: testImageUrl,     // Keep both for compatibility
        mimeType: "image/jpeg",
        timestamp: new Date().toISOString(),
        testMode: true
      };
      
      console.log("🧪 TEST: Sending to n8n webhook:", n8nWebhookUrl);
      console.log("🧪 TEST: Payload:", JSON.stringify(webhookPayload, null, 2));
      
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!n8nResponse.ok) {
        const responseText = await n8nResponse.text();
        console.error("🧪 TEST: n8n webhook error response:", responseText);
        throw new Error(`n8n workflow failed: ${n8nResponse.status} - ${responseText}`);
      }

      const n8nData = await n8nResponse.json();
      console.log("🧪 TEST: n8n response received:", n8nData);
      
      res.json({
        success: true,
        message: "n8n workflow test completed",
        n8nResponse: n8nData,
        testImageUrl
      });

    } catch (error) {
      console.error("🧪 TEST: Error testing n8n workflow:", error);
      res.status(500).json({ 
        error: "Failed to test n8n workflow",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Development endpoint that returns mock nutrition data
  app.post("/api/analyze-meal-dev", async (req, res) => {
    console.log("📸 DEV: Mock nutrition analysis for development");
    
    const { imageUrl } = req.body;
    console.log("📸 DEV: Analyzing image URL:", imageUrl);
    
    // Return mock nutrition data that matches our schema
    const mockNutrition = {
      calories: 450,
      protein: 25,
      carbs: 35,
      fat: 22,
      confidence: 0.85,
      foodItems: [
        "Grilled Chicken Breast",
        "Mixed Vegetables", 
        "Brown Rice"
      ]
    };

    try {
      // Store the analysis in memory
      const analysis = await storage.createMealAnalysis({
        imageUrl: imageUrl,
        nutrition: mockNutrition,
      });

      res.json({
        message: "Analysis complete",
        nutrition: mockNutrition,
        analysis: analysis,
      });
    } catch (error) {
      console.error("Error in dev analysis:", error);
      res.status(500).json({ 
        error: "Failed to analyze meal",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Meal analysis endpoint - CORRECTED VERSION
  app.post("/api/analyze-meal", async (req, res) => {
    try {
      const { imageUrl } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ error: "Image URL is required" });
      }

      console.log("📸 Analyzing meal with image URL:", imageUrl);

      // In development mode, use the imageUrl directly (it's a mock URL)
      let accessibleImageUrl = imageUrl;
      
      if (process.env.NODE_ENV !== 'development') {
        // Production mode: normalize the object path for storage
        const objectStorageService = new ObjectStorageService();
        const normalizedPath = objectStorageService.normalizeObjectEntityPath(imageUrl);

        // Use the actual Replit app URL (always HTTPS in production)
        const appUrl = process.env.APP_URL || 'https://calorie-snap-marvel202.replit.app';
        accessibleImageUrl = `${appUrl}${normalizedPath}`;

        console.log("Creating accessible image URL:", accessibleImageUrl);
        
        // Optional: Verify the image exists locally first (faster)
        try {
          const objectFile = await objectStorageService.getObjectEntityFile(normalizedPath);
          console.log("Image file verified in storage");
        } catch (error) {
          console.error("Image not found in storage:", error);
          throw new Error("Image not found in storage");
        }
      }

      // Call n8n webhook with the actual image file
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || "https://glorious-orca-novel.ngrok-free.app/webhook-test/e52946b4-075f-472b-8242-d245d1b12a92/";
      
      console.log("Sending to n8n webhook:", n8nWebhookUrl);
      console.log("Sending image file directly to n8n");
      
      // Read the image file from disk
      let imageBuffer: Buffer;
      let imagePath: string;
      
      if (imageUrl.includes('/uploads/')) {
        // Local file - read from disk
        const filename = imageUrl.split('/uploads/')[1];
        imagePath = path.join(__dirname, '../uploads', filename);
        
        try {
          imageBuffer = fs.readFileSync(imagePath);
          console.log("📸 Read local image file:", imagePath, "Size:", imageBuffer.length, "bytes");
        } catch (err) {
          console.error("📸 Error reading local image file:", err);
          throw new Error(`Failed to read image file: ${imagePath}`);
        }
      } else {
        // External URL - fetch the image
        console.log("📸 Fetching external image:", imageUrl);
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }
        const arrayBuffer = await imageResponse.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
        console.log("📸 Fetched external image. Size:", imageBuffer.length, "bytes");
      }
      
      // Create multipart/form-data with the image file
      const formData = new FormData();
      
      // Add the image file
      formData.append('image', imageBuffer, {
        filename: 'meal_image.jpg',
        contentType: 'image/jpeg'
      });
      
      // Add metadata as form fields
      formData.append('timestamp', new Date().toISOString());
      formData.append('mimeType', 'image/jpeg');
      
      const n8nResponse = await axios.post(n8nWebhookUrl, formData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          ...formData.getHeaders()  // This sets Content-Type: multipart/form-data with boundary
        }
      });

      if (n8nResponse.status !== 200) {
        const responseText = typeof n8nResponse.data === 'string' ? n8nResponse.data : JSON.stringify(n8nResponse.data);
        console.error("n8n webhook error response:", responseText);
        console.error("Response status:", n8nResponse.status);
        
        if (responseText.includes("test mode") || responseText.includes("Execute workflow")) {
          throw new Error("n8n webhook is in test mode. Please click 'Execute workflow' in n8n canvas and try again.");
        }
        
        throw new Error(`n8n workflow failed: ${n8nResponse.status} - ${responseText}`);
      }

      const n8nData = n8nResponse.data;
      console.log("n8n response received:", JSON.stringify(n8nData, null, 2));
      
      // Check if n8n is returning a "workflow started" message instead of results
      if (n8nData.message === "Workflow was started") {
        console.error("❌ n8n webhook is configured for async execution. Change to sync execution in n8n.");
        throw new Error("n8n workflow is running asynchronously. Please change the webhook to 'Respond When Workflow Finishes' in n8n settings.");
      }
      
      // Extract the nutrition data from the n8n response
      // n8n returns an array, so we take the first element's output
      let nutritionData;
      if (Array.isArray(n8nData) && n8nData.length > 0 && n8nData[0].output) {
        nutritionData = n8nData[0].output;
      } else if (n8nData.output) {
        nutritionData = n8nData.output;
      } else if (n8nData.status && n8nData.food && n8nData.total) {
        // Direct format
        nutritionData = n8nData;
      } else {
        console.error("❌ Unexpected n8n response format:", n8nData);
        throw new Error("Unexpected response format from n8n workflow. Expected structured nutrition data.");
      }
      
      console.log("🍽️ Extracted nutrition data:", JSON.stringify(nutritionData, null, 2));
      
      // Validate the nutrition data from n8n
      const nutrition = nutritionDataSchema.parse(nutritionData);
      
      // Store the analysis in memory
      const analysis = await storage.createMealAnalysis({
        imageUrl: imageUrl,
        nutrition,
      });

      res.json({
        analysisId: analysis.id,
        nutrition,
        imageUrl: imageUrl,
      });

    } catch (error) {
      console.error("Error analyzing meal:", error);
      res.status(500).json({ 
        error: "Failed to analyze meal",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Feedback endpoint
  app.post("/api/feedback", async (req, res) => {
    try {
      const { imageUrl, rating, nutrition } = req.body;
      
      if (!imageUrl || !rating || !nutrition) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (rating < 1 || rating > 4) {
        return res.status(400).json({ error: "Rating must be between 1 and 4" });
      }

      // Find the analysis by imageUrl (in a real app, you'd pass the analysisId)
      // For now, we'll create a feedback entry
      const feedbackAnalysis = await storage.createMealAnalysis({
        imageUrl,
        nutrition,
        feedback: rating,
      });

      res.json({ 
        success: true,
        feedbackId: feedbackAnalysis.id 
      });

    } catch (error) {
      console.error("Error submitting feedback:", error);
      res.status(500).json({ error: "Failed to submit feedback" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
