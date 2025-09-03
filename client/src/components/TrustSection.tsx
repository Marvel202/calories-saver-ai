import { Zap, Shield, Lock } from "lucide-react";

export function TrustSection() {
  const features = [
    {
      icon: Zap,
      title: "Instant Analysis",
      description: "Results under fingertip",
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
    <section className="px-6 py-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="elevation-4 rounded-3xl p-12 md:p-16 hover-lift">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Trusted by Health Enthusiasts
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium">
              Our AI-powered nutrition analysis has helped thousands track their macros with <a href="#methodology" className="text-primary underline hover:text-primary/80">95% accuracy</a>.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-center space-x-6" data-testid={`feature-${index + 1}`}>
                    <button 
                      className={`w-16 h-16 ${feature.color} rounded-3xl flex items-center justify-center elevation-2 hover-lift tactile-button hover:elevation-3 transition-all duration-200`}
                      aria-label={feature.title}
                    >
                      <Icon size={32} />
                    </button>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h4>
                      <p className="text-gray-700 font-medium">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Healthy salmon bowl with quinoa and vegetables" 
                className="rounded-3xl w-full h-auto elevation-inset hover-lift"
                data-testid="img-example-meal"
              />
              
              {/* Enhanced floating nutrition card overlay */}
              <div className="absolute -bottom-6 -right-6 surface-translucent rounded-2xl p-6 max-w-56 hover-lift">
                <div className="text-gray-900">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Protein:</span>
                    <span className="font-bold text-lg">32g</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Carbs:</span>
                    <span className="font-bold text-lg">28g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Fat:</span>
                    <span className="font-bold text-lg">18g</span>
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
