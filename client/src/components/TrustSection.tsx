import { Zap, Shield, Lock } from "lucide-react";

export function TrustSection() {
  const features = [
    {
      icon: Zap,
      title: "Instant Analysis",
      description: "Results in under 3 seconds",
      color: "text-primary bg-primary/20"
    },
    {
      icon: Shield,
      title: "95% Accuracy", 
      description: "Trained on millions of food images",
      color: "text-accent bg-accent/20"
    },
    {
      icon: Lock,
      title: "Privacy First",
      description: "Your photos are processed securely",
      color: "text-secondary bg-secondary/20"
    }
  ];

  return (
    <section className="px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="neomorphic rounded-3xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Trusted by Health Enthusiasts
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered nutrition analysis has helped thousands track their macros with 95% accuracy.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-center space-x-4" data-testid={`feature-${index + 1}`}>
                    <div className={`w-12 h-12 ${feature.color} rounded-full flex items-center justify-center`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Healthy salmon bowl with quinoa and vegetables" 
                className="rounded-2xl shadow-lg w-full h-auto"
                data-testid="img-example-meal"
              />
              
              {/* Floating nutrition card overlay */}
              <div className="absolute -bottom-4 -right-4 glass-morphism rounded-xl p-4 max-w-48">
                <div className="text-white text-sm">
                  <div className="flex justify-between mb-1">
                    <span>Protein:</span>
                    <span className="font-semibold">32g</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Carbs:</span>
                    <span className="font-semibold">28g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fat:</span>
                    <span className="font-semibold">18g</span>
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
