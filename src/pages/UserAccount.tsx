import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, Wrench, Star, Clock, Pencil, MessageCircle } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import EditProfileDialog from "@/components/EditProfileDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Profile {
  full_name: string;
  email: string;
  created_at: string;
  avatar_url?: string | null;
}

interface Booking {
  id: string;
  mechanic_id: string;
  mechanic_name: string;
  mechanic_specialty: string;
  mechanic_image: string;
  status: string;
  action_type: string;
  message?: string;
  mechanic_reply?: string;
  created_at: any;
}


const UserAccount = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [selectedMechanic, setSelectedMechanic] = useState<{ id: string, name: string } | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        setUser(user);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.uid],
    queryFn: async () => {
      if (!user) return null;
      const docRef = doc(db, "profiles", user.uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      const data = docSnap.data();
      return {
        full_name: data.full_name,
        email: data.email,
        created_at: data.created_at?.toDate()?.toISOString() || new Date().toISOString(),
        avatar_url: data.avatar_url,
      } as Profile;
    },
    enabled: !!user,
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["bookings", user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const q = query(
        collection(db, "bookings"),
        where("user_id", "==", user.uid)
      );
      try {
        const querySnapshot = await getDocs(q);
        const bookingsData: Booking[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          bookingsData.push({ id: doc.id, ...data } as Booking);
        });

        // Client-side sort to avoid requiring a composite index
        return bookingsData.sort((a, b) => {
          const timeA = a.created_at?.toMillis?.() || 0;
          const timeB = b.created_at?.toMillis?.() || 0;
          return timeB - timeA;
        });
      } catch (error: any) {
        console.error("Firestore Query Error:", error);
        toast.error(`Firestore Error: ${error.message}`);
        return [];
      }
    },
    enabled: !!user,
  });

  const { data: isMechanic } = useQuery({
    queryKey: ["isMechanic", user?.uid],
    queryFn: async () => {
      if (!user) return false;
      const docRef = doc(db, "mechanics", user.uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    },
    enabled: !!user,
  });

  const loading = profileLoading || bookingsLoading;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Mock data for bookings (will be replaced with real data later)
  const bookingStats = {
    totalBookings: bookings.length,
    completedBookings: bookings.filter(b => b.status === "completed" || b.status === "pending").length,
    requestedMechanics: bookings,
  };

  // Group bookings by mechanic to create a contacts list
  const mechanicContacts = bookings.reduce((acc: any[], current) => {
    const x = acc.find(item => item.id === current.mechanic_id);
    if (!x) {
      acc.push({
        id: current.mechanic_id,
        name: current.mechanic_name,
        specialty: current.mechanic_specialty,
        image: current.mechanic_image,
        last_contact: current.created_at
      });
    }
    return acc;
  }, []);

  const handleSendMessage = async () => {
    if (!user || !selectedMechanic || !customMessage.trim()) return;

    setIsSending(true);
    try {
      await addDoc(collection(db, "bookings"), {
        user_id: user.uid,
        user_email: user.email,
        mechanic_id: selectedMechanic.id,
        mechanic_name: selectedMechanic.name,
        status: "pending",
        action_type: "Message",
        message: customMessage,
        created_at: serverTimestamp(),
      });
      toast.success(`Message sent to ${selectedMechanic.name}`);
      setIsMessageOpen(false);
      setCustomMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  // Don't block the entire page - show skeleton UI instead

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Profile Header */}
          <Card className="mb-8 card-glow">
            <CardContent className="pt-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {profileLoading ? (
                  <>
                    <div className="h-24 w-24 rounded-full bg-secondary animate-pulse" />
                    <div className="text-center md:text-left flex-1 space-y-3">
                      <div className="h-8 w-48 bg-secondary animate-pulse rounded mx-auto md:mx-0" />
                      <div className="h-4 w-64 bg-secondary animate-pulse rounded mx-auto md:mx-0" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative group cursor-pointer" onClick={() => setEditDialogOpen(true)}>
                      <Avatar className="h-24 w-24 border-4 border-primary/20">
                        <AvatarImage src={profile?.avatar_url || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                          {profile?.full_name ? getInitials(profile.full_name) : <User className="h-10 w-10" />}
                        </AvatarFallback>
                      </Avatar>
                      {/* Pencil icon overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Pencil className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="text-center md:text-left flex-1">
                      <h1 className="text-2xl font-bold mb-2">
                        {profile?.full_name || "User"}
                      </h1>
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {profile?.email || user?.email}
                        </span>
                        <span className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Joined {profile?.created_at ? formatDate(profile.created_at) : "recently"}
                        </span>
                        {isMechanic && (
                          <Badge variant="secondary" className="mt-2 md:mt-0 w-fit">Mechanic Account</Badge>
                        )}
                      </div>
                    </div>
                  </>
                )}
                <EditProfileDialog
                  profile={profile || null}
                  userId={user?.uid || ""}
                  onProfileUpdated={() => queryClient.invalidateQueries({ queryKey: ["profile", user?.uid] })}
                  open={editDialogOpen}
                  onOpenChange={setEditDialogOpen}
                />
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="card-glow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Wrench className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    {bookingsLoading ? (
                      <div className="h-8 w-12 bg-secondary animate-pulse rounded" />
                    ) : (
                      <p className="text-2xl font-bold">{bookingStats.totalBookings}</p>
                    )}
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-500/10">
                    <Star className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    {bookingsLoading ? (
                      <div className="h-8 w-12 bg-secondary animate-pulse rounded" />
                    ) : (
                      <p className="text-2xl font-bold">{bookingStats.completedBookings}</p>
                    )}
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/10">
                    <Clock className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          {!isMechanic ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Requests Column (Left 2/3) */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="card-glow border-primary/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Wrench className="h-5 w-5 text-primary" />
                      Active Requests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bookingsLoading ? (
                      <div className="space-y-4">
                        {[1, 2].map((i) => (
                          <div key={i} className="h-32 rounded-xl bg-secondary animate-pulse" />
                        ))}
                      </div>
                    ) : bookingStats.requestedMechanics.length > 0 ? (
                      <div className="space-y-4">
                        {bookingStats.requestedMechanics.map((booking) => (
                          <div key={booking.id} className="p-4 rounded-xl bg-secondary/50 border border-border/50 flex flex-col gap-3 transition-all hover:border-primary/30">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-12 w-12 rounded-lg shadow-sm border border-border/50">
                                <AvatarImage src={booking.mechanic_image} className="object-cover" />
                                <AvatarFallback><Wrench /></AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <p className="font-semibold truncate text-foreground">{booking.mechanic_name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{booking.mechanic_specialty}</p>
                                    <Badge variant="outline" className="mt-1.5 text-[10px] uppercase tracking-wider h-5 px-1.5 border-primary/20 bg-primary/5 text-primary">
                                      {booking.action_type || "Request"}
                                    </Badge>
                                  </div>
                                  <Badge
                                    variant={booking.status === 'accepted' ? 'default' : booking.status === 'rejected' ? 'destructive' : booking.status === 'completed' ? 'secondary' : 'outline'}
                                    className="capitalize shadow-sm"
                                  >
                                    {booking.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Full Message History */}
                            {(booking.message || (booking as any).user_note || booking.mechanic_reply) && (
                              <div className="text-sm space-y-3 mt-1 pt-3 border-t border-border/50">
                                {(booking.message || (booking as any).user_note) && (
                                  <div className="bg-background/40 p-3 rounded-lg border border-border/30">
                                    <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground block mb-1">Your Note</span>
                                    <p className="text-muted-foreground leading-relaxed italic text-xs">"{booking.message || (booking as any).user_note}"</p>
                                  </div>
                                )}
                                {booking.mechanic_reply && (
                                  <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                                    <span className="text-[10px] font-bold uppercase tracking-tight text-primary block mb-1">Mechanic Reply</span>
                                    <p className="text-foreground leading-relaxed font-medium text-xs">{booking.mechanic_reply}</p>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                              <Calendar className="h-3 w-3" />
                              {booking.created_at?.toDate ? formatDate(booking.created_at.toDate().toISOString()) : "Recently"}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                        <Wrench className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p className="font-medium">No active requests</p>
                        <Button variant="link" size="sm" onClick={() => navigate("/mechanics")}>Find a mechanic</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Contacts Column (Right 1/3) */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="card-glow border-blue-500/10 h-full flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      Your Mechanics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    {bookingsLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-20 rounded-xl bg-secondary animate-pulse" />
                        ))}
                      </div>
                    ) : mechanicContacts.length > 0 ? (
                      <div className="space-y-4">
                        {mechanicContacts.map((contact: any) => (
                          <div key={contact.id} className="p-4 rounded-xl bg-secondary/30 border border-border/50 space-y-4 transition-all hover:border-primary/20">
                            <div
                              className="flex items-center gap-3 cursor-pointer group"
                              onClick={() => navigate(`/mechanic/${contact.id}`)}
                            >
                              <Avatar className="h-12 w-12 rounded-lg border-2 border-primary/10 transition-transform group-hover:scale-105">
                                <AvatarImage src={contact.image} className="object-cover" />
                                <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{contact.name}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{contact.specialty}</p>
                              </div>
                            </div>

                            <Dialog open={isMessageOpen && selectedMechanic?.id === contact.id} onOpenChange={(open) => {
                              if (!open) setIsMessageOpen(false);
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full h-9 text-xs gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all shadow-sm"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent navigation to profile
                                    setSelectedMechanic({ id: contact.id, name: contact.name });
                                    setIsMessageOpen(true);
                                  }}
                                >
                                  <MessageCircle className="h-3.5 w-3.5" />
                                  Send Message
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Message {contact.name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                  <Textarea
                                    placeholder="Type your message here..."
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    className="min-h-[120px]"
                                  />
                                  <Button
                                    onClick={handleSendMessage}
                                    className="w-full"
                                    disabled={isSending || !customMessage.trim()}
                                  >
                                    {isSending ? "Sending..." : "Send Message"}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl opacity-60">
                        <User className="h-8 w-8 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">No mechanics yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            /* Mechanic View (Keep existing behavior: dashboard redirect or simple message) */
            <div className="text-center py-20">
              <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl max-w-md mx-auto">
                <Wrench className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Mechanic Dashboard</h2>
                <p className="text-muted-foreground mb-6">
                  You are registered as a mechanic. Please use your dedicated dashboard to manage service requests.
                </p>
                <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default UserAccount;
