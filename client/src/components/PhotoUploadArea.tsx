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
    const res = await apiRequest("POST", "/api/objects/upload", {});
    const data = await res.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
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
    <div className="neomorphic rounded-3xl p-8 md:p-12 hover-lift">
      <div 
        className={`upload-area rounded-2xl p-8 text-center min-h-64 flex flex-col justify-center items-center cursor-pointer ${dragOver ? 'dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid="upload-area"
      >
        {!isAnalyzing ? (
          <div data-testid="upload-content">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Camera className="text-primary text-2xl" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Upload Your Meal</h3>
            <p className="text-muted-foreground mb-6">Take a photo or upload from gallery</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={openCamera}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all pulse-glow flex items-center justify-center space-x-2"
                data-testid="button-camera"
              >
                <Camera size={20} />
                <span>Take Photo</span>
              </Button>
              
              <ObjectUploader
                maxNumberOfFiles={1}
                maxFileSize={10485760}
                onGetUploadParameters={handleGetUploadParameters}
                onComplete={handleUploadComplete}
                buttonClassName="px-6 py-3 bg-card border border-border text-foreground rounded-xl font-medium hover:bg-muted transition-all flex items-center justify-center space-x-2"
              >
                <Images size={20} />
                <span>From Gallery</span>
              </ObjectUploader>
            </div>
          </div>
        ) : (
          <div data-testid="loading-state">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-loading-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Analyzing Your Meal</h3>
            <p className="text-muted-foreground mb-4">Our AI is processing your image...</p>
            <div className="w-full max-w-md mx-auto">
              <Progress value={progress} className="h-2" data-testid="progress-analysis" />
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
