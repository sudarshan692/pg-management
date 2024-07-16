import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../shared/firebase'; 
import LoadingSpinner from './LoadingSpinner';

// Create an authentication context using React's createContext
const AuthContext = createContext();


// AuthProvider component - manages authentication state and provides related functionality to children components
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // useEffect hook to listen for changes in the authentication state when the component mounts
  useEffect(() => {
    // Subscribe to the onAuthStateChanged event and update the state accordingly
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Unsubscribe from the onAuthStateChanged event when the component unmounts
    return () => unsubscribe();
  }, []);

  // Function to perform user login using the signInWithEmailAndPassword method from Firebase
  const login = async (email, password) => {
    await auth.signInWithEmailAndPassword(email, password);
  };

  // Function to perform user logout using the signOut method from Firebase
  const logout = async () => {
    await auth.signOut();
  };

  // Provide the authentication context to child components with the currentUser, login, and logout values
  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {/* Display a loading spinner while the authentication state is being determined */}
      {loading ? <LoadingSpinner /> : children}
    </AuthContext.Provider>
  );
};

// useAuth hook - provides easy access to the authentication context within components
export const useAuth = () => {
  return useContext(AuthContext);
};
