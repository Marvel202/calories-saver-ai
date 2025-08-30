import { Utensils, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="relative z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Utensils className="text-white text-sm" size={16} />
          </div>
          <span className="font-bold text-lg text-foreground">Calories Saver AI</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          data-testid="button-menu"
        >
          <Menu size={20} />
        </Button>
      </div>
    </header>
  );
}
