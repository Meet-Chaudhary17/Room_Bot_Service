import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          {/* Main App Routes */}
          <AppRoutes />
          
          {/* Global Alert Toast Notifications container */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#1e293b',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                borderRadius: '12px',
                border: '1px solid #f1f5f9',
                padding: '12px 16px',
                fontSize: '13px',
                fontWeight: 600
              }
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}