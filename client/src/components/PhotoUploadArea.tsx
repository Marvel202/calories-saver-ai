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
    <div className="neomorphic-floating rounded-3xl p-16 md:p-20 hover-lift floating-card">
      <div 
        className={`upload-area rounded-3xl p-16 text-center min-h-96 flex flex-col justify-center items-center cursor-pointer ${dragOver ? 'dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid="upload-area"
      >
        {!isAnalyzing ? (
          <div data-testid="upload-content">
            <div className="w-28 h-28 bg-primary/15 rounded-3xl flex items-center justify-center mb-8 mx-auto neomorphic hover-lift">
              <Camera className="text-primary text-3xl" size={48} />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-4 text-3d">Upload Your Meal</h3>
            <p className="text-muted-foreground mb-12 text-xl font-light">Take a photo or upload from gallery</p>
            
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              <Button 
                onClick={openCamera}
                className="tactile-button px-10 py-5 bg-primary text-primary-foreground rounded-2xl font-bold text-lg flex items-center justify-center space-x-4 pulse-glow button-press"
                data-testid="button-camera"
              >
                <Camera size={28} />
                <span className="text-embossed">Take Photo</span>
              </Button>
              
              <ObjectUploader
                maxNumberOfFiles={1}
                maxFileSize={10485760}
                onGetUploadParameters={handleGetUploadParameters}
                onComplete={handleUploadComplete}
                buttonClassName="tactile-button px-10 py-5 text-foreground rounded-2xl font-bold text-lg flex items-center justify-center space-x-4 button-press"
              >
                <Images size={28} />
                <span className="text-embossed">From Gallery</span>
              </ObjectUploader>
            </div>
          </div>
        ) : (
          <div data-testid="loading-state">
            <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-loading-spin mx-auto mb-8 neomorphic"></div>
            <h3 className="text-3xl font-bold text-foreground mb-4 text-3d">Analyzing Your Meal</h3>
            <p className="text-muted-foreground mb-8 text-xl font-light">Our AI is processing your image...</p>
            <div className="w-full max-w-xl mx-auto">
              <Progress value={progress} className="h-4 neomorphic-inset" data-testid="progress-analysis" />
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
