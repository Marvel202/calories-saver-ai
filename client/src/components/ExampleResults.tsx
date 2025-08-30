import { Dumbbell, Wheat, Droplet } from "lucide-react";

export function ExampleResults() {
  const examples = [
    {
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
      title: "Greek Salad",
      alt: "Fresh Greek salad with feta and olives",
      nutrition: {
        protein: 8,
        carbs: 12,
        fat: 22
      }
    },
    {
      image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
      title: "Pasta Marinara", 
      alt: "Pasta dish with marinara sauce and fresh basil",
      nutrition: {
        protein: 14,
        carbs: 58,
        fat: 6
      }
    }
  ];

  return (
    <section className="px-8 py-32 bg-muted/20 relative overflow-hidden">
      {/* Background depth elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl floating-card"></div>
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-secondary/5 rounded-full blur-3xl floating-card" style={{animationDelay: '1.5s'}}></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-8 text-3d">
            See It In Action
          </h2>
          <p className="text-2xl text-muted-foreground font-light">
            Examples of our AI nutrition analysis in action
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {examples.map((example, index) => (
            <div key={index} className="neomorphic-floating rounded-3xl overflow-hidden hover-lift floating-card" style={{animationDelay: `${index * 0.8}s`}} data-testid={`example-${index + 1}`}>
              <div className="relative">
                <img 
                  src={example.image} 
                  alt={example.alt}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <div className="p-12">
                <h4 className="text-2xl font-bold text-foreground mb-8 text-3d">{example.title}</h4>
                <div className="grid grid-cols-3 gap-8 text-center">
                  <div className="neomorphic-inset rounded-2xl p-6">
                    <p className="text-muted-foreground font-light mb-3">Protein</p>
                    <p className="text-3xl font-bold text-primary text-embossed">{example.nutrition.protein}g</p>
                  </div>
                  <div className="neomorphic-inset rounded-2xl p-6">
                    <p className="text-muted-foreground font-light mb-3">Carbs</p>
                    <p className="text-3xl font-bold text-accent text-embossed">{example.nutrition.carbs}g</p>
                  </div>
                  <div className="neomorphic-inset rounded-2xl p-6">
                    <p className="text-muted-foreground font-light mb-3">Fat</p>
                    <p className="text-3xl font-bold text-secondary text-embossed">{example.nutrition.fat}g</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
