import MechanicCard, { Mechanic } from "./MechanicCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const mockMechanics: Mechanic[] = [
  {
    id: "1",
    name: "James Wilson",
    specialty: "Engine & Transmission Specialist",
    rating: 4.9,
    reviewCount: 127,
    distance: "1.2 km",
    responseTime: "10 min",
    verified: true,
    available: true,
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop",
    services: ["Engine Repair", "Transmission", "Diagnostics", "Oil Change"],
  },
  {
    id: "2",
    name: "Sarah Chen",
    specialty: "Auto Electrician",
    rating: 4.8,
    reviewCount: 89,
    distance: "2.5 km",
    responseTime: "15 min",
    verified: true,
    available: true,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop",
    services: ["Battery", "Alternator", "Starter Motor", "Wiring"],
  },
  {
    id: "3",
    name: "Mike Rodriguez",
    specialty: "Tire & Brake Expert",
    rating: 4.7,
    reviewCount: 156,
    distance: "3.1 km",
    responseTime: "12 min",
    verified: true,
    available: false,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    services: ["Tire Change", "Brake Repair", "Wheel Alignment", "Suspension"],
  },
];

const FeaturedMechanics = () => {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(222_47%_15%)_0%,_transparent_70%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Top-Rated <span className="text-gradient">Mechanics</span> Near You
            </h2>
            <p className="text-muted-foreground max-w-lg">
              Trusted professionals with proven track records. Every mechanic is 
              verified and rated by real customers.
            </p>
          </div>
          <Link to="/mechanics" className="hidden md:block">
            <Button variant="outline" className="gap-2">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockMechanics.map((mechanic, index) => (
            <div 
              key={mechanic.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <MechanicCard mechanic={mechanic} />
            </div>
          ))}
        </div>

        <Link to="/mechanics" className="md:hidden mt-8 block">
          <Button variant="outline" className="w-full gap-2">
            View All Mechanics <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default FeaturedMechanics;
