import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BuildingOffice2Icon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const API_BASE = 'http://localhost:5000/api/venues';

const VenueManagement = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  const locations = useMemo(() => [
    'Ahmedabad', 'Vadodara', 'Surat', 'Rajkot', 
    'Gandhinagar', 'Mehsana', 'Palanpur', 'Bhavnagar'
  ], []);

  const sports = useMemo(() => [
    'Badminton', 'Football', 'Cricket', 'Tennis', 
    'Table Tennis', 'Basketball', 'Swimming', 'Multi-Sport'
  ], []);

  const commonAmenities = useMemo(() => [
    'Parking', 'Changing Room', 'Washroom', 'AC', 'Water', 
    'Equipment Rental', 'First Aid', 'Cafeteria', 'WiFi'
  ], []);

  const [formData, setFormData] = useState({
    name: '',
    location: 'Ahmedabad',
    sport: 'Badminton',
    description: '',
    capacity: '',
    pricing: {
      hourlyRate: ''
    },
    amenities: [],
    sportsSupported: ['Badminton'],
    operatingHours: {
      open: '06:00',
      close: '22:00'
    },
    contactInfo: {
      phone: '',
      email: ''
    },
    image: ''
  });

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/my-venues`, { headers });
      if (res.ok) {
        const data = await res.json();
        setVenues(data);
      } else {
        setError('Failed to fetch venues');
      }
    } catch (err) {
      setError('Error fetching venues');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleAmenityToggle = useCallback((amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  }, []);

  const handleSportToggle = useCallback((sport) => {
    setFormData(prev => ({
      ...prev,
      sportsSupported: prev.sportsSupported.includes(sport)
        ? prev.sportsSupported.filter(s => s !== sport)
        : [...prev.sportsSupported, sport]
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      location: 'Ahmedabad',
      sport: 'Badminton',
      description: '',
      capacity: '',
      pricing: {
        hourlyRate: ''
      },
      amenities: [],
      sportsSupported: ['Badminton'],
      operatingHours: {
        open: '06:00',
        close: '22:00'
      },
      contactInfo: {
        phone: '',
        email: ''
      },
      image: ''
    });
    setEditingVenue(null);
    setShowCreateForm(false);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const endpoint = editingVenue ? `${API_BASE}/${editingVenue._id}` : API_BASE;
      const method = editingVenue ? 'PUT' : 'POST';

      // Prepare data for submission
      const submitData = {
        ...formData,
        hourlyRate: formData.pricing.hourlyRate
      };

      const res = await fetch(endpoint, {
        method,
        headers,
        body: JSON.stringify(submitData)
      });

      const data = await res.json();

      if (res.ok) {
        const successMsg = editingVenue ? 'Venue updated successfully!' : 'Venue created successfully!';
        setSuccess(successMsg);
        fetchVenues();
        resetForm();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Operation failed');
        // Clear error message after 5 seconds
        setTimeout(() => setError(''), 5000);
      }
    } catch (err) {
      setError('Network error occurred');
      setTimeout(() => setError(''), 5000);
    }
  }, [editingVenue, formData, headers, fetchVenues, resetForm]);

  const handleEdit = (venue) => {
    setFormData({
      name: venue.name,
      location: venue.location,
      sport: venue.sport,
      description: venue.description || '',
      capacity: venue.capacity || '',
      pricing: {
        hourlyRate: venue.pricing?.hourlyRate || ''
      },
      amenities: venue.amenities || [],
      sportsSupported: venue.sportsSupported || [venue.sport],
      operatingHours: venue.operatingHours || { open: '06:00', close: '22:00' },
      contactInfo: venue.contactInfo || { phone: '', email: '' },
      image: venue.image || ''
    });
    setEditingVenue(venue);
    setShowCreateForm(true);
  };

  const handleDelete = async (venueId) => {
    if (!confirm('Are you sure you want to delete this venue?')) return;

    try {
      const res = await fetch(`${API_BASE}/${venueId}`, {
        method: 'DELETE',
        headers
      });

      if (res.ok) {
        setSuccess('Venue deleted successfully!');
        fetchVenues();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        setError(data.message || 'Delete failed');
        setTimeout(() => setError(''), 5000);
      }
    } catch (err) {
      setError('Network error occurred');
      setTimeout(() => setError(''), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Venue Management</h2>
          <p className="text-slate-600">Manage all venues across the platform</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <PlusIcon className="w-5 h-5" />
          Add Venue
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">
                {editingVenue ? 'Edit Venue' : 'Create New Venue'}
              </h3>

              <form
                key={editingVenue ? editingVenue._id : 'new'}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Venue Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      autoComplete="off"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Location *
                    </label>
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
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
                      name="sport"
                      value={formData.sport}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {sports.map(sport => (
                        <option key={sport} value={sport}>{sport}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Hourly Rate (₹)
                    </label>
                    <input
                      type="number"
                      name="pricing.hourlyRate"
                      value={formData.pricing.hourlyRate}
                      onChange={handleInputChange}
                      min="0"
                      autoComplete="off"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Capacity
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      min="1"
                      autoComplete="off"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      autoComplete="off"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    autoComplete="off"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Times */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Opening Time
                    </label>
                    <input
                      type="time"
                      name="operatingHours.open"
                      value={formData.operatingHours.open}
                      onChange={handleInputChange}
                      autoComplete="off"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Closing Time
                    </label>
                    <input
                      type="time"
                      name="operatingHours.close"
                      value={formData.operatingHours.close}
                      onChange={handleInputChange}
                      autoComplete="off"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="contactInfo.phone"
                      value={formData.contactInfo.phone}
                      onChange={handleInputChange}
                      autoComplete="off"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      name="contactInfo.email"
                      value={formData.contactInfo.email}
                      onChange={handleInputChange}
                      autoComplete="off"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Amenities
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {commonAmenities.map(amenity => (
                      <label key={amenity} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="mr-2"
                        />
                        <span className="text-sm">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sports Supported */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sports Supported
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {sports.map(sport => (
                      <label key={sport} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.sportsSupported.includes(sport)}
                          onChange={() => handleSportToggle(sport)}
                          className="mr-2"
                        />
                        <span className="text-sm">{sport}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingVenue ? 'Update Venue' : 'Create Venue'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Venue List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {venues.length === 0 ? (
          <div className="text-center py-12">
            <BuildingOffice2Icon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">No venues found</h3>
            <p className="text-slate-500 mb-4">Create your first venue to get started</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add First Venue
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Venue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Sport
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Pricing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {venues.map((venue) => (
                  <tr key={venue._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={
                            venue.image ||
                            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=100&q=80'
                          }
                          alt={venue.name}
                          className="h-12 w-12 rounded-lg object-cover mr-4"
                        />
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {venue.name}
                          </div>
                          <div className="text-sm text-slate-500">
                            {venue.description?.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-900">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {venue.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-900">{venue.sport}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-900">
                        <CurrencyRupeeIcon className="w-4 h-4 mr-1" />
                        {venue.pricing?.hourlyRate || 0}/hr
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${venue.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {venue.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(venue)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit venue"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(venue._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete venue"
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
        )}
      </div>
    </div>
  )
}

export default VenueManagement;
