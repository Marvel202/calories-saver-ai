import { useState } from "react";
import { CheckCircle, Dumbbell, Wheat, Droplet, RotateCcw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { NutritionData } from "@shared/schema";

interface NutritionResultsProps {
  nutrition: NutritionData;
  imageUrl: string;
  onRetry: () => void;
}

export function NutritionResults({ nutrition, imageUrl, onRetry }: NutritionResultsProps) {
  const [selectedFeedback, setSelectedFeedback] = useState<number | null>(null);
  const { toast } = useToast();

  const feedbackMutation = useMutation({
    mutationFn: async (rating: number) => {
      const res = await apiRequest("POST", "/api/feedback", { 
        imageUrl, 
        rating,
        nutrition 
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Thank you!",
        description: "Your feedback helps us improve.",
      });
    },
  });

  const handleFeedback = (rating: number) => {
    setSelectedFeedback(rating);
    feedbackMutation.mutate(rating);
  };

  const handleShare = async () => {
    const shareText = `Just analyzed my meal with Calories Saver AI: ${nutrition.calories} calories, ${nutrition.protein}g protein, ${nutrition.carbs}g carbs, ${nutrition.fat}g fat`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Meal Analysis - Calories Saver AI',
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied!",
          description: "Results copied to clipboard.",
        });
      } catch (err) {
        toast({
          title: "Share Failed",
          description: "Unable to share results.",
          variant: "destructive",
        });
      }
    }
  };

  const feedbackEmojis = ['😞', '😐', '😊', '😍'];

  return (
    <div className="space-y-12" data-testid="results-section">
      {/* Analysis Complete Card */}
      <div className="neomorphic-floating rounded-3xl p-12 hover-lift floating-card">
        <div className="flex items-center space-x-8 mb-8">
          <div className="w-20 h-20 bg-primary/15 rounded-3xl flex items-center justify-center neomorphic hover-lift">
            <CheckCircle className="text-primary" size={40} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground text-3d">Analysis Complete</h3>
            <p className="text-muted-foreground font-light text-lg">Your meal has been analyzed</p>
          </div>
        </div>
        
        <div className="rounded-3xl overflow-hidden mb-8 neomorphic-inset">
          <img 
            src={imageUrl} 
            alt="Analyzed meal" 
            className="w-full h-64 object-cover"
            data-testid="img-analyzed-meal"
          />
        </div>
      </div>

      {/* Macronutrient Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="neomorphic rounded-3xl p-10 text-center hover-lift floating-card" style={{animationDelay: '0s'}}>
          <div className="w-20 h-20 bg-primary/15 rounded-3xl flex items-center justify-center mx-auto mb-6 neomorphic hover-lift">
            <Dumbbell className="text-primary" size={36} />
          </div>
          <h4 className="font-bold text-foreground mb-3 text-xl text-3d">Protein</h4>
          <p className="text-4xl font-bold text-primary mb-3 text-embossed" data-testid="text-protein">
            {nutrition.protein}g
          </p>
          <p className="text-muted-foreground font-light">Essential amino acids</p>
        </div>
        
        <div className="neomorphic rounded-3xl p-10 text-center hover-lift floating-card" style={{animationDelay: '0.5s'}}>
          <div className="w-20 h-20 bg-accent/15 rounded-3xl flex items-center justify-center mx-auto mb-6 neomorphic hover-lift">
            <Wheat className="text-accent" size={36} />
          </div>
          <h4 className="font-bold text-foreground mb-3 text-xl text-3d">Carbs</h4>
          <p className="text-4xl font-bold text-accent mb-3 text-embossed" data-testid="text-carbs">
            {nutrition.carbs}g
          </p>
          <p className="text-muted-foreground font-light">Energy source</p>
        </div>
        
        <div className="neomorphic rounded-3xl p-10 text-center hover-lift floating-card" style={{animationDelay: '1s'}}>
          <div className="w-20 h-20 bg-secondary/15 rounded-3xl flex items-center justify-center mx-auto mb-6 neomorphic hover-lift">
            <Droplet className="text-secondary" size={36} />
          </div>
          <h4 className="font-bold text-foreground mb-3 text-xl text-3d">Fat</h4>
          <p className="text-4xl font-bold text-secondary mb-3 text-embossed" data-testid="text-fat">
            {nutrition.fat}g
          </p>
          <p className="text-muted-foreground font-light">Healthy fats</p>
        </div>
      </div>

      {/* Total Calories Card */}
      <div className="neomorphic-floating rounded-3xl p-12 hover-lift floating-card" style={{animationDelay: '1.5s'}}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-2xl font-bold text-foreground mb-3 text-3d">Total Calories</h4>
            <p className="text-muted-foreground font-light text-lg">Estimated caloric content</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-bold text-foreground text-embossed" data-testid="text-calories">
              {nutrition.calories}
            </p>
            <p className="text-muted-foreground font-light text-lg">kcal</p>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="neomorphic rounded-3xl p-12">
        <h4 className="text-2xl font-bold text-foreground mb-8 text-center text-3d">
          How accurate was this analysis?
        </h4>
        <div className="flex justify-center space-x-8 mb-12">
          {feedbackEmojis.map((emoji, index) => {
            const rating = index + 1;
            return (
              <Button
                key={rating}
                variant="ghost"
                size="icon"
                onClick={() => handleFeedback(rating)}
                className={`w-20 h-20 rounded-3xl text-3xl button-press ${
                  selectedFeedback === rating 
                    ? 'bg-primary text-primary-foreground tactile-button' 
                    : 'neomorphic-inset'
                }`}
                data-testid={`button-feedback-${rating}`}
              >
                {emoji}
              </Button>
            );
          })}
        </div>
        
        <div className="flex justify-center space-x-8">
          <Button 
            onClick={onRetry}
            variant="secondary"
            className="tactile-button px-10 py-5 text-muted-foreground rounded-2xl font-bold flex items-center space-x-4 button-press text-lg"
            data-testid="button-retry"
          >
            <RotateCcw size={28} />
            <span className="text-embossed">Try Another</span>
          </Button>
          <Button 
            onClick={handleShare}
            className="tactile-button px-10 py-5 bg-accent text-accent-foreground rounded-2xl font-bold flex items-center space-x-4 button-press text-lg"
            data-testid="button-share"
          >
            <Share2 size={28} />
            <span className="text-embossed">Share</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
