import { Utensils } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="bg-background border-t border-border px-4 py-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
            <Utensils className="text-white" size={12} />
          </div>
          <span className="font-semibold text-foreground">Calories Saver AI</span>
        </div>
        <p className="text-muted-foreground text-sm mb-4">
          Making nutrition tracking effortless with AI-powered meal analysis
        </p>
        <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors" data-testid="link-privacy">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-foreground transition-colors" data-testid="link-terms">
            Terms of Service
          </a>
          <a href="#" className="hover:text-foreground transition-colors" data-testid="link-contact">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
