import React, { useState, useEffect } from 'react';
import { 
  ClockIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

const API_BASE = 'http://localhost:5000/api/facility';

const TimeSlotManagement = () => {
  const [venues, setVenues] = useState([]);
  const [courts, setCourts] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState('');
  const [selectedCourt, setSelectedCourt] = useState('');
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [blockFormData, setBlockFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    reason: ''
  });

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    if (selectedVenue) {
      fetchCourts(selectedVenue);
    }
  }, [selectedVenue]);

  useEffect(() => {
    if (selectedCourt) {
      fetchBlockedSlots(selectedCourt);
    }
  }, [selectedCourt]);

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
      if (data.length > 0 && !selectedCourt) {
        setSelectedCourt(data[0]._id);
      }
    } catch (err) {
      setError('Failed to load courts');
      console.error('Fetch courts error:', err);
    }
  };

  const fetchBlockedSlots = async (courtId) => {
    try {
      const res = await fetch(`${API_BASE}/courts/${courtId}/blocked-slots`, { headers });
      if (!res.ok) throw new Error('Failed to fetch blocked slots');
      const data = await res.json();
      setBlockedSlots(data);
    } catch (err) {
      setError('Failed to load blocked slots');
      console.error('Fetch blocked slots error:', err);
    }
  };

  const handleBlockTimeSlot = async (e) => {
    e.preventDefault();
    if (!selectedCourt) {
      setError('Please select a court first');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/time-slots/block`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          courtId: selectedCourt,
          ...blockFormData
        })
      });

      if (!res.ok) throw new Error('Failed to block time slot');
      
      await fetchBlockedSlots(selectedCourt);
      resetBlockForm();
      setError('');
    } catch (err) {
      setError('Failed to block time slot');
      console.error('Block time slot error:', err);
    }
  };

  const resetBlockForm = () => {
    setBlockFormData({
      date: '',
      startTime: '',
      endTime: '',
      reason: ''
    });
    setShowBlockForm(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const isSlotBlocked = (date, startTime, endTime) => {
    return blockedSlots.some(slot => 
      slot.date === date && 
      slot.startTime === startTime && 
      slot.endTime === endTime
    );
  };

  const generateCalendar = () => {
    const today = new Date();
    const calendar = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      calendar.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-IN', { weekday: 'short' }),
        dayNumber: date.getDate(),
        isToday: i === 0
      });
    }
    
    return calendar;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-slate-500">Loading time slots...</div>
      </div>
    );
  }

  const calendar = generateCalendar();
  const timeSlots = getTimeSlots();

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
          <h2 className="text-2xl font-bold text-slate-800">Time Slot Management</h2>
          <p className="text-slate-600">Manage availability and block time slots for maintenance</p>
        </div>
        
        <button
          onClick={() => setShowBlockForm(true)}
          disabled={!selectedCourt}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusIcon className="w-5 h-5" />
          Block Time Slot
        </button>
      </div>

      {/* Venue and Court Selectors */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Venue</label>
            <select
              value={selectedVenue}
              onChange={(e) => {
                setSelectedVenue(e.target.value);
                setSelectedCourt('');
              }}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a venue</option>
              {venues.map(venue => (
                <option key={venue._id} value={venue._id}>{venue.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Court</label>
            <select
              value={selectedCourt}
              onChange={(e) => setSelectedCourt(e.target.value)}
              disabled={!selectedVenue}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">Select a court</option>
              {courts.map(court => (
                <option key={court._id} value={court._id}>{court.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Block Time Slot Form */}
      {showBlockForm && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Block Time Slot</h3>
          
          <form onSubmit={handleBlockTimeSlot} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date *</label>
                <input
                  type="date"
                  required
                  value={blockFormData.date}
                  onChange={(e) => setBlockFormData(prev => ({ ...prev, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Start Time *</label>
                <select
                  required
                  value={blockFormData.startTime}
                  onChange={(e) => setBlockFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select start time</option>
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">End Time *</label>
                <select
                  required
                  value={blockFormData.endTime}
                  onChange={(e) => setBlockFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select end time</option>
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Reason *</label>
              <input
                type="text"
                required
                value={blockFormData.reason}
                onChange={(e) => setBlockFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="e.g., Maintenance, Cleaning, Private Event"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4">
              <button type="submit" className="btn-primary">
                Block Time Slot
              </button>
              <button 
                type="button" 
                onClick={resetBlockForm}
                className="btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Time Slot Calendar */}
      {selectedCourt && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Weekly View - {courts.find(c => c._id === selectedCourt)?.name}
          </h3>
          
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Calendar Header */}
              <div className="grid grid-cols-8 gap-1 mb-2">
                <div className="p-2 text-sm font-medium text-slate-700">Time</div>
                {calendar.map(day => (
                  <div key={day.date} className="p-2 text-center">
                    <div className="text-sm font-medium text-slate-700">{day.dayName}</div>
                    <div className={`text-lg font-bold ${day.isToday ? 'text-blue-600' : 'text-slate-800'}`}>
                      {day.dayNumber}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time Slots Grid */}
              <div className="space-y-1">
                {timeSlots.map(startTime => {
                  const endTime = timeSlots[timeSlots.indexOf(startTime) + 1];
                  if (!endTime) return null;

                  return (
                    <div key={startTime} className="grid grid-cols-8 gap-1">
                      <div className="p-2 text-sm text-slate-600 font-medium">
                        {startTime} - {endTime}
                      </div>
                      {calendar.map(day => {
                        const isBlocked = isSlotBlocked(day.date, startTime, endTime);
                        const isPast = new Date(`${day.date}T${startTime}`) < new Date();
                        
                        return (
                          <div
                            key={`${day.date}-${startTime}`}
                            className={`p-2 min-h-[40px] border rounded text-xs ${
                              isBlocked 
                                ? 'bg-red-100 border-red-300 text-red-800' 
                                : isPast 
                                  ? 'bg-slate-100 border-slate-200 text-slate-500'
                                  : 'bg-green-50 border-green-200 text-green-800'
                            }`}
                          >
                            {isBlocked ? (
                              <div className="flex items-center gap-1">
                                <WrenchScrewdriverIcon className="w-3 h-3" />
                                <span>Blocked</span>
                              </div>
                            ) : isPast ? (
                              <span>Past</span>
                            ) : (
                              <span>Available</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blocked Slots List */}
      {selectedCourt && blockedSlots.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Currently Blocked Slots</h3>
          
          <div className="space-y-3">
            {blockedSlots.map((slot) => (
              <div key={slot._id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                  <div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-medium text-slate-800">{slot.date}</span>
                      <span className="text-slate-600">{slot.startTime} - {slot.endTime}</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">{slot.blockReason}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    // In a real app, you'd implement unblock functionality
                    console.log('Unblock slot:', slot._id);
                  }}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                  title="Remove Block"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty States */}
      {!selectedVenue && venues.length > 0 && (
        <div className="text-center py-12">
          <ClockIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">Select a venue</h3>
          <p className="text-slate-500">Choose a venue from the dropdown to manage time slots</p>
        </div>
      )}

      {selectedVenue && courts.length === 0 && (
        <div className="text-center py-12">
          <ClockIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No courts available</h3>
          <p className="text-slate-500">Add courts to this venue to manage time slots</p>
        </div>
      )}

      {venues.length === 0 && (
        <div className="text-center py-12">
          <ClockIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No venues available</h3>
          <p className="text-slate-500">Create a venue first before managing time slots</p>
        </div>
      )}
    </div>
  );
};

export default TimeSlotManagement;
