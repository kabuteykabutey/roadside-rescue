import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User, Loader2 } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

interface EditProfileDialogProps {
  profile: {
    full_name: string;
    email: string;
    avatar_url?: string | null;
  } | null;
  userId: string;
  onProfileUpdated: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const EditProfileDialog = ({
  profile,
  userId,
  onProfileUpdated,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: EditProfileDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("[Upload] Starting Cloudinary upload for file:", file.name, file.size, "bytes");

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 10MB for Cloudinary free tier)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    setUploading(true);

    try {
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      console.log("[Upload] Cloud Name:", cloudName);
      console.log("[Upload] Upload Preset:", uploadPreset);

      if (!cloudName || !uploadPreset) {
        throw new Error("Cloudinary configuration missing. Check your .env file.");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      // Removed folder parameter to test if it's causing issues

      console.log("[Upload] Uploading to Cloudinary...");
      console.log("[Upload] URL:", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      console.log("[Upload] Response status:", response.status);
      console.log("[Upload] Response ok:", response.ok);

      if (!response.ok) {
        const error = await response.json();
        console.error("[Upload] Error response:", error);
        throw new Error(error.error?.message || "Upload failed");
      }

      const data = await response.json();
      console.log("[Upload] Cloudinary upload successful:", data.secure_url);

      setAvatarUrl(data.secure_url);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("[Upload] Error:", error);
      toast.error(error.message || "Failed to upload image");
      setAvatarUrl(profile?.avatar_url || "");
    } finally {
      setUploading(false);
    }
  };

  // Compress image to reduce upload time
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Resize if image is too large (max 600px for faster uploads)
          const maxSize = 600;
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error("Compression failed"));
              }
            },
            "image/jpeg",
            0.7 // 70% quality for faster uploads
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setSaving(true);

    try {
      // Debug: Check authentication state
      const currentUser = auth.currentUser;
      console.log("[Profile Update] Current user:", currentUser?.uid);
      console.log("[Profile Update] Target userId:", userId);
      console.log("[Profile Update] User authenticated:", !!currentUser);

      if (!currentUser) {
        throw new Error("You must be logged in to update your profile");
      }

      if (currentUser.uid !== userId) {
        throw new Error("You can only update your own profile");
      }

      const profileRef = doc(db, "profiles", userId);
      console.log("[Profile Update] Updating document:", profileRef.path);

      // Use setDoc with merge to create the document if it doesn't exist
      await setDoc(profileRef, {
        full_name: fullName.trim(),
        avatar_url: avatarUrl || null,
        updated_at: serverTimestamp(),
      }, { merge: true });

      console.log("[Profile Update] Update successful");
      toast.success("Profile updated successfully");
      setOpen(false);
      onProfileUpdated();
    } catch (error: any) {
      console.error("[Profile Update] Error:", error);
      console.error("[Profile Update] Error code:", error.code);
      console.error("[Profile Update] Error message:", error.message);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and avatar
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {fullName ? getInitials(fullName) : <User className="h-10 w-10" />}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Click the camera icon to upload a new photo
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={profile?.email || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={saving || uploading}
            className="w-full"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
