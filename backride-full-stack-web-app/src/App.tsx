import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { RoleSelection } from './pages/RoleSelection';
import { DriverDashboard } from './pages/driver/DriverDashboard';
import { PassengerDashboard } from './pages/passenger/PassengerDashboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole?: 'driver' | 'passenger' }> = ({ children, allowedRole }) => {
  const { user, role, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;
  
  // If user exists but has no role yet, they must go to role selection
  if (!role && window.location.pathname !== '/role-selection') {
    return <Navigate to="/role-selection" />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to={role === 'driver' ? '/driver' : '/passenger'} />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/role-selection" 
              element={
                <ProtectedRoute>
                  <RoleSelection />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/driver/*" 
              element={
                <ProtectedRoute allowedRole="driver">
                  <DriverDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/passenger/*" 
              element={
                <ProtectedRoute allowedRole="passenger">
                  <PassengerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
