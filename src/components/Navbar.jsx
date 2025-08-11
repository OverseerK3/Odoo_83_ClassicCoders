import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="w-full bg-white shadow-sm py-3 px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <img src="/logo192.png" alt="QuickCourt Logo" className="w-8 h-8" />
        <span className="text-xl font-bold text-blue-700">QuickCourt</span>
      </div>
      <div className="hidden md:flex gap-6 text-gray-700 font-medium">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <Link to="/venues" className="hover:text-blue-600">Venues</Link>
        <Link to="/my-bookings" className="hover:text-blue-600">My Bookings</Link>
        <Link to="/profile" className="hover:text-blue-600">Profile</Link>
        <Link to="/owner" className="hover:text-blue-600">Owner</Link>
        <Link to="/admin" className="hover:text-blue-600">Admin</Link>
      </div>
      <div className="flex gap-2">
        <Link to="/" className="hidden md:inline-block px-4 py-2 border border-blue-600 text-blue-700 rounded hover:bg-blue-50 font-semibold transition">Explore Venues</Link>
        <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition">Sign In</Link>
      </div>
    </nav>
  );
};

export default Navbar;
