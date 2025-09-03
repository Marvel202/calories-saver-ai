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

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

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
  
  // Helper function to set CORS headers properly
  const setCorsHeaders = (req: any, res: any) => {
    const origin = req.headers.origin;
    // Allow requests from Vercel frontend and localhost for development
    const allowedOrigins = [
      'https://calorie-snap-sigma.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173'
    ];
    
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    } else {
      // For other origins, use wildcard but no credentials
      res.header('Access-Control-Allow-Origin', '*');
      // Don't set credentials header for wildcard origins
    }
    
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
  };
  
  // Add debugging middleware to track API route hits
  app.use('/api/*', (req, res, next) => {
    const userAgent = req.headers['user-agent']?.substring(0, 50) || 'Unknown';
    console.log(`🔍 API Route intercepted: ${req.method} ${req.url} from ${userAgent}`);
    
    // Set CORS headers for all API requests
    setCorsHeaders(req, res);
    next();
  });

  // Handle CORS preflight requests for API endpoints
  app.options('/api/*', (req, res) => {
    console.log(`🔧 CORS preflight for ${req.url} from origin: ${req.headers.origin}`);
    setCorsHeaders(req, res);
    res.sendStatus(200);
  });

  // Serve uploaded files statically
  app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // Handle CORS preflight for upload endpoint
  app.options("/api/upload-image", (req, res) => {
    console.log("🔧 CORS preflight for upload endpoint");
    setCorsHeaders(req, res);
    // Allow both POST and PUT methods
    res.header('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS');
    res.sendStatus(200);
  });

  // Real file upload endpoint - handles both PUT (Uppy) and POST (form data)
  app.post("/api/upload-image", upload.single('image'), (req, res) => {
    console.log("📸 REAL: POST multipart image upload received");
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Generate the public URL for the uploaded image
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? `https://${req.get('host')}` 
      : "http://localhost:3000";
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    console.log("📸 REAL: Image saved at:", imageUrl);

    res.json({ 
      success: true,
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  });

  // Handle PUT requests for upload (raw binary data from upload libraries)
  app.put("/api/upload-image", express.raw({ type: '*/*', limit: '10mb' }), (req, res) => {
    console.log("📸 REAL: PUT raw binary image upload received");
    console.log("📸 DEBUG: Content-Type:", req.headers['content-type']);
    console.log("📸 DEBUG: Body size:", req.body ? req.body.length : 0);
    console.log("📸 DEBUG: Body type:", typeof req.body);
    
    // Ensure CORS headers are set for PUT endpoint
    setCorsHeaders(req, res);
    
    if (!req.body || req.body.length === 0) {
      console.error("❌ No image data provided in raw PUT request");
      return res.status(400).json({ error: 'No image data provided' });
    }

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000000);
      const filename = `image-${timestamp}-${random}.jpg`;
      const filepath = path.join(__dirname, '../uploads', filename);
      
      // Write the raw binary data to file
      fs.writeFileSync(filepath, req.body);
      console.log("📸 REAL: Raw image saved to:", filepath);

      // Generate the public URL for the uploaded image
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? `https://${req.get('host')}` 
        : "http://localhost:3000";
      const imageUrl = `${baseUrl}/uploads/${filename}`;
      console.log("📸 REAL: Raw image URL:", imageUrl);

      res.json({ 
        success: true,
        imageUrl: imageUrl,
        filename: filename
      });
    } catch (error) {
      console.error("❌ Error saving raw image:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: 'Failed to save image', details: errorMessage });
    }
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
        const baseUrl = process.env.NODE_ENV === 'production' 
          ? `https://${req.get('host')}` 
          : "http://localhost:3000";
        const imageUrl = `${baseUrl}/uploads/${filename}`;
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

  // Handle CORS preflight for objects/upload endpoint
  app.options("/api/objects/upload", (req, res) => {
    console.log("🔧 CORS preflight for objects/upload endpoint");
    setCorsHeaders(req, res);
    res.sendStatus(200);
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
    
    // Debug environment variables
    console.log(`${logPrefix} Environment check:`, {
      NODE_ENV: process.env.NODE_ENV,
      PRIVATE_OBJECT_DIR: process.env.PRIVATE_OBJECT_DIR,
      PRIVATE_OBJECT_DIR_exists: !!process.env.PRIVATE_OBJECT_DIR,
      will_use_local: (!process.env.PRIVATE_OBJECT_DIR || process.env.NODE_ENV === 'development')
    });
    
    // Force local storage for non-Replit deployments (when PRIVATE_OBJECT_DIR is not set)
    if (!process.env.PRIVATE_OBJECT_DIR) {
      console.log(`${logPrefix} PRIVATE_OBJECT_DIR not set - using local multer storage`);
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? `https://${req.get('host')}` 
        : "http://localhost:3000";
      const realUploadURL = `${baseUrl}/api/upload-image`;
      console.log(`${logPrefix} Returning local upload URL: ${realUploadURL}`);
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
    
    // Simulate upload success
    res.status(200).json({ success: true });
  });

  // Handle CORS preflight for mock upload
  app.options("/api/mock-upload", (req, res) => {
    setCorsHeaders(req, res);
    res.sendStatus(200);
  });

  // Development endpoint to test n8n workflow without file upload
  app.post("/api/test-analyze", async (req, res) => {
    try {
      console.log("🧪 TEST: Testing n8n workflow with mock image URL");
      
      // Use the image from your seafood pasta attachment or a public URL
      const testImageUrl = "https://images.unsplash.com/photo-1551326844-4df70f78d0e9?w=500";
      
      // Call n8n webhook with the test image URL
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || "https://glorious-orca-novel.ngrok-free.app/webhook/e52946b4-075f-472b-8242-d245d1b12a92";
      
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
      status: "success",
      food: [
        {
          name: "Grilled Chicken Breast",
          quantity: "1 medium piece (150g)",
          calories: 200,
          protein: 22,
          carbs: 0,
          fat: 8
        },
        {
          name: "Mixed Vegetables",
          quantity: "1 cup (120g)",
          calories: 50,
          protein: 2,
          carbs: 10,
          fat: 0
        },
        {
          name: "Brown Rice",
          quantity: "0.5 cup cooked (90g)",
          calories: 200,
          protein: 1,
          carbs: 25,
          fat: 14
        }
      ],
      total: {
        calories: 450,
        protein: 25,
        carbs: 35,
        fat: 22
      }
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

  // Meal analysis endpoint - DEBUGGING VERSION
  app.post("/api/analyze-meal", async (req, res) => {
    try {
      console.log("🔍 [STEP 1] Starting meal analysis - Request body:", req.body);
      
      // Support cases where the frontend sends a raw stringified JSON body
      let receivedBody: any = req.body;
      if (typeof receivedBody === 'string') {
        // Try to parse stringified JSON (some clients send JSON as a string)
        try {
          receivedBody = JSON.parse(receivedBody);
          console.log('🔧 Parsed stringified request body into object');
        } catch (parseErr) {
          console.log('⚠️ Request body is a string but not JSON; using raw string');
        }
      }

      // Determine imageUrl from possible shapes: plain string, or upload-response object
      let imageUrl: any = undefined;
      if (typeof receivedBody === 'string') {
        // If it's a string, try to parse it as JSON first, then use as URL
        try {
          const parsed = JSON.parse(receivedBody);
          if (typeof parsed === 'object' && parsed.imageUrl) {
            imageUrl = parsed.imageUrl;
          } else {
            imageUrl = receivedBody; // Use the string as-is if it's not parseable JSON
          }
        } catch (parseErr) {
          imageUrl = receivedBody; // Use the string as-is if it's not valid JSON
        }
      } else if (receivedBody && typeof receivedBody === 'object') {
        // If frontend sent { imageUrl } or the upload response { success, imageUrl, filename }
        if ('imageUrl' in receivedBody && typeof receivedBody.imageUrl === 'string') {
          imageUrl = receivedBody.imageUrl;
        } else if ('url' in receivedBody && typeof receivedBody.url === 'string') {
          imageUrl = receivedBody.url;
        } else if ('originalUrl' in receivedBody && typeof receivedBody.originalUrl === 'string') {
          imageUrl = receivedBody.originalUrl;
        } else {
          // Maybe the client posted a wrapper { body: '{...}' }
          console.log('⚠️ Received object body without imageUrl field:', Object.keys(receivedBody));
        }
      }

      if (!imageUrl || typeof imageUrl !== 'string') {
        console.error("❌ [STEP 1] No valid image URL found; request body:", typeof req.body === 'string' ? req.body.slice(0,1000) : JSON.stringify(req.body).slice(0,1000));
        return res.status(400).json({ error: "Valid image URL string is required" });
      }

      console.log("📸 [STEP 2] Analyzing meal with image URL:", imageUrl);
      console.log("📸 [STEP 2] Image URL type:", typeof imageUrl);

      // Ensure we have a clean string URL
      const actualImageUrl: string = String(imageUrl).trim();

      console.log("📸 [STEP 3] Using actual image URL:", actualImageUrl);

      // Use the imageUrl directly - it should already be accessible
      let accessibleImageUrl = actualImageUrl;
      
      console.log("✅ [STEP 3] Using image URL:", accessibleImageUrl);
      console.log("✅ [STEP 3] Image URL type after processing:", typeof accessibleImageUrl);

      // Call n8n webhook with the actual image file
      console.log("🚀 [STEP 4] Calling real n8n webhook for AI analysis");
      console.log("🚨 DEBUG: This should NOT show mock data anymore!");
      
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || "https://glorious-orca-novel.ngrok-free.app/webhook/e52946b4-075f-472b-8242-d245d1b12a92";
      
      console.log("🔗 Sending to n8n webhook:", n8nWebhookUrl);
      console.log("📤 Sending image file directly to n8n");
      
      // Read the image file from disk
      let imageBuffer: Buffer;
      let imagePath: string;
      
      console.log("🔍 Checking image URL format:", accessibleImageUrl);

      // In production (Render), always fetch via HTTP since local storage is ephemeral
      if (process.env.NODE_ENV === 'production' || !accessibleImageUrl.includes('/uploads/')) {
        // External URL or production - fetch the image via HTTP
        console.log("📸 Fetching image via HTTP (production mode):", accessibleImageUrl);
        let imageResponse;
        try {
          imageResponse = await fetch(accessibleImageUrl);
        } catch (fetchErr) {
          console.error("❌ Fetch error (network) when fetching image:", fetchErr instanceof Error ? fetchErr.message : String(fetchErr));
          throw new Error(`Network error fetching image: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`);
        }

        console.log("📸 Fetch response status:", imageResponse.status);
        try {
          const contentType = imageResponse.headers && typeof imageResponse.headers.get === 'function' ? imageResponse.headers.get('content-type') : undefined;
          const contentLength = imageResponse.headers && typeof imageResponse.headers.get === 'function' ? imageResponse.headers.get('content-length') : undefined;
          console.log("📸 Fetch response headers: content-type=", contentType, "content-length=", contentLength);
        } catch (hdrErr) {
          console.warn("⚠️ Could not read response headers:", hdrErr instanceof Error ? hdrErr.message : String(hdrErr));
        }

        if (!imageResponse.ok) {
          const statusText = imageResponse.statusText || '';
          let respSnippet = '';
          try {
            const txt = await imageResponse.text();
            respSnippet = txt.slice(0, 1000);
          } catch (txtErr) {
            respSnippet = `Unable to read response text: ${txtErr instanceof Error ? txtErr.message : String(txtErr)}`;
          }
          console.error("❌ Failed to fetch image. Status:", imageResponse.status, statusText, "Response snippet:", respSnippet);
          throw new Error(`Failed to fetch image: ${imageResponse.status} ${statusText}`);
        }

        const arrayBuffer = await imageResponse.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
        console.log("📸 Fetched image via HTTP. Size:", imageBuffer.length, "bytes");
      } else if (accessibleImageUrl.includes('/uploads/')) {
        // Local development - read from disk
          const filename = accessibleImageUrl.split('/uploads/')[1];
        imagePath = path.join(__dirname, '../uploads', filename);
        
        console.log("📂 Attempting to read local file:");
        console.log("  - Filename:", filename);
        console.log("  - Full path:", imagePath);
        console.log("  - __dirname:", __dirname);
        
        try {
          // Check if file exists first
          if (!fs.existsSync(imagePath)) {
            console.error("❌ File does not exist:", imagePath);
            throw new Error(`Image file not found: ${imagePath}`);
          }
          
          imageBuffer = fs.readFileSync(imagePath);
          console.log("✅ Successfully read local image file:", imagePath, "Size:", imageBuffer.length, "bytes");
        } catch (err) {
          console.error("📸 Error reading local image file:", err);
          throw new Error(`Failed to read image file: ${imagePath}`);
        }
      } else {
        throw new Error("Unsupported image URL format");
      }
      
      // Create multipart/form-data with the image file
      console.log("📦 Creating form data for n8n webhook");
      const formData = new FormData();
      
      // Add the image file
      formData.append('image', imageBuffer, {
        filename: 'meal_image.jpg',
        contentType: 'image/jpeg'
      });
      
      // Add metadata as form fields
      formData.append('timestamp', new Date().toISOString());
      formData.append('mimeType', 'image/jpeg');
      
      console.log("🚀 Sending request to n8n webhook...");

      let n8nResponse;
      try {
        n8nResponse = await axios.post(n8nWebhookUrl, formData, {
          headers: {
            "ngrok-skip-browser-warning": "true",
            ...formData.getHeaders()  // This sets Content-Type: multipart/form-data with boundary
          },
          timeout: 30000  // 30 second timeout
        });
      } catch (axiosErr: any) {
        // Axios error - capture response details if present
        console.error("❌ Axios error when calling n8n webhook:", axiosErr && axiosErr.message ? axiosErr.message : axiosErr);
        if (axiosErr && axiosErr.response) {
          try {
            console.error("❌ n8n response status:", axiosErr.response.status);
            console.error("❌ n8n response data:", typeof axiosErr.response.data === 'string' ? axiosErr.response.data.slice(0,1000) : JSON.stringify(axiosErr.response.data, null, 2).slice(0,1000));
          } catch (e) {
            console.error("❌ Could not stringify axios error response:", e);
          }
        }
        throw new Error(`Failed to POST to n8n webhook: ${axiosErr && axiosErr.message ? axiosErr.message : String(axiosErr)}`);
      }

      console.log("✅ n8n webhook response status:", n8nResponse.status);
      try {
        const respSnippet = typeof n8nResponse.data === 'string' ? n8nResponse.data.slice(0,1000) : JSON.stringify(n8nResponse.data, null, 2).slice(0,1000);
        console.log("✅ n8n response snippet:", respSnippet);
      } catch (snipErr) {
        console.warn("⚠️ Unable to serialize n8n response snippet:", snipErr instanceof Error ? snipErr.message : String(snipErr));
      }

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
      console.log("n8n response received (full truncated):", (() => {
        try { return JSON.stringify(n8nData, null, 2).slice(0,2000); } catch (e) { return String(n8nData).slice(0,2000); }
      })());
      
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
      
      // Validate the nutrition data from n8n with guarded error logging
      let nutrition;
      try {
        nutrition = nutritionDataSchema.parse(nutritionData);
      } catch (zErr) {
        console.error("❌ Nutrition data failed schema validation:", zErr instanceof Error ? zErr.message : String(zErr));
        try {
          // If it's a ZodError, log detailed issues
          if (zErr && typeof zErr === 'object' && 'issues' in (zErr as any)) {
            console.error("❌ Zod issues:", JSON.stringify((zErr as any).issues, null, 2));
          }
        } catch (inner) {
          console.error("⚠️ Could not stringify Zod error issues:", inner instanceof Error ? inner.message : String(inner));
        }
        throw new Error('Nutrition data from n8n did not match expected schema');
      }
      
      // Store the analysis in memory
      const analysis = await storage.createMealAnalysis({
        imageUrl: accessibleImageUrl,
        nutrition,
      });

      res.json({
        analysisId: analysis.id,
        nutrition,
        imageUrl: accessibleImageUrl,
      });

    } catch (error) {
      console.error("❌ Error analyzing meal:", error);
      console.error("❌ Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      console.error("❌ Error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
        timestamp: new Date().toISOString()
      });
      
      res.status(500).json({ 
        error: "Failed to analyze meal",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
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

  // Temporary test endpoint: fetch an image URL, POST bytes to n8n, and return parsed nutrition
  app.post('/api/test-analyze-url', async (req, res) => {
    try {
      console.log('🧪 [TEST] /api/test-analyze-url called with body:', JSON.stringify(req.body).slice(0,1000));

      let { imageUrl, mockResponse } : { imageUrl?: string, mockResponse?: boolean } = req.body || {};

      if (!imageUrl || typeof imageUrl !== 'string') {
        // Try parsing string body
        if (typeof req.body === 'string') {
          try {
            const parsed = JSON.parse(req.body);
            imageUrl = parsed.imageUrl || parsed.url || parsed.originalUrl;
            mockResponse = parsed.mockResponse;
          } catch (e) {
            // ignore
          }
        }
      }

      if (!imageUrl || typeof imageUrl !== 'string') {
        console.error('🧪 [TEST] Missing or invalid imageUrl in request');
        return res.status(400).json({ error: 'imageUrl string required in JSON body' });
      }

      console.log('🧪 [TEST] Fetching image:', imageUrl);
      let response;
      try {
        response = await fetch(imageUrl);
      } catch (err) {
        console.error('🧪 [TEST] Network error fetching image:', err instanceof Error ? err.message : String(err));
        return res.status(502).json({ error: 'Failed to fetch image', details: err instanceof Error ? err.message : String(err) });
      }

      if (!response.ok) {
        const txt = await response.text().catch(() => 'Unable to read response body');
        console.error('🧪 [TEST] Image fetch returned non-200:', response.status, txt.slice(0,200));
        return res.status(502).json({ error: 'Image fetch failed', status: response.status, bodySnippet: txt.slice(0,200) });
      }

      const buf = Buffer.from(await response.arrayBuffer());
      console.log('🧪 [TEST] Fetched image bytes, size:', buf.length);

      // If mockResponse is true, skip n8n and return mock data
      if (mockResponse) {
        console.log('🧪 [TEST] Using mock nutrition data (bypassing n8n)');
        const mockNutrition = {
          status: "success",
          food: [
            {
              name: "Mixed Vegetables",
              quantity: "1 cup (120g)", 
              calories: 50,
              protein: 2,
              carbs: 10,
              fat: 0
            }
          ],
          total: {
            calories: 50,
            protein: 2,
            carbs: 10,
            fat: 0
          }
        };

        try {
          const nutrition = nutritionDataSchema.parse(mockNutrition);
          return res.json({ success: true, nutrition, raw: mockNutrition, note: 'Using mock data - n8n bypassed' });
        } catch (zErr) {
          console.error('🧪 [TEST] Mock nutrition parse failed:', zErr instanceof Error ? zErr.message : String(zErr));
          return res.status(500).json({ error: 'Mock nutrition parsing failed', details: zErr instanceof Error ? zErr.message : String(zErr) });
        }
      }

      const formData = new FormData();
      formData.append('image', buf, { filename: 'test_image.jpg', contentType: 'image/jpeg' });
      formData.append('timestamp', new Date().toISOString());
      formData.append('mimeType', 'image/jpeg');

      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || "https://glorious-orca-novel.ngrok-free.app/webhook/e52946b4-075f-472b-8242-d245d1b12a92";
      console.log('🧪 [TEST] Posting to n8n webhook:', n8nWebhookUrl);

      let n8nResponse;
      try {
        n8nResponse = await axios.post(n8nWebhookUrl, formData, {
          headers: { ...formData.getHeaders(), 'ngrok-skip-browser-warning': 'true' },
          timeout: 30000
        });
      } catch (err: any) {
        console.error('🧪 [TEST] Axios error posting to n8n:', err && err.message);
        if (err && err.response) {
          console.error('🧪 [TEST] n8n response status:', err.response.status);
          console.error('🧪 [TEST] n8n response data snippet:', JSON.stringify(err.response.data).slice(0,1000));
        }
        return res.status(502).json({ error: 'Failed to call n8n webhook', details: err && err.message });
      }

      console.log('🧪 [TEST] n8n responded with status:', n8nResponse.status);
      const n8nData = n8nResponse.data;
      console.log('🧪 [TEST] n8n data (truncated):', (() => { try { return JSON.stringify(n8nData).slice(0,2000) } catch { return String(n8nData).slice(0,2000) } })());

      // Extract nutrition data similar to analyze-meal
      let nutritionData;
      if (Array.isArray(n8nData) && n8nData.length > 0 && n8nData[0].output) {
        nutritionData = n8nData[0].output;
      } else if (n8nData.output) {
        nutritionData = n8nData.output;
      } else if (n8nData.status && n8nData.food && n8nData.total) {
        nutritionData = n8nData;
      } else {
        console.error('🧪 [TEST] Unexpected n8n response format');
        return res.status(502).json({ error: 'Unexpected n8n response format', n8nData });
      }

      try {
        const nutrition = nutritionDataSchema.parse(nutritionData);
        return res.json({ success: true, nutrition, raw: nutritionData });
      } catch (zErr) {
        console.error('🧪 [TEST] Nutrition parse failed:', zErr instanceof Error ? zErr.message : String(zErr));
        return res.status(502).json({ error: 'Nutrition parsing failed', details: zErr instanceof Error ? zErr.message : String(zErr), nutritionData });
      }

    } catch (error) {
      console.error('🧪 [TEST] Unexpected error:', error);
      return res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
