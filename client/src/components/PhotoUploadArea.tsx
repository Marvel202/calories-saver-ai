import { useState, useRef, useCallback } from "react";
import { Camera, Images, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { NutritionData } from "@shared/schema";

interface PhotoUploadAreaProps {
  onAnalysisComplete: (results: NutritionData, imageUrl: string) => void;
}

export function PhotoUploadArea({ onAnalysisComplete }: PhotoUploadAreaProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const analyzeImageMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      // TEMPORARILY: Always use the real endpoint to test n8n webhook
      const endpoint = '/api/analyze-meal';
      console.log("🌐 BROWSER: Using endpoint:", endpoint, "for image:", imageUrl);
      console.log("🌐 BROWSER: Image URL type:", typeof imageUrl);
      console.log("🌐 BROWSER: Image URL value:", JSON.stringify(imageUrl));
      
      const res = await apiRequest("POST", endpoint, { imageUrl });
      return res.json();
    },
    onSuccess: (data, imageUrl) => {
      setIsAnalyzing(false);
      setProgress(0);
      onAnalysisComplete(data.nutrition, imageUrl);
      toast({
        title: "Analysis Complete!",
        description: "Your meal has been successfully analyzed.",
      });
    },
    onError: (error) => {
      setIsAnalyzing(false);
      setProgress(0);
      toast({
        title: "Analysis Failed",
        description: "Please try again with a clearer image.",
        variant: "destructive",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    console.log("🌐 BROWSER: Requesting upload parameters...");
    const startTime = Date.now();
    
    try {
      // Get the backend URL (same logic as in queryClient)
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 
        (import.meta.env.PROD ? 'https://calorie-snap-backend.onrender.com' : 'http://localhost:5000');
      
      const fullUrl = `${backendUrl}/api/objects/upload`;
      console.log(`🔗 Making upload params request to: ${fullUrl}`);
      
      // Make request directly with fetch to avoid apiRequest wrapper issues
      const res = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      
      const elapsed = Date.now() - startTime;
      console.log(`🌐 BROWSER: Upload params response status: ${res.status} (${elapsed}ms)`);
      console.log("🌐 BROWSER: Response headers:", Object.fromEntries(res.headers.entries()));
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("🌐 BROWSER: Upload params error response:", errorText);
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }
      
      const data = await res.json();
      console.log("🌐 BROWSER: Upload params received:", { 
        url: data.uploadURL?.substring(0, 100) + "...",
        fullResponse: data 
      });
      
      return {
        method: "PUT" as const,  // Keep PUT for compatibility with Uppy
        url: data.uploadURL,
      };
    } catch (error) {
      const elapsed = Date.now() - startTime;
      console.error(`🌐 BROWSER: Failed to get upload parameters (${elapsed}ms):`, error);
      throw error;
    }
  };

  const handleUploadComplete = useCallback((result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      let imageUrl = result.successful[0].uploadURL;
      
      // Check if we're using the new local upload endpoint
      if (imageUrl && imageUrl.includes('/api/upload-image')) {
        // For local uploads, the uploadURL is the endpoint, but we need the response
        // Uppy should have stored the response in the result
        const response = result.successful[0].response;
        if (typeof response === 'string') {
          // PUT endpoint returns the image URL directly as a string
          imageUrl = response;
        } else if (response && typeof response === 'object' && 'imageUrl' in response) {
          // POST endpoint returns JSON with imageUrl field
          imageUrl = (response as any).imageUrl;
        }
        console.log("🌐 BROWSER: Local upload detected, using real image URL:", imageUrl);
      }
      
      // Legacy: Development mode fallback for mock uploads
      if (imageUrl && imageUrl.includes('/api/mock-upload')) {
        imageUrl = "https://images.unsplash.com/photo-1551326844-4df70f78d0e9?w=800&h=600&fit=crop";
        console.log("🌐 BROWSER: Mock upload detected, using placeholder image URL:", imageUrl);
      }
      
      if (imageUrl) {
        setIsAnalyzing(true);
        setProgress(0);
        
        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + Math.random() * 30;
          });
        }, 200);

        analyzeImageMutation.mutate(imageUrl);
      }
    }
  }, [analyzeImageMutation]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a valid image file.",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Image size must be under 10MB.",
          variant: "destructive",
        });
        return;
      }

      // Start the upload process using the same approach as ObjectUploader
      setIsAnalyzing(true);
      setProgress(0);
      
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 30;
        });
      }, 200);

      // Use a direct upload approach similar to what Uppy does internally
      handleGetUploadParameters()
        .then(uploadParams => {
          console.log('Camera upload: Got upload params');
          
          return fetch(uploadParams.url, {
            method: uploadParams.method,
            body: file,
          }).then(async response => {
            console.log('Camera upload: Response status:', response.status);
            if (!response.ok) {
              throw new Error(`Upload failed with status: ${response.status}`);
            }
            
            let finalURL: string;
            
            // Check if we're using the new local upload endpoint
            if (uploadParams.url.includes('/api/upload-image')) {
              // For local uploads, the response contains the image URL
              const responseData = await response.json();
              if (typeof responseData === 'string') {
                // PUT endpoint might return URL directly as a string
                finalURL = responseData;
              } else if (responseData && typeof responseData === 'object' && responseData.imageUrl) {
                // Response is JSON object with imageUrl field
                finalURL = responseData.imageUrl;
              } else {
                throw new Error('Invalid response format from upload endpoint');
              }
              console.log('🌐 BROWSER: Camera upload local mode, using real image URL:', finalURL);
            } else if (uploadParams.url.includes('/api/mock-upload')) {
              // Legacy mock upload fallback
              finalURL = "https://images.unsplash.com/photo-1551326844-4df70f78d0e9?w=800&h=600&fit=crop";
              console.log('🌐 BROWSER: Camera upload mock mode, using placeholder image URL:', finalURL);
            } else {
              // Default behavior for other endpoints
              finalURL = uploadParams.url.split('?')[0];
              console.log('🌐 BROWSER: Camera upload default mode, using endpoint URL:', finalURL);
            }
            
            console.log('Camera upload: Success, final URL:', finalURL);
            
            // Clear progress interval
            clearInterval(progressInterval);
            
            // Directly trigger analysis like ObjectUploader does
            analyzeImageMutation.mutate(finalURL);
            
            return finalURL;
          });
        })
        .catch(error => {
          console.error('Camera upload error:', error);
          clearInterval(progressInterval);
          setIsAnalyzing(false);
          setProgress(0);
          toast({
            title: "Upload Failed",
            description: `Failed to upload image: ${error.message}`,
            variant: "destructive",
          });
        });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      if (fileInputRef.current) {
        fileInputRef.current.files = files;
        handleFileInputChange({ target: { files } } as any);
      }
    }
  };

  const openCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const openGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  return (
    <div className="elevation-3 rounded-3xl p-16 md:p-20 hover-lift">
      <div 
        className={`upload-area rounded-3xl p-16 text-center min-h-96 flex flex-col justify-center items-center cursor-pointer ${dragOver ? 'dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid="upload-area"
      >
        {!isAnalyzing ? (
          <div data-testid="upload-content">
            <div 
              className="w-28 h-28 bg-primary/20 rounded-3xl flex items-center justify-center mb-8 mx-auto elevation-2 hover-lift cursor-pointer"
              onClick={openCamera}
            >
              <Camera className="text-primary text-3xl" size={48} />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Upload Your Meal</h3>
            <p className="text-gray-700 mb-12 text-xl font-medium">Take a photo or upload from gallery</p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center w-full max-w-md mx-auto">
              <Button 
                onClick={openCamera}
                className="tactile-button px-6 sm:px-10 py-4 sm:py-5 bg-primary text-gray-900 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center space-x-3 sm:space-x-4 pulse-primary w-full sm:w-auto"
                data-testid="button-camera"
              >
                <Camera size={24} className="text-gray-900" />
                <span>Take Photo</span>
              </Button>
              
              <ObjectUploader
                maxNumberOfFiles={1}
                maxFileSize={10485760}
                onGetUploadParameters={handleGetUploadParameters}
                onComplete={handleUploadComplete}
                buttonClassName="tactile-button px-6 sm:px-10 py-4 sm:py-5 bg-gray-100 text-gray-900 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center space-x-3 sm:space-x-4 w-full sm:w-auto"
              >
                <Images size={24} />
                <span>From Gallery</span>
              </ObjectUploader>
            </div>
          </div>
        ) : (
          <div data-testid="loading-state">
            <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-8 elevation-1"></div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Analyzing Your Meal</h3>
            <p className="text-gray-700 mb-8 text-xl font-medium">Our AI is processing your image...</p>
            <div className="w-full max-w-xl mx-auto">
              <Progress value={progress} className="h-4 elevation-inset" data-testid="progress-analysis" />
            </div>
          </div>
        )}
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef}
        accept="image/*" 
        className="hidden"
        onChange={handleFileInputChange}
        data-testid="input-file"
        aria-label="Upload image file"
      />
    </div>
  );
}
