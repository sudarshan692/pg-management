import React, { createContext, useState, useContext } from 'react';

const PgContext = createContext();

export const usePgContext = () => {
  return useContext(PgContext);
};

export const PgProvider = ({ children }) => {
  const [pgData, setPgData] = useState([]);
  const [payingGuests, setPayingGuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previousPgId, setPreviousPgId] = useState(null); 
  const value = {
    pgData,
    setPgData,
    payingGuests,
    setPayingGuests ,
    loading,
    setLoading,
    error,
    setError,
    previousPgId, 
    setPreviousPgId
  };

  return (
    <PgContext.Provider value={value}>
      {children}
    </PgContext.Provider>
  );
};
