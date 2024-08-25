import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './components/shared/AuthProvider';
import { PgProvider } from './context/PgContext';

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <PgProvider>
        <App />
      </PgProvider>
    </AuthProvider>
  </React.StrictMode>
);
