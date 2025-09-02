import { Utensils, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="relative z-50 surface-translucent border-b border-gray-300">
      <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center elevation-3 hover-lift border border-red-400/30 shadow-lg">
            <Utensils className="text-white filter drop-shadow-md" size={24} />
          </div>
          <span className="font-bold text-xl text-gray-900">Calories Saver AI</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-gray-600 hover:text-gray-900 w-12 h-12 rounded-2xl elevation-1 hover-lift tactile-button"
          data-testid="button-menu"
        >
          <Menu size={24} />
        </Button>
      </div>
    </header>
  );
}
