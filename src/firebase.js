import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBS_FNz-iM8kB5VUlM_PBJBCwWXmZ0bcUs",
  authDomain: "alpha-edge-734f1.firebaseapp.com",
  projectId: "alpha-edge-734f1",
  storageBucket: "alpha-edge-734f1.firebasestorage.app",
  messagingSenderId: "689480777854",
  appId: "1:689480777854:web:cf86427d3cd66c796cd82f",
  measurementId: "G-TD8BBH6JY8",
};

const app       = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export default app;