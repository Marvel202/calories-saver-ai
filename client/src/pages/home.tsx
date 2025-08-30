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
        <section className="relative min-h-screen flex flex-col justify-center px-4 py-8 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto w-full">
            {/* Main Hero Content */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
                Smart Nutrition
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {" "}Analysis
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Upload a photo of your meal and get instant macronutrient breakdown powered by AI. 
                Track protein, carbs, and fat effortlessly.
              </p>
            </div>

            {/* Main Upload Card */}
            <div className="relative mb-8">
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
