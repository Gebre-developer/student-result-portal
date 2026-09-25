import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext'; // 🚀 Import the provider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> {/* 🚀 Wrap the application core right here */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);
