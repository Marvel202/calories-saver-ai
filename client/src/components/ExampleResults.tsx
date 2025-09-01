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
      image: "/attached_assets/pasta mariana_1756729870118.jpg",
      title: "Pasta Marinara with Shrimp", 
      alt: "Pasta marinara with shrimp in white bowl",
      nutrition: {
        protein: 28,
        carbs: 45,
        fat: 18
      }
    }
  ];

  return (
    <section className="px-6 py-24 bg-gray-50 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            See It In Action
          </h2>
          <p className="text-xl text-gray-700 font-medium">
            Examples of our AI nutrition analysis in action
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {examples.map((example, index) => (
            <div key={index} className="elevation-3 rounded-3xl overflow-hidden hover-lift" data-testid={`example-${index + 1}`}>
              <img 
                src={example.image} 
                alt={example.alt}
                className="w-full h-56 object-cover"
              />
              <div className="p-8">
                <h4 className="text-xl font-bold text-gray-900 mb-6">{example.title}</h4>
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div className="elevation-inset rounded-2xl p-4">
                    <p className="text-gray-600 font-medium mb-2">Protein</p>
                    <p className="text-2xl font-bold text-primary">{example.nutrition.protein}g</p>
                  </div>
                  <div className="elevation-inset rounded-2xl p-4">
                    <p className="text-gray-600 font-medium mb-2">Carbs</p>
                    <p className="text-2xl font-bold text-accent">{example.nutrition.carbs}g</p>
                  </div>
                  <div className="elevation-inset rounded-2xl p-4">
                    <p className="text-gray-600 font-medium mb-2">Fat</p>
                    <p className="text-2xl font-bold text-secondary">{example.nutrition.fat}g</p>
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
