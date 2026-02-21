import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGsvxWCQ82DWmAQ7ZxywuRO0CMfgSyZNY",
  authDomain: "bloodpressuretracker-9e962.firebaseapp.com",
  projectId: "bloodpressuretracker-9e962",
  storageBucket: "bloodpressuretracker-9e962.firebasestorage.app",
  messagingSenderId: "865865692966",
  appId: "1:865865692966:web:4c6cd56be9f3193aae33e7",
  measurementId: "G-QL4TGJ1CSS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
