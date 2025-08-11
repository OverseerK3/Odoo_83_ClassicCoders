import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Landing from './pages/Landing';
import MainLayout from './components/MainLayout';
import Venues from './pages/Venues';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import Owner from './pages/Owner';
import Admin from './pages/Admin';
import MyTeam from './pages/MyTeam';

const isAuthenticated = () => !!localStorage.getItem('token');
const isPlayer = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.role === 'player';
  } catch {
    return false;
  }
};

const ProtectedRoute = ({ children, playerOnly }) => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (playerOnly && !isPlayer()) return <Navigate to="/dashboard" replace />;
  return children;
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/dashboard" element={<MainLayout><ProtectedRoute><Dashboard /></ProtectedRoute></MainLayout>} />
          <Route path="/venues" element={<MainLayout><ProtectedRoute><Venues /></ProtectedRoute></MainLayout>} />
          <Route path="/my-bookings" element={<MainLayout><ProtectedRoute><MyBookings /></ProtectedRoute></MainLayout>} />
          <Route path="/profile" element={<MainLayout><ProtectedRoute><Profile /></ProtectedRoute></MainLayout>} />
          <Route path="/owner" element={<MainLayout><ProtectedRoute><Owner /></ProtectedRoute></MainLayout>} />
          <Route path="/admin" element={<MainLayout><ProtectedRoute><Admin /></ProtectedRoute></MainLayout>} />
          <Route path="/my-team" element={<MainLayout><ProtectedRoute playerOnly={true}><MyTeam /></ProtectedRoute></MainLayout>} />
          <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
