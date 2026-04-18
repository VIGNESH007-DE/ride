import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import { LogOut, Car, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Car size={32} />
            <span className="text-2xl font-bold tracking-tight">BackRide</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to={role === 'driver' ? '/driver' : '/passenger'} className="hover:text-blue-200">
                  Dashboard
                </Link>
                <div className="flex items-center space-x-2 bg-blue-700 px-3 py-1 rounded-full">
                  <User size={18} />
                  <span className="text-sm font-medium">{user.displayName || user.email?.split('@')[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md transition"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-white text-blue-600 px-4 py-2 rounded-md font-bold hover:bg-blue-50 transition"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
