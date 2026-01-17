import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MechanicCard, { Mechanic } from "@/components/MechanicCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const Mechanics = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("distance");
  const [locationInput, setLocationInput] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loadingMechanics, setLoadingMechanics] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "mechanics"),
      (snapshot) => {
        const fetchedMechanics: Mechanic[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.full_name || "Unknown Mechanic",
            specialty: data.services?.[0] || "General Mechanic",
            rating: data.rating || 0,
            reviewCount: data.total_reviews || 0,
            distance: "Unknown",
            responseTime: "20 min",
            verified: data.is_verified || false,
            available: data.is_available || false,
            availability_status: data.availability_status, // Ensure this is mapped!
            image: data.avatar_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop",
            services: data.services || [],
            coordinates: data.coordinates
          };
        });
        setMechanics(fetchedMechanics);
        setLoadingMechanics(false);
      },
      (error) => {
        console.error("Error fetching mechanics:", error);
        toast({
          title: "Error",
          description: "Failed to load mechanics.",
          variant: "destructive",
        });
        setLoadingMechanics(false);
      }
    );

    return () => unsubscribe();
  }, [toast]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocationInput(`Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`);
        setUserCoordinates({ lat: latitude, lng: longitude });

        // Update distances for all mechanics based on user location
        const updatedMechanics = mechanics.map(mech => {
          if (mech.coordinates) { // Assuming your mechanic data has coordinates
            const dist = calculateDistance(latitude, longitude, mech.coordinates.lat, mech.coordinates.lng);
            return { ...mech, distance: `${dist.toFixed(1)} km` };
          }
          // Fallback logic for demo/mock behavior if real coordinates aren't stored yet
          // Random distance between 0.1km and 5.0km for demo purposes if no real coords
          const randomDist = (Math.random() * 5).toFixed(1);
          return { ...mech, distance: `${randomDist} km` };
        });
        setMechanics(updatedMechanics);

        setLoadingLocation(false);
        toast({
          title: "Location Found",
          description: "Distances updated based on your location.",
        });
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Permission denied. Please enable location access in your browser settings.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "Location information is unavailable";
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "The request to get user location timed out";
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        setLoadingLocation(false);
      }
    );
  };

  const filteredMechanics = mechanics.filter(
    (mechanic) => {
      const matchesSearch =
        mechanic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mechanic.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mechanic.services.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesSearch;
    }
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Find <span className="text-gradient">Mechanics</span> Near You
            </h1>
            <p className="text-muted-foreground">
              Browse verified mechanics and get help fast
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, specialty, or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 bg-card border-border"
              />
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  placeholder="Your location"
                  className="pl-10 pr-10 h-12 w-48 bg-card border-border"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={handleGetLocation}
                  disabled={loadingLocation}
                >
                  {loadingLocation ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 h-12 bg-card border-border">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="response">Response Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground">
              Showing <span className="text-foreground font-medium">{filteredMechanics.length}</span> mechanics
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <span className="w-2 h-2 rounded-full bg-success" />
                Available Now
              </Button>
            </div>
          </div>

          {/* Mechanics Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingMechanics ? (
              // Loading Skeletons
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-[280px] rounded-xl bg-gray-100 animate-pulse" />
              ))
            ) : (
              filteredMechanics.map((mechanic, index) => (
                <div
                  key={mechanic.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <MechanicCard mechanic={mechanic} />
                </div>
              ))
            )}
          </div>

          {!loadingMechanics && filteredMechanics.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No mechanics found matching your search.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Mechanics;
