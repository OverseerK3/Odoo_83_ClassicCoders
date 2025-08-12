import React, { useState, useEffect } from 'react';

const DebugPanel = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/debug/status');
      const data = await response.json();
      
      // Also fetch loyalty status if token exists
      if (token) {
        try {
          const loyaltyResponse = await fetch('http://localhost:5000/api/loyalty/my-status', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (loyaltyResponse.ok) {
            const loyaltyData = await loyaltyResponse.json();
            data.loyaltyStatus = loyaltyData;
          }
        } catch (loyaltyError) {
          console.error('Error fetching loyalty status:', loyaltyError);
        }
      }
      
      setStatus(data);
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSampleData = async () => {
    setCreating(true);
    try {
      // Create admin user
      const adminRes = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
          email: 'admin@quickcourt.com',
          password: 'admin123',
          role: 'admin'
        })
      });

      // Create facility manager
      const facilityRes = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'facility_manager',
          email: 'facility@quickcourt.com',
          password: 'facility123',
          role: 'facility_manager'
        })
      });

      // Create player
      const playerRes = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'player',
          email: 'player@quickcourt.com',
          password: 'player123',
          role: 'player'
        })
      });

      alert('Sample users created! Check console for details.');
      fetchStatus();
    } catch (error) {
      console.error('Error creating sample data:', error);
      alert('Error creating sample data');
    } finally {
      setCreating(false);
    }
  };

  const createSampleVenue = async () => {
    if (!token) {
      alert('Please login first');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/venues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: 'Test Sports Complex',
          location: 'Ahmedabad',
          sport: 'Cricket',
          description: 'A test venue for cricket',
          capacity: 22,
          amenities: ['Parking', 'Changing Rooms'],
          sportsSupported: ['Cricket', 'Football'],
          hourlyRate: 1000,
          operatingHours: { open: '06:00', close: '22:00' },
          contactInfo: { phone: '+91 9876543210' }
        })
      });

      if (response.ok) {
        alert('Sample venue created!');
        fetchStatus();
      } else {
        const error = await response.text();
        alert(`Error creating venue: ${error}`);
      }
    } catch (error) {
      console.error('Error creating venue:', error);
      alert('Error creating venue');
    }
  };

  const createSampleBooking = async () => {
    if (!token) {
      alert('Please login first');
      return;
    }

    if (!status?.venues?.length) {
      alert('Create a venue first');
      return;
    }

    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          venueId: status.venues[0]._id,
          date: tomorrow.toISOString().split('T')[0],
          startTime: '10:00',
          endTime: '12:00',
          courtName: 'Court 1',
          notes: 'Test booking'
        })
      });

      if (response.ok) {
        alert('Sample booking created!');
        fetchStatus();
      } else {
        const error = await response.text();
        alert(`Error creating booking: ${error}`);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Error creating booking');
    }
  };

  const triggerAutoComplete = async () => {
    if (!token) {
      alert('Please login first');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/bookings/admin/auto-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Auto-completion completed: ${result.completedBookings} bookings completed, ${result.rewardsEarned} rewards earned!`);
        fetchStatus();
      } else {
        const error = await response.text();
        alert(`Error with auto-complete: ${error}`);
      }
    } catch (error) {
      console.error('Error triggering auto-complete:', error);
      alert('Error triggering auto-complete');
    }
  };

  const createMultipleBookings = async () => {
    if (!token) {
      alert('Please login first');
      return;
    }

    if (!status?.venues?.length) {
      alert('Create a venue first');
      return;
    }

    try {
      const venue = status.venues[0];
      const baseDate = new Date();
      
      // Create 5 past bookings for testing loyalty system
      for (let i = 5; i >= 1; i--) {
        const bookingDate = new Date(baseDate);
        bookingDate.setDate(bookingDate.getDate() - i);
        
        const response = await fetch('http://localhost:5000/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            venueId: venue._id,
            date: bookingDate.toISOString().split('T')[0],
            startTime: `${10 + i}:00`,
            endTime: `${12 + i}:00`,
            courtName: 'Court 1',
            notes: `Test booking ${i} for loyalty system`
          })
        });

        if (!response.ok) {
          const error = await response.text();
          console.error(`Error creating booking ${i}:`, error);
        }
      }
      
      alert('5 test bookings created! Now trigger auto-complete to test loyalty system.');
      fetchStatus();
    } catch (error) {
      console.error('Error creating multiple bookings:', error);
      alert('Error creating multiple bookings');
    }
  };

  if (loading) {
    return <div className="p-6">Loading debug info...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Debug Panel</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Users: {status?.counts?.userCount || 0}</h3>
          {status?.users?.map(user => (
            <div key={user._id} className="text-sm text-gray-600">
              {user.username} ({user.role}) - {user.email}
            </div>
          ))}
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Venues: {status?.counts?.venueCount || 0}</h3>
          {status?.venues?.map(venue => (
            <div key={venue._id} className="text-sm text-gray-600">
              {venue.name} - {venue.location}
              <br />Owner: {venue.owner}
            </div>
          ))}
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Bookings: {status?.counts?.bookingCount || 0}</h3>
          {status?.bookings?.map(booking => (
            <div key={booking._id} className="text-sm text-gray-600">
              {booking.venue?.name} - {booking.date} ({booking.status})
              <br />Player: {booking.user?.username}
            </div>
          ))}
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Loyalty Status</h3>
          {status?.loyaltyStatus ? (
            <div className="text-sm text-gray-600">
              {status.loyaltyStatus.map(loyalty => (
                <div key={loyalty._id} className="mb-2">
                  <strong>{loyalty.venue?.name}</strong>
                  <br />Bookings: {loyalty.bookingCount}
                  <br />Cards: {loyalty.discountCards?.length || 0}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No loyalty data or not logged in</div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={createSampleData}
          disabled={creating}
          className="px-4 py-2 bg-blue-600 text-white rounded mr-2"
        >
          {creating ? 'Creating...' : 'Create Sample Users'}
        </button>
        
        <button
          onClick={createSampleVenue}
          className="px-4 py-2 bg-green-600 text-white rounded mr-2"
        >
          Create Sample Venue
        </button>
        
        <button
          onClick={createSampleBooking}
          className="px-4 py-2 bg-purple-600 text-white rounded mr-2"
        >
          Create Sample Booking
        </button>
        
        <button
          onClick={createMultipleBookings}
          className="px-4 py-2 bg-orange-600 text-white rounded mr-2"
        >
          Create 5 Test Bookings
        </button>
        
        <button
          onClick={triggerAutoComplete}
          className="px-4 py-2 bg-red-600 text-white rounded mr-2"
        >
          Trigger Auto-Complete
        </button>
        
        <button
          onClick={fetchStatus}
          className="px-4 py-2 bg-gray-600 text-white rounded"
        >
          Refresh Status
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded">
        <h3 className="font-semibold mb-2">Current Token:</h3>
        <p className="text-sm font-mono break-all">{token || 'No token found'}</p>
      </div>

      <div className="bg-gray-50 p-4 rounded">
        <h3 className="font-semibold mb-2">Raw Data:</h3>
        <pre className="text-xs overflow-auto max-h-64">
          {JSON.stringify(status, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default DebugPanel;
