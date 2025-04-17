// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

// ✅ Replace with your actual config from Firebase project settings
const firebaseConfig = {
  apiKey: "AIzaSyDTBBlm5wLTAAs7DNJ3mu7Mb6gcEZQVNNI",
  authDomain: "math-test-934d4.firebaseapp.com",
  databaseURL: "https://math-test-934d4-default-rtdb.firebaseio.com",
  projectId: "math-test-934d4",
  storageBucket: "math-test-934d4.firebasestorage.app",
  messagingSenderId: "208072039217",
  appId: "1:208072039217:web:2c2ae5210beb373b5aee10",
  measurementId: "G-G0Y3BJ26CN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const analytics = getAnalytics(app);

export { analytics, database, ref, push };
