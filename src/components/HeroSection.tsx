import { Button } from "@/components/ui/button";
import { MapPin, Clock, Shield, Star } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(32_95%_55%_/_0.1)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(222_47%_20%)_0%,_transparent_50%)]" />
      
      {/* Animated Circles */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-2xl animate-float" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm text-muted-foreground">24/7 Emergency Assistance</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
              Get Help <span className="text-gradient">Fast</span> When You <br />
              <span className="text-gradient">Break Down</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-lg">
              Connect with verified mechanics near you in minutes. No more waiting, 
              no more stress. Just reliable roadside assistance when you need it most.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/mechanics">
                <Button variant="hero" size="xl">
                  <MapPin className="h-5 w-5" />
                  Find Mechanics Near Me
                </Button>
              </Link>
              <Link to="/register-mechanic">
                <Button variant="heroOutline" size="xl">
                  Join as Mechanic
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-8">
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gradient">500+</p>
                <p className="text-sm text-muted-foreground">Verified Mechanics</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gradient">15 min</p>
                <p className="text-sm text-muted-foreground">Avg. Response Time</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gradient">4.8★</p>
                <p className="text-sm text-muted-foreground">Customer Rating</p>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="relative lg:pl-12">
            <div className="grid grid-cols-2 gap-4">
              <FeatureCard 
                icon={<MapPin className="h-6 w-6" />}
                title="Location Based"
                description="Find mechanics within your radius instantly"
                delay="0"
              />
              <FeatureCard 
                icon={<Clock className="h-6 w-6" />}
                title="Quick Response"
                description="Get help in minutes, not hours"
                delay="100"
              />
              <FeatureCard 
                icon={<Shield className="h-6 w-6" />}
                title="Verified Pros"
                description="All mechanics are background checked"
                delay="200"
              />
              <FeatureCard 
                icon={<Star className="h-6 w-6" />}
                title="Rated & Reviewed"
                description="Choose based on real customer feedback"
                delay="300"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  delay 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  delay: string;
}) => (
  <div 
    className="p-6 rounded-2xl bg-card border border-border card-glow hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4">
      {icon}
    </div>
    <h3 className="font-semibold mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default HeroSection;
