import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
// import { getAnalytics } from "firebase/analytics";

// Firebase configuration containing API keys and project details
const firebaseConfig = {
    apiKey: "AIzaSyAQsi3iy8BXtFrIUC1_sRzEpdgD2YlXLng",
    authDomain: "pg-management-e0377.firebaseapp.com",
    projectId: "pg-management-e0377",
    storageBucket: "pg-management-e0377.appspot.com",
    messagingSenderId: "796730807421",
    appId: "1:796730807421:web:5217702fc97139784ecd14",
    measurementId: "G-1GPKLL9GNT"
  };

  // Initialize Firebase
firebase.initializeApp(firebaseConfig);
// const analytics = getAnalytics(firebase.initializeApp(firebaseConfig));

// Access Firestore and authentication services from Firebase
const firestore = firebase.firestore();
const auth = firebase.auth();

// Set up persistent authentication state
const onAuthStateChangedCallbacks = [];
let currentUser = null;

// Listen for changes in the authentication state and update the currentUser variable
auth.onAuthStateChanged((user) => {
  currentUser = user;
  // Notify all registered callbacks about the updated authentication state
  onAuthStateChangedCallbacks.forEach((callback) => callback(user));
});

// Function to get the current authenticated user
const getCurrentUser = () => currentUser;

// Function to register callbacks for changes in authentication state
const onAuthStateChanged = (callback) => {
  // Add the callback to the list of callbacks and immediately invoke it with the current user
  onAuthStateChangedCallbacks.push(callback);
  callback(currentUser);
};

// Access Firestore database separately
const db = firebase.firestore();

// Export Firebase, Firestore, authentication, and related utility functions
export { firebase, db, firestore, auth, getCurrentUser, onAuthStateChanged };