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
    <section className="px-6 py-24 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-light">
            Our advanced AI analyzes your meal photos to provide accurate nutritional information in seconds.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="text-center" data-testid={`step-${index + 1}`}>
                <div className="neomorphic w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 hover-lift">
                  <Icon className={step.color} size={32} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">{step.title}</h3>
                <p className="text-muted-foreground font-light text-lg">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
