import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  MapPin,
  Search,
  UserCheck,
  Wrench,
  Star,
  Shield,
  Clock,
  CheckCircle2,
  Car,
  Phone,
  MessageSquare,
  ArrowRight,
  ArrowDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HowItWorksPage = () => {
  const navigate = useNavigate();

  const steps = [
    {
      number: "01",
      icon: <Car className="h-10 w-10" />,
      title: "Your Car Breaks Down",
      description: "Whether it's a flat tire, dead battery, or engine trouble - we've got you covered wherever you are.",
      color: "from-red-500/20 to-red-500/5",
      iconBg: "bg-red-500/20",
      iconColor: "text-red-400"
    },
    {
      number: "02",
      icon: <MapPin className="h-10 w-10" />,
      title: "Share Your Location",
      description: "Open MechRadii and let us detect your location automatically, or enter it manually.",
      color: "from-blue-500/20 to-blue-500/5",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400"
    },
    {
      number: "03",
      icon: <Search className="h-10 w-10" />,
      title: "Find Nearby Mechanics",
      description: "Browse through verified mechanics in your area. See their ratings, specialties, and estimated arrival times.",
      color: "from-purple-500/20 to-purple-500/5",
      iconBg: "bg-purple-500/20",
      iconColor: "text-purple-400"
    },
    {
      number: "04",
      icon: <UserCheck className="h-10 w-10" />,
      title: "Choose Your Mechanic",
      description: "Select the mechanic that best fits your needs based on reviews, price, and availability.",
      color: "from-emerald-500/20 to-emerald-500/5",
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-400"
    },
    {
      number: "05",
      icon: <Wrench className="h-10 w-10" />,
      title: "Get Your Car Fixed",
      description: "Your mechanic arrives at your location and repairs your vehicle on the spot.",
      color: "from-primary/20 to-primary/5",
      iconBg: "bg-primary/20",
      iconColor: "text-primary"
    },
    {
      number: "06",
      icon: <Star className="h-10 w-10" />,
      title: "Rate & Review",
      description: "Share your experience to help other drivers find reliable mechanics.",
      color: "from-yellow-500/20 to-yellow-500/5",
      iconBg: "bg-yellow-500/20",
      iconColor: "text-yellow-400"
    }
  ];

  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Verified Mechanics",
      description: "All mechanics are background-checked and verified for your safety"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Fast Response",
      description: "Average mechanic arrival time is under 30 minutes"
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Real-Time Chat",
      description: "Communicate directly with your mechanic through the app"
    },
    {
      icon: <CheckCircle2 className="h-8 w-8" />,
      title: "Transparent Pricing",
      description: "Know the cost upfront before you confirm your booking"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 mb-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              How <span className="text-gradient">MechRadii</span> Works
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              From breakdown to back on the road in 6 simple steps.
              We connect you with verified mechanics when you need them most.
            </p>
          </div>
        </section>

        {/* Visual Flow Diagram */}
        <section className="container mx-auto px-4 mb-20">
          <div className="relative">
            {/* Connection Line - Desktop */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-red-500/30 via-primary/30 to-yellow-500/30 -translate-y-1/2 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="group relative animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`relative p-8 rounded-2xl bg-gradient-to-b ${step.color} border border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-2 card-glow`}>
                    {/* Step Number */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">{step.number}</span>
                    </div>

                    {/* Icon */}
                    <div className={`w-20 h-20 rounded-2xl ${step.iconBg} flex items-center justify-center mb-6 ${step.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                      {step.icon}
                    </div>

                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>

                    {/* Arrow connector for mobile */}
                    {index < steps.length - 1 && (
                      <div className="lg:hidden flex justify-center mt-6">
                        <ArrowDown className="h-6 w-6 text-primary/50 animate-bounce" />
                      </div>
                    )}
                  </div>

                  {/* Arrow connector for desktop */}
                  {index < steps.length - 1 && (index + 1) % 3 !== 0 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-4 -translate-y-1/2 z-20">
                      <ArrowRight className="h-8 w-8 text-primary/50" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Diagram Section */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                The <span className="text-gradient">Connection</span> Process
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                See how MechRadii seamlessly connects you with the right mechanic
              </p>
            </div>

            {/* Visual Connection Diagram */}
            <div className="max-w-4xl mx-auto">
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
                {/* User Side */}
                <div className="flex-1 p-8 rounded-2xl bg-card border border-border text-center group hover:border-primary/50 transition-all duration-300">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Car className="h-12 w-12 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">You</h3>
                  <p className="text-muted-foreground text-sm">Need roadside assistance</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>Share location</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>Describe issue</span>
                    </div>
                  </div>
                </div>

                {/* Connection Animation */}
                <div className="flex flex-col items-center gap-2 py-4">
                  <div className="hidden md:flex items-center gap-2">
                    <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-primary rounded-full animate-pulse" />
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Search className="h-6 w-6 text-primary animate-pulse" />
                    </div>
                    <div className="w-16 h-1 bg-gradient-to-r from-primary to-emerald-500 rounded-full animate-pulse" />
                  </div>
                  <div className="md:hidden flex flex-col items-center gap-2">
                    <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-primary rounded-full animate-pulse" />
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Search className="h-6 w-6 text-primary animate-pulse" />
                    </div>
                    <div className="w-1 h-8 bg-gradient-to-b from-primary to-emerald-500 rounded-full animate-pulse" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">MechRadii Matching</span>
                </div>

                {/* Mechanic Side */}
                <div className="flex-1 p-8 rounded-2xl bg-card border border-border text-center group hover:border-primary/50 transition-all duration-300">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Wrench className="h-12 w-12 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Mechanic</h3>
                  <p className="text-muted-foreground text-sm">Verified professional</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span>Rated & reviewed</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4 text-primary" />
                      <span>Background checked</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose <span className="text-gradient">MechRadii</span>?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We're not just connecting you with mechanics - we're ensuring your safety and peace of mind
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 card-glow text-center group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-b from-secondary/30 to-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Join thousands of drivers who trust MechRadii for reliable roadside assistance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="hero"
                size="xl"
                onClick={() => navigate("/mechanics")}
              >
                Find a Mechanic Now
              </Button>
              <Button
                variant="heroOutline"
                size="xl"
                onClick={() => navigate("/register-mechanic")}
              >
                Become a Mechanic
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;
