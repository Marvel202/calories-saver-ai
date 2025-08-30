import { Utensils, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="relative z-50 glass-morphism border-b border-border">
      <div className="max-w-7xl mx-auto px-8 py-8 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center neomorphic hover-lift tactile-button">
            <Utensils className="text-white" size={24} />
          </div>
          <span className="font-bold text-2xl text-foreground text-3d">Calories Saver AI</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-muted-foreground hover:text-foreground w-16 h-16 rounded-3xl neomorphic hover-lift button-press"
          data-testid="button-menu"
        >
          <Menu size={28} />
        </Button>
      </div>
    </header>
  );
}
