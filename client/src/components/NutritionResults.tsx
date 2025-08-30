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
    <div className="space-y-6" data-testid="results-section">
      {/* Analysis Complete Card */}
      <div className="neomorphic rounded-2xl p-6 hover-lift">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <CheckCircle className="text-primary" size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Analysis Complete</h3>
            <p className="text-sm text-muted-foreground">Your meal has been analyzed</p>
          </div>
        </div>
        
        <div className="rounded-xl overflow-hidden mb-4">
          <img 
            src={imageUrl} 
            alt="Analyzed meal" 
            className="w-full h-48 object-cover"
            data-testid="img-analyzed-meal"
          />
        </div>
      </div>

      {/* Macronutrient Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="neomorphic rounded-2xl p-6 text-center hover-lift">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Dumbbell className="text-primary" size={24} />
          </div>
          <h4 className="font-semibold text-foreground mb-1">Protein</h4>
          <p className="text-2xl font-bold text-primary" data-testid="text-protein">
            {nutrition.protein}g
          </p>
          <p className="text-sm text-muted-foreground">Essential amino acids</p>
        </div>
        
        <div className="neomorphic rounded-2xl p-6 text-center hover-lift">
          <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Wheat className="text-accent" size={24} />
          </div>
          <h4 className="font-semibold text-foreground mb-1">Carbs</h4>
          <p className="text-2xl font-bold text-accent" data-testid="text-carbs">
            {nutrition.carbs}g
          </p>
          <p className="text-sm text-muted-foreground">Energy source</p>
        </div>
        
        <div className="neomorphic rounded-2xl p-6 text-center hover-lift">
          <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Droplet className="text-secondary" size={24} />
          </div>
          <h4 className="font-semibold text-foreground mb-1">Fat</h4>
          <p className="text-2xl font-bold text-secondary" data-testid="text-fat">
            {nutrition.fat}g
          </p>
          <p className="text-sm text-muted-foreground">Healthy fats</p>
        </div>
      </div>

      {/* Total Calories Card */}
      <div className="neomorphic rounded-2xl p-6 hover-lift">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-foreground mb-1">Total Calories</h4>
            <p className="text-sm text-muted-foreground">Estimated caloric content</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-foreground" data-testid="text-calories">
              {nutrition.calories}
            </p>
            <p className="text-sm text-muted-foreground">kcal</p>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="neomorphic rounded-2xl p-6">
        <h4 className="font-semibold text-foreground mb-4 text-center">
          How accurate was this analysis?
        </h4>
        <div className="flex justify-center space-x-4 mb-4">
          {feedbackEmojis.map((emoji, index) => {
            const rating = index + 1;
            return (
              <Button
                key={rating}
                variant="ghost"
                size="icon"
                onClick={() => handleFeedback(rating)}
                className={`w-12 h-12 rounded-full text-xl hover-lift ${
                  selectedFeedback === rating 
                    ? 'bg-primary text-primary-foreground' 
                    : 'neomorphic-inset'
                }`}
                data-testid={`button-feedback-${rating}`}
              >
                {emoji}
              </Button>
            );
          })}
        </div>
        
        <div className="flex justify-center space-x-4">
          <Button 
            onClick={onRetry}
            variant="secondary"
            className="px-6 py-3 bg-muted text-muted-foreground rounded-xl font-medium hover:bg-border transition-all flex items-center space-x-2"
            data-testid="button-retry"
          >
            <RotateCcw size={20} />
            <span>Try Another</span>
          </Button>
          <Button 
            onClick={handleShare}
            className="px-6 py-3 bg-accent text-accent-foreground rounded-xl font-medium hover:bg-accent/90 transition-all flex items-center space-x-2"
            data-testid="button-share"
          >
            <Share2 size={20} />
            <span>Share</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
