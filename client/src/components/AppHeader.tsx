import { Utensils, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="relative z-50 bg-background/90 backdrop-blur-xl border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center neomorphic hover-lift">
            <Utensils className="text-white" size={20} />
          </div>
          <span className="font-bold text-xl text-foreground">Calories Saver AI</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-muted-foreground hover:text-foreground w-12 h-12 rounded-2xl hover-lift"
          data-testid="button-menu"
        >
          <Menu size={24} />
        </Button>
      </div>
    </header>
  );
}
