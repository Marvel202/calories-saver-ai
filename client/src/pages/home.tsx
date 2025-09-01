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
        <section className="relative min-h-screen flex flex-col justify-center px-6 py-16 overflow-hidden">
          
          <div className="max-w-6xl mx-auto w-full">
            {/* Main Hero Content */}
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
                Smart Nutrition
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent block">
                  Analysis
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
                Upload a photo of your meal and get instant macronutrient breakdown powered by AI in <a href="#methodology" className="text-primary underline hover:text-primary/80">under 3 seconds</a>. Track protein, carbs, and fat effortlessly.
              </p>
            </div>

            {/* Main Upload Card */}
            <div className="relative mb-16">
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
