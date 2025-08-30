import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { PhotoUploadArea } from "@/components/PhotoUploadArea";
import { NutritionResults } from "@/components/NutritionResults";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { TrustSection } from "@/components/TrustSection";
import { ExampleResults } from "@/components/ExampleResults";
import { AppFooter } from "@/components/AppFooter";
import type { NutritionData } from "@shared/schema";

export default function Home() {
  const [analysisResults, setAnalysisResults] = useState<{
    nutrition: NutritionData;
    imageUrl: string;
  } | null>(null);

  const handleAnalysisComplete = (nutrition: NutritionData, imageUrl: string) => {
    setAnalysisResults({ nutrition, imageUrl });
    // Scroll to results
    setTimeout(() => {
      const resultsElement = document.querySelector('[data-testid="results-section"]');
      resultsElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleRetry = () => {
    setAnalysisResults(null);
    // Scroll back to upload area
    setTimeout(() => {
      const uploadElement = document.querySelector('[data-testid="upload-area"]');
      uploadElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      
      <main className="relative">
        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col justify-center px-8 py-20 overflow-hidden">
          {/* Enhanced Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/8 rounded-full blur-3xl floating-card"></div>
            <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-secondary/8 rounded-full blur-3xl floating-card" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/4 -right-20 w-64 h-64 bg-accent/6 rounded-full blur-2xl floating-card" style={{animationDelay: '4s'}}></div>
          </div>
          
          <div className="relative z-10 max-w-6xl mx-auto w-full">
            {/* Main Hero Content */}
            <div className="text-center mb-20">
              <h1 className="text-6xl md:text-8xl font-bold text-foreground mb-8 leading-tight tracking-tight text-3d">
                Smart Nutrition
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent block text-embossed">
                  Analysis
                </span>
              </h1>
              <p className="text-2xl md:text-3xl text-muted-foreground mb-16 max-w-4xl mx-auto leading-relaxed font-light">
                Upload a photo of your meal and get instant macronutrient breakdown powered by AI. 
                Track protein, carbs, and fat effortlessly.
              </p>
            </div>

            {/* Main Upload Card */}
            <div className="relative mb-20">
              <PhotoUploadArea onAnalysisComplete={handleAnalysisComplete} />
            </div>

            {/* Results Section */}
            {analysisResults && (
              <NutritionResults 
                nutrition={analysisResults.nutrition}
                imageUrl={analysisResults.imageUrl}
                onRetry={handleRetry}
              />
            )}
          </div>
        </section>

        <HowItWorksSection />
        <TrustSection />
        <ExampleResults />
      </main>

      <AppFooter />
    </div>
  );
}
