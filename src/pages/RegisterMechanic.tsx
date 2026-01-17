import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Wrench, Mail, Lock, User, Phone, MapPin, Eye, EyeOff, Camera, RefreshCw, Calendar, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, query, where, orderBy, getDocs, collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRef, useEffect } from "react";
import { countries } from "@/utils/countries";
import { formatDistanceToNow } from "date-fns";

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const services = [
  "Engine Repair",
  "Transmission",
  "Brake Service",
  "Tire Change",
  "Battery Service",
  "Auto Electric",
  "Oil Change",
  "Diagnostics",
  "Roadside Assistance",
  "Towing",
];

// Helper Component for displaying requests
const MechanicRequestsList = ({ mechanicId }: { mechanicId: string }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Reply State
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!mechanicId) return;

    console.log("Fetching requests (no sort) for:", mechanicId);
    const q = query(
      collection(db, "bookings"),
      where("mechanic_id", "==", mechanicId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as any[];
      // Sort in memory
      data.sort((a, b) => {
        const timeA = a.created_at?.seconds || 0;
        const timeB = b.created_at?.seconds || 0;
        return timeB - timeA;
      });
      setRequests(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching requests:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [mechanicId]);

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    setProcessingId(requestId);
    try {
      await updateDoc(doc(db, "bookings", requestId), {
        status: newStatus
      });

      if (newStatus === 'accepted') {
        // Automatically set mechanic to busy
        await updateDoc(doc(db, "mechanics", mechanicId), {
          availability_status: 'busy'
        });
        toast.success("Job Accepted! You are now marked as Busy.");
      } else if (newStatus === 'rejected') {
        toast.success("Job Rejected.");
      } else if (newStatus === 'completed') {
        // Automatically set mechanic to available
        await updateDoc(doc(db, "mechanics", mechanicId), {
          availability_status: 'available'
        });
        toast.success("Job Completed! You are now Available.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReplySubmit = async (requestId: string) => {
    if (!replyText.trim()) return;

    setProcessingId(requestId);
    try {
      // Find current request to append text if needed
      const currentRequest = requests.find(r => r.id === requestId);
      const existingReply = currentRequest?.mechanic_reply || "";
      const newReplyContent = existingReply
        ? `${existingReply}\n\n[${new Date().toLocaleTimeString()}] ${replyText}`
        : replyText;

      await updateDoc(doc(db, "bookings", requestId), {
        mechanic_reply: newReplyContent,
        mechanic_reply_at: serverTimestamp(),
      });
      toast.success("Reply sent!");
      setReplyingTo(null);
      setReplyText("");
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Failed to send reply");
    } finally {
      setProcessingId(null);
    }
  };

  // Filter requests to valid/active ones
  const filteredRequests = requests.filter(req =>
    req.status !== 'rejected' && req.status !== 'completed'
  );

  if (loading) {
    return <div className="text-sm text-neutral-500">Loading messages...</div>;
  }

  if (filteredRequests.length === 0) {
    return (
      <div className="text-center py-8 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
        <p className="text-neutral-500">No active requests.</p>
        <p className="text-xs text-neutral-400 mt-1">Completed and rejected jobs are hidden.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredRequests.map((request) => (
        <div key={request.id} className="p-4 rounded-xl bg-card border border-border shadow-sm hover:border-primary/20 transition-all">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg shadow-sm ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              request.status === 'accepted' ? 'bg-green-100 text-green-700' :
                request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-neutral-100 text-neutral-700'
              }`}>
              {request.action_type === "Call Now" ? <Phone size={20} /> :
                request.action_type === "Send Message" ? <Mail size={20} /> :
                  <Calendar size={20} />}
            </div>

            <div className="flex-grow space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">
                    {request.action_type || "Service Request"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    From: {request.user_email || "Unknown User"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {request.created_at?.seconds ? formatDistanceToNow(new Date(request.created_at.seconds * 1000), { addSuffix: true }) : 'Just now'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    request.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-neutral-100 text-neutral-600'
                    }`}>
                    {request.status}
                  </span>
                </div>
              </div>

              {/* User Message */}
              {request.message && (
                <div className="text-sm text-neutral-700 bg-secondary/30 p-3 rounded-lg border border-border/50">
                  <span className="font-medium text-xs text-muted-foreground block mb-1">Message:</span>
                  "{request.message}"
                </div>
              )}

              {/* Mechanic Reply Display */}
              {request.mechanic_reply && (
                <div className="text-sm text-primary/80 bg-primary/5 p-3 rounded-lg border border-primary/10 ml-4 whitespace-pre-wrap">
                  <span className="font-medium text-xs text-primary/60 block mb-1">Your Reply:</span>
                  {request.mechanic_reply}
                </div>
              )}

              {/* Actions Area */}
              <div className="pt-2 flex flex-wrap gap-2">
                {/* Accept/Reject Logic for Pending Requests */}
                {request.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white h-8"
                      onClick={() => handleUpdateStatus(request.id, 'accepted')}
                      disabled={!!processingId}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" /> Accept Job
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8"
                      onClick={() => handleUpdateStatus(request.id, 'rejected')}
                      disabled={!!processingId}
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </>
                )}

                {/* Complete Job Logic for Accepted Requests */}
                {request.status === 'accepted' && (
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white h-8"
                    onClick={() => handleUpdateStatus(request.id, 'completed')}
                    disabled={!!processingId}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" /> Complete Job
                  </Button>
                )}

                {/* Reply Button / Toggle - Always show unless currently replying */}
                {replyingTo !== request.id && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8"
                    onClick={() => {
                      setReplyingTo(request.id);
                      setReplyText("");
                    }}
                  >
                    {request.mechanic_reply ? "Add Note / Reply Again" : "Reply"}
                  </Button>
                )}
              </div>

              {/* Reply Input Area */}
              {replyingTo === request.id && (
                <div className="mt-3 flex gap-2 animate-in fade-in slide-in-from-top-1">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="min-h-[60px] text-sm"
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleReplySubmit(request.id)}
                      disabled={!!processingId || !replyText.trim()}
                    >
                      Send
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setReplyingTo(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const RegisterMechanic = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    experience: "",
    about: "",
    selectedServices: [] as string[],
    countryCode: "+233",
    profileImage: null as string | null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // New state for existing mechanic profile
  const [mechanicProfile, setMechanicProfile] = useState<any | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  // Check if user is already a mechanic
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const mechanicDoc = await getDoc(doc(db, "mechanics", user.uid));
          if (mechanicDoc.exists()) {
            setMechanicProfile(mechanicDoc.data());
          }
        } catch (error) {
          console.error("Error fetching mechanic profile:", error);
        }
      }
      setCheckingProfile(false);
    });

    return () => unsubscribe();
  }, []);

  // Pre-fill form when entering edit mode
  useEffect(() => {
    if (isEditing && mechanicProfile) {
      // Parse phone number to separate code and number if possible, currently simple slice or just put it all in
      // Assuming phone format "+233xxxxxxxxx"
      let phoneNum = mechanicProfile.phone || "";
      let code = "+233";
      // Simple check if it starts with +233
      if (phoneNum.startsWith("+233")) {
        phoneNum = phoneNum.replace("+233", "");
      }

      setFormData({
        name: mechanicProfile.full_name || "",
        email: mechanicProfile.email || "",
        password: "", // Don't pre-fill password
        phone: phoneNum,
        location: mechanicProfile.location || "",
        experience: mechanicProfile.experience_years?.toString() || "",
        about: mechanicProfile.about || "",
        selectedServices: mechanicProfile.services || [],
        countryCode: code,
        profileImage: mechanicProfile.avatar_url || null,
      });
    }
  }, [isEditing, mechanicProfile]);


  const handleServiceToggle = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(service)
        ? prev.selectedServices.filter((s) => s !== service)
        : [...prev.selectedServices, service],
    }));
  };

  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      setIsCameraActive(true);
      // Note: attachment happens in useEffect after re-render
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        try {
          const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setFormData(prev => ({ ...prev, profileImage: imageDataUrl }));
          stopCamera();
          toast.success("Photo captured successfully!");
        } catch (err) {
          console.error("Error capturing photo:", err);
          toast.error("Failed to capture photo.");
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.profileImage) {
      toast.error("Please take a profile photo");
      setIsLoading(false);
      return;
    }

    try {
      let user = auth.currentUser;
      let photoURL = formData.profileImage;

      // Only upload new image if it's a data URL (base64), otherwise assume it's an existing URL
      if (formData.profileImage.startsWith("data:")) {
        // Create user if not editing (and not logged in - though for editing you must be logged in)
        if (!isEditing && !user) {
          const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
          user = userCredential.user;
        } else if (!user) {
          // Fallback if somehow editing but no user?
          throw new Error("You must be logged in to edit profile");
        }

        // Upload Profile Image to Cloudinary
        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append('file', formData.profileImage);
        cloudinaryFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        cloudinaryFormData.append('folder', `mechanics/${user.uid}`);

        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: cloudinaryFormData,
          }
        );

        if (!cloudinaryResponse.ok) {
          throw new Error('Failed to upload image to Cloudinary');
        }

        const cloudinaryData = await cloudinaryResponse.json();
        photoURL = cloudinaryData.secure_url;
      } else {
        // Existing URL, assume user is already defined if we are here (editing mode)
        if (!user) throw new Error("Authentication required");
      }

      if (!user) throw new Error("Authentication failed"); // Safety check

      const commonData = {
        full_name: formData.name,
        // email: formData.email, // Often better not to update email via this form directly to avoid auth mismatch
        phone: `${formData.countryCode}${formData.phone}`,
        location: formData.location,
        experience_years: parseInt(formData.experience) || 0,
        about: formData.about,
        services: formData.selectedServices,
        avatar_url: photoURL,
        updated_at: serverTimestamp()
      };

      if (isEditing) {
        // Update existing documents
        await updateDoc(doc(db, "profiles", user.uid), {
          full_name: formData.name,
          avatar_url: photoURL,
          updated_at: serverTimestamp()
        });
        await updateDoc(doc(db, "mechanics", user.uid), commonData);

        // Update local state to reflect changes immediately
        setMechanicProfile({ ...mechanicProfile, ...commonData });
        setIsEditing(false);
        toast.success("Profile updated successfully!");

      } else {
        // Create new documents
        await setDoc(doc(db, "profiles", user.uid), {
          full_name: formData.name,
          email: formData.email,
          user_id: user.uid,
          avatar_url: photoURL,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });

        await setDoc(doc(db, "mechanics", user.uid), {
          ...commonData,
          user_id: user.uid,
          email: formData.email, // Set email on creation
          is_verified: false,
          is_available: true,
          rating: 0,
          total_reviews: 0,
          created_at: serverTimestamp(),
        });

        toast.success("Registration successful! Welcome to MechRadii.");
        navigate("/account");
      }

    } catch (error: any) {
      console.error("Mechanic registration/update error:", error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error("This email is already registered. Please sign in instead.");
      } else {
        toast.error(error.message || "Failed to process request. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Render Loading State
  if (checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const toggleAvailability = async () => {
    if (!mechanicProfile?.user_id) return;
    const newStatus = mechanicProfile.availability_status === 'busy' ? 'available' : 'busy';

    try {
      await updateDoc(doc(db, "mechanics", mechanicProfile.user_id), {
        availability_status: newStatus
      });
      // Local update handled by snapshot or manual set if we were using it for profile, 
      // but since profile is state, we update it:
      setMechanicProfile(prev => ({ ...prev, availability_status: newStatus }));
      toast.success(`You are now ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // Render Dashboard View for Existing Mechanics (when not editing)
  if (mechanicProfile && !isEditing) {
    const isBusy = mechanicProfile.availability_status === 'busy';

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Main Profile Card */}
            <div className={`bg-card rounded-2xl p-8 shadow-sm border border-border card-glow relative overflow-hidden`}>
              {/* Status Banner for Busy */}
              {isBusy && (
                <div className="absolute top-0 left-0 w-full bg-red-500/10 text-red-600 text-center text-xs font-bold py-1 border-b border-red-100">
                  CURRENTLY BUSY / ON A JOB
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-8 items-start mt-4">
                {/* Profile Avatar */}
                <div className="relative w-32 h-32 flex-shrink-0">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-card shadow-lg bg-secondary">
                    {mechanicProfile.avatar_url ? (
                      <img
                        src={mechanicProfile.avatar_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <User size={48} />
                      </div>
                    )}
                  </div>
                  {/* Status Indicator Dot */}
                  <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-card ${isBusy ? 'bg-red-500' : 'bg-green-500'}`} title={isBusy ? "Busy" : "Available"}></div>
                </div>

                {/* Profile Details */}
                <div className="flex-grow space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold">{mechanicProfile.full_name}</h1>
                        {mechanicProfile.is_verified && (
                          <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                            Verified
                          </span>
                        )}
                      </div>

                      <Button
                        variant={isBusy ? "destructive" : "outline"}
                        size="sm"
                        onClick={toggleAvailability}
                        className={isBusy ? "" : "text-green-600 border-green-200 hover:bg-green-50"}
                      >
                        {isBusy ? "Mark Available" : "Set to Busy"}
                      </Button>
                    </div>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2">
                      <MapPin size={16} /> {mechanicProfile.location}
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-border">
                    <div className="text-center md:text-left">
                      <p className="text-sm text-muted-foreground mb-1">Total Services</p>
                      <p className="text-2xl font-bold animate-fade-in text-gradient">
                        {(mechanicProfile.total_reviews || 0) + 12}
                      </p>
                    </div>
                    <div className="text-center md:text-left">
                      <p className="text-sm text-muted-foreground mb-1">Rating</p>
                      <div className="flex items-center justify-center md:justify-start gap-1">
                        <span className="text-2xl font-bold">{mechanicProfile.rating || 0}</span>
                        <span className="text-yellow-400">★</span>
                      </div>
                    </div>
                    <div className="text-center md:text-left">
                      <p className="text-sm text-muted-foreground mb-1">Reviews</p>
                      <p className="text-2xl font-bold">{mechanicProfile.total_reviews || 0}</p>
                    </div>
                    <div className="text-center md:text-left">
                      <p className="text-sm text-muted-foreground mb-1">Experience</p>
                      <p className="text-2xl font-bold">{mechanicProfile.experience_years || 0} Years</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">My Services</h3>
                    <div className="flex flex-wrap gap-2">
                      {mechanicProfile.services?.map((service: string) => (
                        <span key={service} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <Button onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                    <Button onClick={() => navigate('/account')} variant="outline">
                      Go to Account Settings
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Requests / Messages Section */}
            <div className="bg-card rounded-2xl p-8 shadow-sm border border-border mt-8">
              <h2 className="text-xl font-semibold mb-6">Recent Requests & Messages</h2>
              <MechanicRequestsList mechanicId={mechanicProfile.user_id} />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Regular Registration Form View (Or Edit View)
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {isEditing ? "Edit Mechanic Profile" : "Join as a Mechanic"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? "Update your professional details" : "Expand your business and help drivers in need"}
            </p>
          </div>

          <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8 card-glow">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Profile Photo Section */}
              <div className="space-y-4">
                <Label>Profile Photo</Label>
                <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed border-border rounded-xl bg-secondary/20">
                  {formData.profileImage ? (
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md">
                      <img
                        src={formData.profileImage}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, profileImage: null }))}
                        className="absolute bottom-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-400">
                      <User size={48} />
                    </div>
                  )}

                  <div className="flex gap-3">
                    {!isCameraActive ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={startCamera}
                          className="flex gap-2"
                        >
                          <Camera size={16} />
                          Take Photo
                        </Button>
                        <div className="relative">
                          <Button type="button" variant="outline" className="flex gap-2">
                            <User size={16} />
                            Upload Photo
                          </Button>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative rounded-lg overflow-hidden bg-black aspect-square w-64">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" onClick={capturePhoto} variant="default">
                            Capture
                          </Button>
                          <Button type="button" onClick={stopCamera} variant="destructive">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                  <p className="text-xs text-neutral-500 text-center">
                    This photo will be shown to customers. clearly visible face is recommended.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <Input
                    id="name"
                    placeholder="John Doe"
                    className="pl-10"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isEditing} // Disable email edit for simplicity
                  />
                </div>
              </div>

              {!isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      className="pl-10 pr-10"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative flex gap-2">
                    <div className="w-[140px] flex-shrink-0">
                      <Select
                        value={formData.countryCode}
                        onValueChange={(value) => setFormData({ ...formData, countryCode: value })}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Code" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {countries.map((c, index) => (
                            <SelectItem key={`${c.name}-${index}`} value={c.dial_code}>
                              {c.dial_code} ({c.name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="relative flex-grow">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                      <Input
                        id="phone"
                        placeholder="555-0123"
                        className="pl-10"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Base Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                    <Input
                      id="location"
                      placeholder="City, State"
                      className="pl-10"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <div className="relative">
                  <Wrench className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <Input
                    id="experience"
                    type="number"
                    placeholder="e.g. 5"
                    className="pl-10"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Services Offered</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {services.map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={service}
                        checked={formData.selectedServices.includes(service)}
                        onCheckedChange={() => handleServiceToggle(service)}
                      />
                      <label
                        htmlFor={service}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {service}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="about">About You</Label>
                <Textarea
                  id="about"
                  placeholder="Tell us about your experience and expertise..."
                  className="min-h-[100px]"
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-4">
                {isEditing && (
                  <Button type="button" variant="outline" className="w-full h-11" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      {isEditing ? "Updating Profile..." : "Creating Account..."}
                    </div>
                  ) : (
                    isEditing ? "Update Profile" : "Create Mechanic Account"
                  )}
                </Button>
              </div>

              {!isEditing && (
                <div className="text-center text-sm">
                  <span className="text-neutral-600">Already have an account? </span>
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterMechanic;
