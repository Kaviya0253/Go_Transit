import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOCy2YYvSYi5xFhS9skUy8ZRx6JxxsbMk",
  authDomain: "go-transit-48399.firebaseapp.com",
  databaseURL: "https://go-transit-48399-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "go-transit-48399",
  storageBucket: "go-transit-48399.appspot.com", // Fixed the storage bucket URL
  messagingSenderId: "67069994274",
  appId: "1:67069994274:web:c367bc3b5cb7efa846b17b",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the Realtime Database
const database = getDatabase(app);

export { database };
