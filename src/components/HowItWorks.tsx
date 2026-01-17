import { Search, UserCheck, Wrench, Star } from "lucide-react";

const steps = [
  {
    icon: <Search className="h-8 w-8" />,
    title: "Search",
    description: "Enter your location and find verified mechanics nearby",
  },
  {
    icon: <UserCheck className="h-8 w-8" />,
    title: "Choose",
    description: "Browse profiles, ratings, and reviews to pick your mechanic",
  },
  {
    icon: <Wrench className="h-8 w-8" />,
    title: "Get Help",
    description: "Your mechanic arrives and fixes your vehicle on the spot",
  },
  {
    icon: <Star className="h-8 w-8" />,
    title: "Rate",
    description: "Share your experience to help others find great service",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How <span className="text-gradient">MechRadii</span> Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Getting roadside help has never been easier. Follow these simple steps
            to connect with a verified mechanic in minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative text-center group"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/50 to-primary/10" />
              )}

              <div className="relative z-10 mb-6 mx-auto w-24 h-24 rounded-2xl bg-card border border-border flex items-center justify-center text-primary group-hover:border-primary/50 group-hover:primary-glow transition-all duration-300">
                {step.icon}
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                  {index + 1}
                </span>
              </div>

              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
