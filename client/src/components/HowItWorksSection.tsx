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
    <section className="px-8 py-32 bg-muted/20 relative overflow-hidden">
      {/* Background depth elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/4 rounded-full blur-3xl floating-card"></div>
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-accent/4 rounded-full blur-3xl floating-card" style={{animationDelay: '3s'}}></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-8 text-3d">
            How It Works
          </h2>
          <p className="text-2xl text-muted-foreground max-w-4xl mx-auto font-light">
            Our advanced AI analyzes your meal photos to provide accurate nutritional information in seconds.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="text-center" data-testid={`step-${index + 1}`}>
                <div className="neomorphic-floating w-28 h-28 rounded-3xl flex items-center justify-center mx-auto mb-8 hover-lift floating-card" style={{animationDelay: `${index * 0.5}s`}}>
                  <Icon className={step.color} size={40} />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-6 text-3d">{step.title}</h3>
                <p className="text-muted-foreground font-light text-xl leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
