import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { insertMealAnalysisSchema, nutritionDataSchema } from "@shared/schema";
import { z } from "zod";

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

  // Meal analysis endpoint
  app.post("/api/analyze-meal", async (req, res) => {
    try {
      const { imageUrl } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ error: "Image URL is required" });
      }

      // Normalize the object path for storage
      const objectStorageService = new ObjectStorageService();
      const normalizedPath = objectStorageService.normalizeObjectEntityPath(imageUrl);

      // Call n8n workflow for meal analysis
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || process.env.N8N_MEAL_ANALYSIS_WEBHOOK || "https://glorious-orca-novel.ngrok-free.app/webhook-test/e52946b4-075f-472b-8242-d245d1b12a92/";
      
      const webhookPayload = {
        imageUrl: normalizedPath,
        timestamp: new Date().toISOString(),
        originalUrl: imageUrl
      };
      
      console.log("Sending to n8n webhook:", n8nWebhookUrl);
      console.log("Payload:", JSON.stringify(webhookPayload, null, 2));
      
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
        console.error("n8n webhook error response:", responseText);
        console.error("Response status:", n8nResponse.status);
        
        // Handle n8n test mode specifically
        if (responseText.includes("test mode") || responseText.includes("Execute workflow")) {
          throw new Error("n8n webhook is in test mode. Please click 'Execute workflow' in n8n canvas and try again.");
        }
        
        throw new Error(`n8n workflow failed: ${n8nResponse.status} - ${responseText}`);
      }

      const n8nData = await n8nResponse.json();
      
      // Validate the nutrition data from n8n
      const nutrition = nutritionDataSchema.parse(n8nData.nutrition || n8nData);
      
      // Store the analysis in memory
      const analysis = await storage.createMealAnalysis({
        imageUrl: normalizedPath,
        nutrition,
      });

      res.json({
        analysisId: analysis.id,
        nutrition,
        imageUrl: normalizedPath,
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
