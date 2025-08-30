import { Camera, Brain, BarChart3 } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      icon: Camera,
      title: "1. Capture",
      description: "Take a photo of your meal or upload from gallery",
      color: "text-primary"
    },
    {
      icon: Brain,
      title: "2. Analyze", 
      description: "AI processes your image using advanced computer vision",
      color: "text-accent"
    },
    {
      icon: BarChart3,
      title: "3. Results",
      description: "Get detailed macronutrient breakdown instantly",
      color: "text-secondary"
    }
  ];

  return (
    <section className="px-4 py-16 bg-muted/50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-foreground mb-4">
          How It Works
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Our advanced AI analyzes your meal photos to provide accurate nutritional information in seconds.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="text-center" data-testid={`step-${index + 1}`}>
                <div className="neomorphic w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className={step.color} size={24} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
