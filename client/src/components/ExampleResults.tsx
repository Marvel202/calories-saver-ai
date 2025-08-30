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
    <section className="px-4 py-16 bg-muted/50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-foreground mb-4">
          See It In Action
        </h2>
        <p className="text-center text-muted-foreground mb-12">
          Examples of our AI nutrition analysis in action
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {examples.map((example, index) => (
            <div key={index} className="neomorphic rounded-2xl overflow-hidden hover-lift" data-testid={`example-${index + 1}`}>
              <img 
                src={example.image} 
                alt={example.alt}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h4 className="font-semibold text-foreground mb-4">{example.title}</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Protein</p>
                    <p className="font-bold text-primary">{example.nutrition.protein}g</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Carbs</p>
                    <p className="font-bold text-accent">{example.nutrition.carbs}g</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fat</p>
                    <p className="font-bold text-secondary">{example.nutrition.fat}g</p>
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
