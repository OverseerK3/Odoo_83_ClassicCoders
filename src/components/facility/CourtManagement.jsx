import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const API_BASE = 'http://localhost:5000/api/facility';

const CourtManagement = () => {
  const [venues, setVenues] = useState([]);
  const [courts, setCourts] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCourt, setEditingCourt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    sportType: '',
    pricePerHour: '',
    operatingHours: { open: '06:00', close: '22:00' },
    features: [],
    maintenanceNotes: ''
  });

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  const sportsOptions = [
    'Cricket', 'Football', 'Badminton', 'Tennis', 'Basketball', 
    'Volleyball', 'Table Tennis', 'Swimming', 'Squash'
  ];

  const featuresOptions = [
    'Air Conditioning', 'LED Lighting', 'Sound System', 'CCTV', 
    'Scoreboard', 'Water Cooler', 'First Aid Kit', 'Equipment Storage'
  ];

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    if (selectedVenue) {
      fetchCourts(selectedVenue);
    }
  }, [selectedVenue]);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/venues`, { headers });
      if (!res.ok) throw new Error('Failed to fetch venues');
      const data = await res.json();
      setVenues(data);
      if (data.length > 0 && !selectedVenue) {
        setSelectedVenue(data[0]._id);
      }
      setError('');
    } catch (err) {
      setError('Failed to load venues');
      console.error('Fetch venues error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourts = async (venueId) => {
    try {
      const res = await fetch(`${API_BASE}/venues/${venueId}/courts`, { headers });
      if (!res.ok) throw new Error('Failed to fetch courts');
      const data = await res.json();
      setCourts(data);
      setError('');
    } catch (err) {
      setError('Failed to load courts');
      console.error('Fetch courts error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVenue) {
      setError('Please select a venue first');
      return;
    }

    try {
      const url = editingCourt 
        ? `${API_BASE}/courts/${editingCourt._id}`
        : `${API_BASE}/venues/${selectedVenue}/courts`;
      
      const method = editingCourt ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save court');
      
      await fetchCourts(selectedVenue);
      resetForm();
      setError('');
    } catch (err) {
      setError('Failed to save court');
      console.error('Save court error:', err);
    }
  };

  const handleEdit = (court) => {
    setEditingCourt(court);
    setFormData({
      name: court.name || '',
      sportType: court.sportType || '',
      pricePerHour: court.pricePerHour || '',
      operatingHours: court.operatingHours || { open: '06:00', close: '22:00' },
      features: court.features || [],
      maintenanceNotes: court.maintenanceNotes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (courtId) => {
    if (!confirm('Are you sure you want to delete this court?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/courts/${courtId}`, {
        method: 'DELETE',
        headers
      });
      
      if (!res.ok) throw new Error('Failed to delete court');
      
      await fetchCourts(selectedVenue);
      setError('');
    } catch (err) {
      setError('Failed to delete court');
      console.error('Delete court error:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sportType: '',
      pricePerHour: '',
      operatingHours: { open: '06:00', close: '22:00' },
      features: [],
      maintenanceNotes: ''
    });
    setEditingCourt(null);
    setShowForm(false);
  };

  const handleFeaturesChange = (feature) => {
    setFormData(prev => {
      const features = prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature];
      return { ...prev, features };
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-slate-500">Loading courts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Court Management</h2>
          <p className="text-slate-600">Manage courts for your facilities</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Venue Selector */}
          <select
            value={selectedVenue}
            onChange={(e) => setSelectedVenue(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a venue</option>
            {venues.map(venue => (
              <option key={venue._id} value={venue._id}>{venue.name}</option>
            ))}
          </select>

          <button
            onClick={() => setShowForm(true)}
            disabled={!selectedVenue}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="w-5 h-5" />
            Add New Court
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {editingCourt ? 'Edit Court' : 'Add New Court'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Court Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Court A, Field 1, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sport Type *
                </label>
                <select
                  required
                  value={formData.sportType}
                  onChange={(e) => setFormData(prev => ({ ...prev, sportType: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select sport type</option>
                  {sportsOptions.map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Price per Hour (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData(prev => ({ ...prev, pricePerHour: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Operating Hours
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    value={formData.operatingHours.open}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      operatingHours: { ...prev.operatingHours, open: e.target.value }
                    }))}
                    className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="time"
                    value={formData.operatingHours.close}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      operatingHours: { ...prev.operatingHours, close: e.target.value }
                    }))}
                    className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Features
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {featuresOptions.map(feature => (
                  <label key={feature} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature)}
                      onChange={() => handleFeaturesChange(feature)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    {feature}
                  </label>
                ))}
              </div>
            </div>

            {/* Maintenance Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Maintenance Notes
              </label>
              <textarea
                value={formData.maintenanceNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, maintenanceNotes: e.target.value }))}
                rows={3}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any maintenance notes or special instructions..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="btn-primary"
              >
                {editingCourt ? 'Update Court' : 'Add Court'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Courts List */}
      {selectedVenue && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Courts at {venues.find(v => v._id === selectedVenue)?.name}
          </h3>
          
          {courts.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {courts.map((court) => (
                <div key={court._id} className="card p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-slate-800 mb-1">{court.name}</h4>
                      <div className="flex items-center gap-1 text-slate-600 text-sm mb-2">
                        <UserGroupIcon className="w-4 h-4" />
                        {court.sportType}
                      </div>
                      <div className="flex items-center gap-1 text-slate-600 text-sm">
                        <CurrencyRupeeIcon className="w-4 h-4" />
                        ₹{court.pricePerHour}/hour
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(court)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(court._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-1 text-slate-600">
                      <ClockIcon className="w-4 h-4" />
                      {court.operatingHours.open} - {court.operatingHours.close}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <span className={`w-3 h-3 rounded-full ${court.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="text-slate-600">
                        {court.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {court.features && court.features.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-medium text-slate-700 mb-2">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {court.features.slice(0, 3).map((feature, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            {feature}
                          </span>
                        ))}
                        {court.features.length > 3 && (
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                            +{court.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {court.maintenanceNotes && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                      <p className="font-medium text-yellow-800">Maintenance Notes:</p>
                      <p className="text-yellow-700">{court.maintenanceNotes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UserGroupIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-slate-600 mb-2">No courts yet</h4>
              <p className="text-slate-500 mb-4">Add courts to start managing bookings</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Add Your First Court
              </button>
            </div>
          )}
        </div>
      )}

      {!selectedVenue && venues.length > 0 && (
        <div className="text-center py-12">
          <UserGroupIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-slate-600 mb-2">Select a venue</h4>
          <p className="text-slate-500">Choose a venue from the dropdown to manage its courts</p>
        </div>
      )}

      {venues.length === 0 && (
        <div className="text-center py-12">
          <UserGroupIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-slate-600 mb-2">No venues available</h4>
          <p className="text-slate-500">You need to create a venue first before adding courts</p>
        </div>
      )}
    </div>
  );
};

export default CourtManagement;
