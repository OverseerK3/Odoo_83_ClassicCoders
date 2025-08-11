import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  UserIcon, 
  PencilIcon, 
  TrashIcon,
  ShieldCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    // Simulate fetching users
    setTimeout(() => {
      const mockUsers = [
        { _id: '1', username: 'John Doe', email: 'john@example.com', role: 'player', location: 'Ahmedabad', isEmailVerified: true, createdAt: '2024-01-15' },
        { _id: '2', username: 'Alice Manager', email: 'alice@example.com', role: 'facility_manager', location: 'Vadodara', isEmailVerified: true, createdAt: '2024-01-20' },
        { _id: '3', username: 'Bob Player', email: 'bob@example.com', role: 'player', location: 'Surat', isEmailVerified: false, createdAt: '2024-02-01' },
        { _id: '4', username: 'Carol Admin', email: 'carol@example.com', role: 'admin', location: 'Rajkot', isEmailVerified: true, createdAt: '2024-02-10' },
      ];
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = users;
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'facility_manager':
        return 'bg-blue-100 text-blue-800';
      case 'player':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <ShieldCheckIcon className="w-4 h-4" />;
      case 'facility_manager':
        return <UserIcon className="w-4 h-4" />;
      case 'player':
        return <UserGroupIcon className="w-4 h-4" />;
      default:
        return <UserIcon className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-slate-500">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">User Management</h2>
        <p className="text-slate-600">Manage all platform users, roles, and permissions</p>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Search Users</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="facility_manager">Facility Manager</option>
              <option value="player">Player</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('');
              }}
              className="btn-outline w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6 text-center">
          <div className="text-2xl font-bold text-slate-800 mb-1">
            {users.length}
          </div>
          <div className="text-slate-600 text-sm">Total Users</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {users.filter(u => u.role === 'player').length}
          </div>
          <div className="text-slate-600 text-sm">Players</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {users.filter(u => u.role === 'facility_manager').length}
          </div>
          <div className="text-slate-600 text-sm">Facility Managers</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-2xl font-bold text-red-600 mb-1">
            {users.filter(u => u.role === 'admin').length}
          </div>
          <div className="text-slate-600 text-sm">Administrators</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-slate-700">User</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Role</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Location</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Joined</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-slate-800 font-medium">{user.username}</p>
                        <p className="text-slate-600 text-sm">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      {user.role.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{user.location}</td>
                  <td className="py-3 px-4">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      user.isEmailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.isEmailVerified ? 'Verified' : 'Pending'}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit User"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete User"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserGroupIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">No users found</h3>
            <p className="text-slate-500">
              {searchTerm || roleFilter ? 'Try adjusting your filters' : 'No users registered yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
