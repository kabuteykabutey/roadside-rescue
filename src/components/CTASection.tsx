import { Button } from "@/components/ui/button";
import { Wrench, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsl(32_95%_55%_/_0.15)_0%,_transparent_60%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary/10 border border-primary/20 mb-8">
            <Wrench className="h-10 w-10 text-primary" />
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Are You a <span className="text-gradient">Mechanic</span>?
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our network of trusted mechanics and grow your business. 
            Get access to customers who need your help, right in your area.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register-mechanic">
              <Button variant="hero" size="xl" className="gap-2">
                Register as Mechanic <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button variant="heroOutline" size="xl">
                Learn More
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <div>
              <p className="text-3xl font-bold text-gradient">$0</p>
              <p className="text-sm text-muted-foreground">To Get Started</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gradient">1000+</p>
              <p className="text-sm text-muted-foreground">Monthly Requests</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gradient">85%</p>
              <p className="text-sm text-muted-foreground">Repeat Customers</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
