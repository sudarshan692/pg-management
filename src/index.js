import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './components/shared/AuthProvider'; // Import the AuthProvider
import { PgProvider } from './context/PgContext'; // Import the PgProvider

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <AuthProvider> {/* Wrap App with AuthProvider */}
      <PgProvider> {/* Wrap App with PgProvider */}
        <App />
      </PgProvider>
    </AuthProvider>
  </React.StrictMode>
);
