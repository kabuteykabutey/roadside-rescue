import { Star, MapPin, Clock, CheckCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { toast } from "sonner";

export interface Mechanic {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  distance: string;
  responseTime: string;
  verified: boolean;
  available: boolean; // Keep for backward compatibility or remove if replaced
  availability_status?: 'available' | 'busy'; // New field
  image: string;
  services: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface MechanicCardProps {
  mechanic: Mechanic;
}

const MechanicCard = ({ mechanic }: MechanicCardProps) => {
  const navigate = useNavigate();
  const [isRequesting, setIsRequesting] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState("");

  const handleRequestHelp = async () => {
    if (!auth.currentUser) {
      toast.error("Please log in to request a mechanic");
      navigate("/login");
      return;
    }

    setIsRequesting(true);
    try {
      await addDoc(collection(db, "bookings"), {
        user_id: auth.currentUser.uid,
        user_email: auth.currentUser.email,
        mechanic_id: mechanic.id,
        mechanic_name: mechanic.name,
        mechanic_specialty: mechanic.specialty,
        mechanic_image: mechanic.image,
        action_type: "Emergency Request",
        message: customMessage,
        status: "pending",
        created_at: serverTimestamp(),
      });
      toast.success(`Request sent to ${mechanic.name}!`);
      setIsMessageOpen(false);
      setCustomMessage("");
    } catch (error: any) {
      console.error("Error requesting help:", error);
      toast.error("Failed to send request. Please try again.");
    } finally {
      setIsRequesting(false);
    }
  };
  return (
    <div className="group p-6 rounded-2xl bg-card border border-border card-glow hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
      <div className="flex gap-4">
        <div className="relative">
          <img
            src={mechanic.image}
            alt={mechanic.name}
            className="w-20 h-20 rounded-xl object-cover"
          />
          {mechanic.available && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-card" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{mechanic.name}</h3>
                {mechanic.verified && (
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{mechanic.specialty}</p>
            </div>
            {(() => {
              const status = mechanic.availability_status || (mechanic.available ? 'available' : 'busy');
              const isAvailable = status === 'available';
              return (
                <Badge
                  variant={isAvailable ? "default" : "destructive"}
                  className={`flex-shrink-0 ${!isAvailable && "bg-red-100 text-red-700 hover:bg-red-200 border-red-200"}`}
                >
                  {isAvailable ? "Available" : "Busy/On Job"}
                </Badge>
              );
            })()}
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="font-medium text-foreground">{mechanic.rating}</span>
              <span>({mechanic.reviewCount})</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{mechanic.distance}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{mechanic.responseTime}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {mechanic.services?.slice(0, 3).map((service) => (
              <span
                key={service}
                className="px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground"
              >
                {service}
              </span>
            ))}
            {mechanic.services?.length > 3 && (
              <span className="px-2 py-1 text-xs rounded-md bg-secondary text-muted-foreground">
                +{mechanic.services.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-4 pt-4 border-t border-border">
        <Link to={`/mechanic/${mechanic.id}`} className="flex-1">
          <Button variant="outline" className="w-full">View Profile</Button>
        </Link>
        <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
          <DialogTrigger asChild>
            <Button className="flex-1">Request Help</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Emergency Assistance</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label className="mb-2 block">Describe your emergency (Optional)</Label>
                <Textarea
                  placeholder="E.g., Flat tire, car won't start, out of gas..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsMessageOpen(false)}>Cancel</Button>
                <Button onClick={handleRequestHelp} disabled={isRequesting}>
                  {isRequesting ? "Sending..." : "Send Request"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MechanicCard;
