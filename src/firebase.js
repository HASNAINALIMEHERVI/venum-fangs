import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAFaHu6r78VaTdc3AZc7H7DfMEer-dnuko",
  authDomain: "black-loom.firebaseapp.com",
  projectId: "black-loom",
  storageBucket: "black-loom.firebasestorage.app",
  messagingSenderId: "364585141019",
  appId: "1:364585141019:web:96e83f053e1be11eb49c89",
  measurementId: "G-9Q2R4N4W8M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
export const db = getFirestore(app);
