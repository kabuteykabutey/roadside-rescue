import { useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { toast } from "sonner";

const UserRequestListener = () => {
    useEffect(() => {
        // Only run if user is logged in
        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            if (!user) return;

            const q = query(
                collection(db, "bookings"),
                where("user_id", "==", user.uid)
            );

            const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === "modified") {
                        const data = change.doc.data();
                        const status = data.status;
                        const mechanicName = data.mechanic_name || "The mechanic";

                        if (status === "accepted") {
                            toast.success(`Request Accepted! ${mechanicName} is on the way.`);
                            // Optional: Trigger a browser vibration or sound here
                        } else if (status === "rejected") {
                            toast.error(`Request Rejected. Please try finding another mechanic.`);
                        } else if (status === "completed") {
                            toast.info(`Job Marked as Completed by ${mechanicName}.`);
                        }
                    }
                });
            });

            return () => unsubscribeSnapshot();
        });

        return () => unsubscribeAuth();
    }, []);

    return null; // This component doesn't render anything
};

export default UserRequestListener;
