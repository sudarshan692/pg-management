import React, { createContext, useState, useContext } from 'react';

// Create a context
const PgContext = createContext();

// Custom hook to use the context
export const usePgContext = () => {
  return useContext(PgContext);
};

// Provider component
export const PgProvider = ({ children }) => {
  const [pgData, setPgData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Context value
  const value = {
    pgData,
    setPgData,
    loading,
    setLoading,
    error,
    setError
  };

  return (
    <PgContext.Provider value={value}>
      {children}
    </PgContext.Provider>
  );
};
