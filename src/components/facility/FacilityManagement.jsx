import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  PhotoIcon,
  MapPinIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';

const API_BASE = 'http://localhost:5000/api/facility';

const FacilityManagement = () => {
  const [venues, setVenues] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    sport: '',
    description: '',
    capacity: '',
    amenities: [],
    sportsSupported: [],
    pricing: { hourlyRate: '', currency: 'INR' },
    operatingHours: { open: '06:00', close: '22:00' },
    contactInfo: { phone: '', email: '' },
    images: []
  });

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  const locations = [
    'Ahmedabad', 'Vadodara', 'Surat', 'Rajkot', 
    'Gandhinagar', 'Mehsana', 'Palanpur', 'Bhavnagar'
  ];

  const sportsOptions = [
    'Cricket', 'Football', 'Badminton', 'Tennis', 'Basketball', 
    'Volleyball', 'Table Tennis', 'Swimming', 'Squash'
  ];

  const amenitiesOptions = [
    'Parking', 'Changing Rooms', 'Washrooms', 'Cafeteria', 
    'First Aid', 'Equipment Rental', 'Air Conditioning', 'Lighting'
  ];

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/venues/my-venues', { headers });
      if (!res.ok) throw new Error('Failed to fetch venues');
      const data = await res.json();
      setVenues(data);
      setError('');
    } catch (err) {
      setError('Failed to load venues');
      console.error('Fetch venues error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingVenue 
        ? `http://localhost:5000/api/venues/${editingVenue._id}`
        : `http://localhost:5000/api/venues`;
      
      const method = editingVenue ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save venue');
      
      await fetchVenues();
      resetForm();
      setError('');
    } catch (err) {
      setError('Failed to save venue');
      console.error('Save venue error:', err);
    }
  };

  const handleEdit = (venue) => {
    setEditingVenue(venue);
    setFormData({
      name: venue.name || '',
      location: venue.location || '',
      sport: venue.sport || '',
      description: venue.description || '',
      capacity: venue.capacity || '',
      amenities: venue.amenities || [],
      sportsSupported: venue.sportsSupported || [],
      pricing: venue.pricing || { hourlyRate: '', currency: 'INR' },
      operatingHours: venue.operatingHours || { open: '06:00', close: '22:00' },
      contactInfo: venue.contactInfo || { phone: '', email: '' },
      images: venue.images || []
    });
    setShowForm(true);
  };

  const handleDelete = async (venueId) => {
    if (!confirm('Are you sure you want to delete this venue?')) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/venues/${venueId}`, {
        method: 'DELETE',
        headers
      });
      
      if (!res.ok) throw new Error('Failed to delete venue');
      
      await fetchVenues();
      setError('');
    } catch (err) {
      setError('Failed to delete venue');
      console.error('Delete venue error:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      sport: '',
      description: '',
      capacity: '',
      amenities: [],
      sportsSupported: [],
      pricing: { hourlyRate: '', currency: 'INR' },
      operatingHours: { open: '06:00', close: '22:00' },
      contactInfo: { phone: '', email: '' },
      images: []
    });
    setEditingVenue(null);
    setShowForm(false);
  };

  const handleArrayInput = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.split(',').map(item => item.trim()).filter(item => item)
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-slate-500">Loading venues...</div>
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Facility Management</h2>
          <p className="text-slate-600">Add and manage your sports facilities</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add New Facility
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {editingVenue ? 'Edit Facility' : 'Add New Facility'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Facility Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter facility name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Location *
                </label>
                <select
                  required
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select location</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Primary Sport *
                </label>
                <select
                  required
                  value={formData.sport}
                  onChange={(e) => setFormData(prev => ({ ...prev, sport: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select primary sport</option>
                  {sportsOptions.map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Capacity
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Maximum capacity"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your facility"
              />
            </div>

            {/* Sports Supported */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sports Supported (comma-separated)
              </label>
              <input
                type="text"
                value={formData.sportsSupported.join(', ')}
                onChange={(e) => handleArrayInput('sportsSupported', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Cricket, Football, Badminton"
              />
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Amenities (comma-separated)
              </label>
              <input
                type="text"
                value={formData.amenities.join(', ')}
                onChange={(e) => handleArrayInput('amenities', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Parking, Changing Rooms, Cafeteria"
              />
            </div>

            {/* Pricing and Hours */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Hourly Rate (₹)
                </label>
                <input
                  type="number"
                  value={formData.pricing.hourlyRate}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    pricing: { ...prev.pricing, hourlyRate: e.target.value }
                  }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Opening Time
                </label>
                <input
                  type="time"
                  value={formData.operatingHours.open}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    operatingHours: { ...prev.operatingHours, open: e.target.value }
                  }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Closing Time
                </label>
                <input
                  type="time"
                  value={formData.operatingHours.close}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    operatingHours: { ...prev.operatingHours, close: e.target.value }
                  }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contactInfo.phone}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    contactInfo: { ...prev.contactInfo, phone: e.target.value }
                  }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contactInfo.email}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    contactInfo: { ...prev.contactInfo, email: e.target.value }
                  }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="contact@facility.com"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="btn-primary"
              >
                {editingVenue ? 'Update Facility' : 'Add Facility'}
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

      {/* Venues List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {venues.map((venue) => (
          <div key={venue._id} className="card p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800 mb-1">{venue.name}</h3>
                <div className="flex items-center gap-1 text-slate-600 text-sm mb-2">
                  <MapPinIcon className="w-4 h-4" />
                  {venue.location}
                </div>
                <div className="flex items-center gap-1 text-slate-600 text-sm">
                  <BuildingOffice2Icon className="w-4 h-4" />
                  {venue.sport}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(venue)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(venue._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {venue.description && (
              <p className="text-slate-600 text-sm mb-4 line-clamp-2">{venue.description}</p>
            )}

            <div className="space-y-2 text-sm">
              {venue.capacity && (
                <p><span className="font-medium">Capacity:</span> {venue.capacity} people</p>
              )}
              {venue.pricing?.hourlyRate && (
                <p><span className="font-medium">Rate:</span> ₹{venue.pricing.hourlyRate}/hour</p>
              )}
              {venue.operatingHours && (
                <p><span className="font-medium">Hours:</span> {venue.operatingHours.open} - {venue.operatingHours.close}</p>
              )}
            </div>

            {venue.amenities && venue.amenities.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-slate-700 mb-2">Amenities:</p>
                <div className="flex flex-wrap gap-1">
                  {venue.amenities.slice(0, 3).map((amenity, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {amenity}
                    </span>
                  ))}
                  {venue.amenities.length > 3 && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                      +{venue.amenities.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {venues.length === 0 && !loading && (
        <div className="text-center py-12">
          <BuildingOffice2Icon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No facilities yet</h3>
          <p className="text-slate-500 mb-4">Get started by adding your first sports facility</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            Add Your First Facility
          </button>
        </div>
      )}
    </div>
  );
};

export default FacilityManagement;
