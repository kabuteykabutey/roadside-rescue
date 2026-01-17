import { useParams } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StarRating from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MapPin,
  Clock,
  CheckCircle,
  Phone,
  MessageSquare,
  Calendar,
  Star,
  ThumbsUp,
  User
} from "lucide-react";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, runTransaction, query, orderBy, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const MechanicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [mechanic, setMechanic] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Review State
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState<any[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Message State
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState("");

  useEffect(() => {
    const fetchMechanicAndReviews = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "mechanics", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setMechanic({ id: docSnap.id, ...docSnap.data() });

          // Fetch Reviews
          const reviewsQ = query(collection(db, "mechanics", id, "reviews"), orderBy("created_at", "desc"));
          const reviewsSnap = await getDocs(reviewsQ);
          const reviewsData = reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setReviews(reviewsData);
        } else {
          toast.error("Mechanic not found");
          navigate("/mechanics");
        }
      } catch (error) {
        console.error("Error fetching mechanic:", error);
        toast.error("Failed to load mechanic profile");
      } finally {
        setLoading(false);
      }
    };

    fetchMechanicAndReviews();
  }, [id, navigate]);

  const handleReviewSubmit = async () => {
    if (!auth.currentUser) {
      toast.error("Please log in to review");
      navigate("/login");
      return;
    }
    if (reviewRating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!reviewText.trim()) {
      toast.error("Please write a review");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const mechanicRef = doc(db, "mechanics", id!);

      await runTransaction(db, async (transaction) => {
        const mechanicDoc = await transaction.get(mechanicRef);
        if (!mechanicDoc.exists()) {
          throw "Mechanic does not exist!";
        }

        const currentData = mechanicDoc.data();
        const currentRating = currentData.rating || 0;
        const currentTotalReviews = currentData.total_reviews || 0;

        const newTotalReviews = currentTotalReviews + 1;
        // Calculate new average
        // (Old Avg * Old Count + New Rating) / New Count
        const newRating = ((currentRating * currentTotalReviews) + reviewRating) / newTotalReviews;

        // 1. Create Review Doc
        const newReviewRef = doc(collection(db, "mechanics", id!, "reviews"));
        transaction.set(newReviewRef, {
          user_id: auth.currentUser!.uid,
          user_email: auth.currentUser!.email,
          user_name: auth.currentUser!.displayName || "User", // Assuming displayName, otherwise fallback
          rating: reviewRating,
          comment: reviewText,
          created_at: serverTimestamp()
        });

        // 2. Update Mechanic Stats
        transaction.update(mechanicRef, {
          rating: parseFloat(newRating.toFixed(1)), // Round to 1 decimal place
          total_reviews: newTotalReviews
        });
      });

      toast.success("Review submitted successfully!");
      setReviewRating(0);
      setReviewText("");

      // Refresh to show new data
      window.location.reload();

    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleCustomMessageSubmit = async () => {
    if (!auth.currentUser) {
      toast.error("Please log in to send a message");
      navigate("/login");
      return;
    }
    if (!customMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsProcessing(true);
    try {
      await addDoc(collection(db, "bookings"), {
        user_id: auth.currentUser.uid,
        user_email: auth.currentUser.email,
        mechanic_id: id,
        mechanic_name: mechanic.full_name,
        mechanic_specialty: mechanic.services?.[0] || "General Mechanic",
        mechanic_image: mechanic.avatar_url,
        status: "pending",
        action_type: "Send Message",
        message: customMessage,
        created_at: serverTimestamp(),
      });

      toast.success("Message sent successfully!");
      setIsMessageOpen(false);
      setCustomMessage("");
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAction = async (action: string) => {
    if (!auth.currentUser) {
      toast.error(`Please log in to ${action}`);
      navigate("/login");
      return;
    }

    setIsProcessing(true);
    try {
      await addDoc(collection(db, "bookings"), {
        user_id: auth.currentUser.uid,
        user_email: auth.currentUser.email,
        mechanic_id: id,
        mechanic_name: mechanic.full_name,
        mechanic_specialty: mechanic.services?.[0] || "General Mechanic",
        mechanic_image: mechanic.avatar_url,
        status: "pending",
        action_type: action,
        created_at: serverTimestamp(),
      });

      if (action === "Call Now") {
        if (mechanic.phone) {
          window.location.href = `tel:${mechanic.phone}`;
          toast.success(`Calling ${mechanic.full_name}...`);
        } else {
          toast.error("Phone number not available");
        }
      } else {
        toast.success(`Request for ${action} sent!`);
      }
    } catch (error: any) {
      console.error("Error processing request:", error);
      toast.error("Failed to process request.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!mechanic) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Profile */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <div className="bg-card border border-border rounded-2xl p-6 card-glow">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="relative">
                    {mechanic.avatar_url ? (
                      <img
                        src={mechanic.avatar_url}
                        alt={mechanic.full_name}
                        className="w-32 h-32 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-2xl bg-neutral-200 flex items-center justify-center">
                        <User size={48} className="text-neutral-400" />
                      </div>
                    )}

                    {mechanic.is_available && (
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-success rounded-full border-4 border-card" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h1 className="text-2xl font-bold">{mechanic.full_name}</h1>
                          {mechanic.is_verified && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <p className="text-muted-foreground">{mechanic.services?.[0] || "Mechanic"}</p>
                      </div>
                      <Badge variant={mechanic.is_available ? "default" : "secondary"}>
                        {mechanic.is_available ? "Available Now" : "Busy"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 mt-4 text-sm">
                      <div className="flex items-center gap-2">
                        <StarRating rating={mechanic.rating || 0} size="sm" />
                        <span className="font-semibold">{mechanic.rating || 0}</span>
                        <span className="text-muted-foreground">({mechanic.total_reviews || 0} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{mechanic.location || "Location N/A"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>20 min response</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="text-center p-3 rounded-lg bg-secondary">
                        <p className="text-xl font-bold text-gradient">{mechanic.experience_years || 0} Years</p>
                        <p className="text-xs text-muted-foreground">Experience</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-secondary">
                        <p className="text-xl font-bold text-gradient">{(mechanic.total_reviews || 0) + 10}</p>
                        <p className="text-xs text-muted-foreground">Jobs Done</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-secondary">
                        <p className="text-xl font-bold text-gradient">98%</p>
                        <p className="text-xs text-muted-foreground">Satisfaction</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* About */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4">About</h2>
                <p className="text-muted-foreground">{mechanic.about || "No bio available."}</p>
              </div>

              {/* Services */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4">Services</h2>
                <div className="flex flex-wrap gap-2">
                  {mechanic.services?.map((service: string) => (
                    <span
                      key={service}
                      className="px-4 py-2 rounded-full bg-secondary text-sm"
                    >
                      {service}
                    </span>
                  ))}
                  {(!mechanic.services || mechanic.services.length === 0) && (
                    <p className="text-muted-foreground">No services listed.</p>
                  )}
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Reviews</h2>
                  <span className="text-sm text-muted-foreground">
                    {mechanic.total_reviews || 0} reviews
                  </span>
                </div>

                {/* Write a Review */}
                <div className="mb-8 p-4 bg-secondary/30 rounded-xl border border-border">
                  <h3 className="text-sm font-medium mb-3">Write a Review</h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className={`text-lg transition-transform hover:scale-110 ${star <= reviewRating ? 'text-yellow-400' : 'text-neutral-300'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <Textarea
                      placeholder="Share your experience..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="bg-white text-neutral-900 placeholder:text-neutral-500"
                    />
                    <Button
                      onClick={handleReviewSubmit}
                      disabled={isSubmittingReview}
                      className="self-end"
                    >
                      {isSubmittingReview ? "Submitting..." : "Post Review"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                              {review.user_email?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{review.user_email?.split('@')[0] || "User"}</p>
                              <div className="flex text-yellow-400 text-xs gap-0.5">
                                {Array.from({ length: review.rating }).map((_, i) => (
                                  <span key={i}>★</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {review.created_at?.seconds ? formatDistanceToNow(new Date(review.created_at.seconds * 1000), { addSuffix: true }) : 'Just now'}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 pl-10">
                          {review.comment}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No reviews yet. Be the first to review!
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <div className="bg-card border border-border rounded-2xl p-6 card-glow">
                  <h3 className="font-semibold mb-4">Request Service</h3>

                  <div className="space-y-3">
                    <Button
                      className="w-full h-12"
                      size="lg"
                      onClick={() => handleAction("Call Now")}
                      disabled={isProcessing}
                    >
                      <Phone className="h-5 w-5" />
                      {isProcessing ? "Processing..." : "Call Now"}
                    </Button>

                    <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-12"
                          size="lg"
                          disabled={isProcessing}
                        >
                          <MessageSquare className="h-5 w-5" />
                          Send Message
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Send Message to {mechanic.full_name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <Textarea
                            placeholder="Describe your emergency or question..."
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            className="bg-white text-neutral-900 placeholder:text-neutral-500 min-h-[120px]"
                          />
                          <Button
                            onClick={handleCustomMessageSubmit}
                            disabled={isProcessing}
                            className="w-full"
                          >
                            {isProcessing ? "Sending..." : "Send Message"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="secondary"
                      className="w-full h-12"
                      size="lg"
                      onClick={() => handleAction("Schedule Later")}
                      disabled={isProcessing}
                    >
                      <Calendar className="h-5 w-5" />
                      Schedule Later
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Average response time: 20 mins
                  </p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-semibold mb-4">Working Hours</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mon - Fri</span>
                      <span>7:00 AM - 9:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Saturday</span>
                      <span>8:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sunday</span>
                      <span>9:00 AM - 5:00 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MechanicProfile;
