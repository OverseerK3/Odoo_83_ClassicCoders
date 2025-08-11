import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '', role: 'player' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="mb-4 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="mb-4 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="mb-6 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="player">Player</option>
          <option value="facility_manager">Facility Manager</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Login
        </button>
        <p className="mt-4 text-center">
          Don't have an account?{' '}
          <a href="/signup" className="text-blue-600 hover:underline">Sign up</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
