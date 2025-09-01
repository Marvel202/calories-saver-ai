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
      const res = await apiRequest("POST", "/api/analyze-meal", { imageUrl });
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
    console.log("Requesting upload parameters...");
    try {
      const res = await apiRequest("POST", "/api/objects/upload", {});
      console.log("Upload params response status:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Upload params error response:", errorText);
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }
      
      const data = await res.json();
      console.log("Upload params received:", { url: data.uploadURL?.substring(0, 100) + "..." });
      
      return {
        method: "PUT" as const,
        url: data.uploadURL,
      };
    } catch (error) {
      console.error("Failed to get upload parameters:", error);
      throw error;
    }
  };

  const handleUploadComplete = useCallback((result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const imageUrl = result.successful[0].uploadURL;
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

      // Create a mock Uppy result to trigger the same upload flow as ObjectUploader
      const mockUppyResult = {
        successful: [{
          data: file,
          name: file.name,
          type: file.type,
          uploadURL: '' // Will be set after upload
        }],
        failed: []
      };

      // Start the upload process
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

      // Use the existing upload infrastructure
      handleGetUploadParameters()
        .then(uploadParams => {
          console.log('Camera upload: Got upload params:', { url: uploadParams.url.substring(0, 100) + '...' });
          
          // Store the original signed URL to construct final URL
          const signedURL = uploadParams.url;
          
          return fetch(signedURL, {
            method: uploadParams.method,
            body: file,
          }).then(response => {
            console.log('Camera upload: Response status:', response.status);
            if (!response.ok) {
              throw new Error(`Upload failed with status: ${response.status} - ${response.statusText}`);
            }
            // Construct the final object URL by removing query params from signed URL
            const finalObjectURL = signedURL.split('?')[0];
            console.log('Camera upload: Final object URL:', finalObjectURL);
            return finalObjectURL;
          });
        })
        .then(finalObjectURL => {
          console.log('Camera upload: Success, triggering completion with URL:', finalObjectURL);
          mockUppyResult.successful[0].uploadURL = finalObjectURL;
          
          // Trigger the same completion handler as ObjectUploader
          handleUploadComplete(mockUppyResult as any);
        })
        .catch(error => {
          console.error('Camera upload error:', error);
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          });
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
            <div className="w-28 h-28 bg-primary/20 rounded-3xl flex items-center justify-center mb-8 mx-auto elevation-2 hover-lift">
              <Camera className="text-primary text-3xl" size={48} />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Upload Your Meal</h3>
            <p className="text-gray-700 mb-12 text-xl font-medium">Take a photo or upload from gallery</p>
            
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              <Button 
                onClick={openCamera}
                className="tactile-button px-10 py-5 bg-primary text-gray-900 rounded-2xl font-bold text-lg flex items-center justify-center space-x-4 pulse-primary"
                data-testid="button-camera"
              >
                <Camera size={28} className="text-gray-900" />
                <span>Take Photo</span>
              </Button>
              
              <ObjectUploader
                maxNumberOfFiles={1}
                maxFileSize={10485760}
                onGetUploadParameters={handleGetUploadParameters}
                onComplete={handleUploadComplete}
                buttonClassName="tactile-button px-10 py-5 bg-gray-100 text-gray-900 rounded-2xl font-bold text-lg flex items-center justify-center space-x-4"
              >
                <Images size={28} />
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
      />
    </div>
  );
}
