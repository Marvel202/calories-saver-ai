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
    const shareText = `Just analyzed my meal with Calories Saver AI: ${nutrition.total.calories} calories, ${nutrition.total.protein}g protein, ${nutrition.total.carbs}g carbs, ${nutrition.total.fat}g fat`;
    
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
    <div className="space-y-8" data-testid="results-section">
      {/* Analysis Complete Card */}
      <div className="elevation-4 rounded-3xl p-8 hover-lift">
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-16 h-16 bg-primary/20 rounded-3xl flex items-center justify-center elevation-2">
            <CheckCircle className="text-primary" size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Analysis Complete</h3>
            <p className="text-gray-700 font-medium">Your meal has been analyzed</p>
          </div>
        </div>
        
        <div className="rounded-3xl overflow-hidden mb-6 elevation-inset">
          <img 
            src={imageUrl} 
            alt="Analyzed meal" 
            className="w-full h-80 object-cover"
            data-testid="img-analyzed-meal"
          />
        </div>
      </div>

      {/* Food Items List */}
      <div className="elevation-2 rounded-3xl p-6 hover-lift">
        <h4 className="text-xl font-bold text-gray-900 mb-4">Detected Food Items</h4>
        <div className="space-y-3">
          {nutrition.food.map((item, index) => (
            <div key={index} className="elevation-1 rounded-2xl p-4 hover-lift">
              <div className="flex justify-between items-center">
                <div>
                  <h5 className="font-semibold text-gray-900">{item.name}</h5>
                  <p className="text-gray-600 text-sm">{item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{item.calories} cal</p>
                  <p className="text-sm text-gray-600">
                    {item.protein}g P • {item.carbs}g C • {item.fat}g F
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Macronutrient Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="elevation-2 rounded-3xl p-8 text-center hover-lift">
          <div className="w-16 h-16 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-4 elevation-1">
            <Dumbbell className="text-primary" size={32} />
          </div>
          <h4 className="font-bold text-gray-900 mb-2 text-lg">Protein</h4>
          <p className="text-3xl font-bold text-primary mb-2" data-testid="text-protein">
            {nutrition.total.protein}g
          </p>
          <p className="text-gray-600 font-medium">Essential amino acids</p>
        </div>
        
        <div className="elevation-2 rounded-3xl p-8 text-center hover-lift">
          <div className="w-16 h-16 bg-accent/20 rounded-3xl flex items-center justify-center mx-auto mb-4 elevation-1">
            <Wheat className="text-accent" size={32} />
          </div>
          <h4 className="font-bold text-gray-900 mb-2 text-lg">Carbs</h4>
          <p className="text-3xl font-bold text-accent mb-2" data-testid="text-carbs">
            {nutrition.total.carbs}g
          </p>
          <p className="text-gray-600 font-medium">Energy source</p>
        </div>
        
        <div className="elevation-2 rounded-3xl p-8 text-center hover-lift">
          <div className="w-16 h-16 bg-secondary/20 rounded-3xl flex items-center justify-center mx-auto mb-4 elevation-1">
            <Droplet className="text-secondary" size={32} />
          </div>
          <h4 className="font-bold text-gray-900 mb-2 text-lg">Fat</h4>
          <p className="text-3xl font-bold text-secondary mb-2" data-testid="text-fat">
            {nutrition.total.fat}g
          </p>
          <p className="text-gray-600 font-medium">Healthy fats</p>
        </div>
      </div>

      {/* Total Calories Card */}
      <div className="elevation-3 rounded-3xl p-8 hover-lift">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Total Calories</h4>
            <p className="text-gray-700 font-medium">Estimated caloric content</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-gray-900" data-testid="text-calories">
              {nutrition.total.calories}
            </p>
            <p className="text-gray-700 font-medium">kcal</p>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="elevation-2 rounded-3xl p-8">
        <h4 className="text-xl font-bold text-gray-900 mb-6 text-center">
          How accurate was this analysis?
        </h4>
        <div className="flex justify-center space-x-6 mb-8">
          {feedbackEmojis.map((emoji, index) => {
            const rating = index + 1;
            return (
              <Button
                key={rating}
                variant="ghost"
                size="icon"
                onClick={() => handleFeedback(rating)}
                className={`w-16 h-16 rounded-3xl text-2xl tactile-button ${
                  selectedFeedback === rating 
                    ? 'bg-primary text-white' 
                    : 'elevation-inset'
                }`}
                data-testid={`button-feedback-${rating}`}
              >
                {emoji}
              </Button>
            );
          })}
        </div>
        
        <div className="flex justify-center space-x-6">
          <Button 
            onClick={onRetry}
            variant="secondary"
            className="tactile-button px-8 py-4 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-2xl font-semibold flex items-center space-x-3 elevation-1"
            data-testid="button-retry"
          >
            <RotateCcw size={24} />
            <span>Try Another</span>
          </Button>
          <Button 
            onClick={handleShare}
            className="tactile-button px-8 py-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-gray-900 rounded-2xl font-semibold flex items-center space-x-3 elevation-2 shadow-lg"
            data-testid="button-share"
          >
            <Share2 size={24} className="text-gray-900" />
            <span className="text-gray-900">Share</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
