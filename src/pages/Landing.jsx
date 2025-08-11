import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-400">
      <div className="bg-white bg-opacity-90 p-10 rounded-xl shadow-xl max-w-xl text-center">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-4">Welcome to QuickCourt</h1>
        <p className="text-lg text-gray-700 mb-6">Book sports venues, manage facilities, and join the game!<br/>QuickCourt makes booking and managing sports venues easy for players, facility managers, and admins.</p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link to="/signup" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">Sign Up</Link>
          <Link to="/login" className="px-6 py-3 bg-white border border-blue-600 text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition">Login</Link>
        </div>
      </div>
      <footer className="mt-10 text-sm text-white opacity-80">&copy; {new Date().getFullYear()} QuickCourt. All rights reserved.</footer>
    </div>
  );
};

export default Landing;
