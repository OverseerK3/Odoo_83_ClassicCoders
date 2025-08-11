import React, { useEffect, useMemo, useState } from 'react';

const API_BASE = 'http://localhost:5000/api/teams';

const locations = [
  'Ahmedabad', 'Vadodara', 'Surat', 'Rajkot', 
  'Gandhinagar', 'Mehsana', 'Palanpur', 'Bhavnagar'
];

const MyTeam = () => {
  const [team, setTeam] = useState([]);
  const [pending, setPending] = useState([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const [inviteResults, setInviteResults] = useState([]);
  const [inviteMessage, setInviteMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = useMemo(() => localStorage.getItem('token') || '', []);
  const user = useMemo(() => { 
    try { 
      const userData = JSON.parse(localStorage.getItem('user')); 
      console.log('User data from localStorage:', userData);
      return userData;
    } catch (e) { 
      console.error('Error parsing user data:', e);
      return null; 
    } 
  }, []);
  
  const headers = useMemo(() => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log('Token being sent:', token.substring(0, 20) + '...');
    } else {
      console.warn('No token found in localStorage');
    }
    return headers;
  }, [token]);

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }
      
      try {
        setLoading(true); 
        setError('');
        console.log('Loading team data...');
        
        const [teamRes, invitesRes] = await Promise.all([
          fetch(`${API_BASE}/me`, { headers }),
          fetch(`${API_BASE}/invites`, { headers }),
        ]);
        
        console.log('Team response status:', teamRes.status);
        console.log('Invites response status:', invitesRes.status);
        
        if (!teamRes.ok) {
          const errorData = await teamRes.json().catch(() => ({}));
          throw new Error(errorData.message || `Team API error: ${teamRes.status}`);
        }
        
        if (!invitesRes.ok) {
          const errorData = await invitesRes.json().catch(() => ({}));
          throw new Error(errorData.message || `Invites API error: ${invitesRes.status}`);
        }
        
        const teamData = await teamRes.json();
        const invitesData = await invitesRes.json();
        
        console.log('Team data:', teamData);
        console.log('Invites data:', invitesData);
        
        const members = teamData?.members || (user ? [{ _id: user.id, username: user.username, email: user.email }] : []);
        setTeam(members);
        setPending(invitesData || []);
      } catch (e) { 
        console.error('Error loading team data:', e);
        setError(`Failed to load team data: ${e.message}`); 
      } finally { 
        setLoading(false); 
      }
    };
    load();
  }, [headers, user, token]);

  const handleSearch = async (e) => {
    const q = e.target.value; 
    setSearch(q);
    if (q.length < 2) { 
      setInviteResults([]); 
      return; 
    }
    
    if (!token) {
      setError('No authentication token found. Please login again.');
      return;
    }
    
    try { 
      console.log('Searching for players...');
      const res = await fetch(`${API_BASE}/search?query=${encodeURIComponent(q)}&location=${encodeURIComponent(selectedLocation)}`, { headers }); 
      
      console.log('Search response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Search API error: ${res.status}`);
      }
      
      const data = await res.json(); 
      console.log('Search results:', data);
      setInviteResults(data); 
    } catch (e) { 
      console.error('Search error:', e);
      setError(`Search failed: ${e.message}`);
      setInviteResults([]); 
    }
  };

  const handleLocationChange = async (location) => {
    setSelectedLocation(location);
    if (search.length >= 2) {
      try { 
        const res = await fetch(`${API_BASE}/search?query=${encodeURIComponent(search)}&location=${encodeURIComponent(location)}`, { headers }); 
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `Search API error: ${res.status}`);
        }
        
        const data = await res.json(); 
        setInviteResults(data); 
      } catch (e) { 
        console.error('Location change search error:', e);
        setError(`Search failed: ${e.message}`);
        setInviteResults([]); 
      }
    }
  };

  const handleInvite = async (player) => {
    if (!token) {
      setError('No authentication token found. Please login again.');
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/invite`, { 
        method: 'POST', 
        headers, 
        body: JSON.stringify({ toUserId: player._id }) 
      });
      
      if (!res.ok) { 
        const msg = await res.json().catch(() => ({ message: 'Failed to send invite' })); 
        throw new Error(msg.message); 
      }
      
      setInviteMessage(`Invite sent to ${player.username}`); 
      setTimeout(() => setInviteMessage(''), 2000);
      setInviteOpen(false); 
      setSearch(''); 
      setInviteResults([]);
    } catch (e) { 
      console.error('Invite error:', e);
      setInviteMessage(e.message); 
    }
  };

  const respondInvite = async (inviteId, action) => {
    if (!token) {
      setError('No authentication token found. Please login again.');
      return;
    }
    
    try { 
      const res = await fetch(`${API_BASE}/invites/${inviteId}/respond`, { 
        method: 'POST', 
        headers, 
        body: JSON.stringify({ action }) 
      }); 
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to respond'); 
      }
      
      const data = await res.json(); 
      if (action === 'accept') setTeam(data.team?.members || team); 
      setPending(pending.filter(p => p._id !== inviteId)); 
    } catch (e) { 
      console.error('Respond invite error:', e);
      setError(e.message); 
    }
  };

  // Show login prompt if no token
  if (!token) {
    return (
      <div className="w-full max-w-3xl mx-auto py-8">
        <div className="card p-6 text-center">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Authentication Required</h2>
          <p className="text-slate-600 mb-4">Please login to access your team features.</p>
          <a href="/login" className="btn-primary">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-8 flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">My Team</h1>
      {error && <div className="text-[var(--color-secondary)] bg-red-50 p-3 rounded border border-red-200">{error}</div>}
      <div className="card p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-700">Team Members</h2>
          <button className="btn-primary" onClick={() => setInviteOpen(true)}>Invite Player</button>
        </div>
        {loading ? (
          <div className="text-slate-500">Loading...</div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {team.map(member => (
              <div key={member._id} className="flex flex-col items-center gap-1 bg-white border border-slate-100 rounded-lg p-3 w-32 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-2xl text-slate-400 overflow-hidden">
                  <span>{(member.username || 'U')[0]}</span>
                </div>
                <span className="font-medium text-slate-800 text-sm text-center">{member.username}</span>
                <span className="text-xs text-slate-500 text-center">{member.email}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-6 mb-4">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Pending Invites</h2>
        {pending.length === 0 ? (
          <div className="text-slate-400">No pending invites.</div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {pending.map(player => (
              <div key={player._id} className="flex flex-col items-center gap-1 bg-white border border-slate-100 rounded-lg p-3 w-40 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-2xl text-slate-400 overflow-hidden">
                  <span>{(player.from?.username || 'U')[0]}</span>
                </div>
                <span className="font-medium text-slate-800 text-sm text-center">{player.from?.username}</span>
                <span className="text-xs text-slate-500 text-center">{player.from?.email}</span>
                <div className="flex gap-2 mt-2">
                  <button className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200" onClick={() => respondInvite(player._id, 'accept')}>Accept</button>
                  <button className="px-2 py-1 rounded bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] text-xs font-semibold hover:bg-[var(--color-secondary)]/20" onClick={() => respondInvite(player._id, 'reject')}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-slate-400 hover:text-slate-600" onClick={() => setInviteOpen(false)}>&times;</button>
            <h3 className="text-lg font-bold mb-4">Invite Player</h3>
            
            {/* Location Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Search Players</label>
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={search} 
                onChange={handleSearch} 
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" 
              />
            </div>

            {inviteResults.length === 0 && search.length > 1 && (
              <div className="text-slate-400 text-center">No players found in {selectedLocation}.</div>
            )}
            
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
              {inviteResults.map(player => (
                <button key={player._id} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-blue-50 transition border border-slate-100" onClick={() => handleInvite(player)}>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-lg text-slate-400 overflow-hidden">
                    <span>{player.username[0]}</span>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-slate-800">{player.username}</span>
                    <span className="text-xs text-slate-500">{player.email}</span>
                  </div>
                </button>
              ))}
            </div>
            {inviteMessage && <div className="text-green-600 text-center mt-2">{inviteMessage}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTeam;
