import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAFaHu6r78VaTdc3AZc7H7DfmEEr-dnuko",
  authDomain: "black-loom.firebaseapp.com",
  projectId: "black-loom",
  storageBucket: "black-loom.firebasestorage.app",
  messagingSenderId: "722939342039",
  appId: "1:722939342039:web:8b1be51f002690768e9492",
  measurementId: "G-8SHT9G16RN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
export const db = getFirestore(app);
