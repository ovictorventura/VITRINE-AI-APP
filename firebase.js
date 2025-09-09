// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDjMn8YmRDhtrucCXbO61eNnuk_OwpSJlE",
  authDomain: "prisma-app-d16a1.firebaseapp.com",
  projectId: "prisma-app-d16a1",
  storageBucket: "prisma-app-d16a1.firebasestorage.app",
  messagingSenderId: "855597788113",
  appId: "1:855597788113:web:211fc0238c7d5ff8174ef0",
  measurementId: "G-FM9X9W6NW1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
