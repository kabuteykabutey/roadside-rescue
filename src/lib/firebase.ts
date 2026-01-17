import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Replace with your actual Firebase config from the Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyARGmsZ2fToisCnQhgVZnD2f3T0utjK9fY",
    authDomain: "mechradii.firebaseapp.com",
    projectId: "mechradii",
    storageBucket: "mechradii.firebasestorage.app",
    messagingSenderId: "42007571888",
    appId: "1:42007571888:web:a580dcc308b1e8d18b7a75",
    measurementId: "G-8JDJ9NGZEL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
