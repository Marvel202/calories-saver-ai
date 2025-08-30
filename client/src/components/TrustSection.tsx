import { Zap, Shield, Lock } from "lucide-react";

export function TrustSection() {
  const features = [
    {
      icon: Zap,
      title: "Instant Analysis",
      description: "Results in under 3 seconds",
      color: "text-primary bg-primary/15"
    },
    {
      icon: Shield,
      title: "95% Accuracy", 
      description: "Trained on millions of food images",
      color: "text-accent bg-accent/15"
    },
    {
      icon: Lock,
      title: "Privacy First",
      description: "Your photos are processed securely",
      color: "text-secondary bg-secondary/15"
    }
  ];

  return (
    <section className="px-8 py-32 relative overflow-hidden">
      {/* Background depth elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-secondary/6 rounded-full blur-3xl floating-card"></div>
        <div className="absolute bottom-1/3 -left-40 w-80 h-80 bg-primary/6 rounded-full blur-3xl floating-card" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="neomorphic-floating rounded-3xl p-16 md:p-20 hover-lift floating-card">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-8 text-3d">
              Trusted by Health Enthusiasts
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto font-light">
              Our AI-powered nutrition analysis has helped thousands track their macros with 95% accuracy.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-center space-x-8" data-testid={`feature-${index + 1}`}>
                    <div className={`w-20 h-20 ${feature.color} rounded-3xl flex items-center justify-center neomorphic hover-lift`}>
                      <Icon size={36} />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-foreground mb-2 text-3d">{feature.title}</h4>
                      <p className="text-muted-foreground font-light text-lg">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Healthy salmon bowl with quinoa and vegetables" 
                className="rounded-3xl w-full h-auto neomorphic-inset hover-lift"
                data-testid="img-example-meal"
              />
              
              {/* Enhanced floating nutrition card overlay */}
              <div className="absolute -bottom-8 -right-8 glass-morphism rounded-3xl p-8 max-w-64 hover-lift floating-card">
                <div className="text-foreground">
                  <div className="flex justify-between mb-3">
                    <span className="font-light text-lg">Protein:</span>
                    <span className="font-bold text-xl text-embossed">32g</span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <span className="font-light text-lg">Carbs:</span>
                    <span className="font-bold text-xl text-embossed">28g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-light text-lg">Fat:</span>
                    <span className="font-bold text-xl text-embossed">18g</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
