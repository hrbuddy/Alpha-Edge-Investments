// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBS_FNz-iM8kB5VUlM_PBJBCwWXmZ0bcUs",
  authDomain: "alpha-edge-734f1.firebaseapp.com",
  projectId: "alpha-edge-734f1",
  storageBucket: "alpha-edge-734f1.firebasestorage.app",
  messagingSenderId: "689480777854",
  appId: "1:689480777854:web:cf86427d3cd66c796cd82f",
  measurementId: "G-TD8BBH6JY8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);