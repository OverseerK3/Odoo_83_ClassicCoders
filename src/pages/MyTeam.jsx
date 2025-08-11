import React, { useEffect, useMemo, useState } from 'react';

const API_BASE = 'http://localhost:5000/api/teams';

const MyTeam = () => {
  const [team, setTeam] = useState([]);
  const [pending, setPending] = useState([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [inviteResults, setInviteResults] = useState([]);
  const [inviteMessage, setInviteMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = useMemo(() => localStorage.getItem('token') || '', []);
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  }, []);

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  // Load my team and invites
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [teamRes, invitesRes] = await Promise.all([
          fetch(`${API_BASE}/me`, { headers }),
          fetch(`${API_BASE}/invites`, { headers }),
        ]);
        const teamData = await teamRes.json();
        const invitesData = await invitesRes.json();
        const members = teamData?.members || (user ? [{ _id: user.id, username: user.username, email: user.email }] : []);
        setTeam(members);
        setPending(invitesData || []);
      } catch (e) {
        setError('Failed to load team data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [headers, user]);

  // Search users to invite
  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearch(q);
    if (q.length < 2) {
      setInviteResults([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/search?query=${encodeURIComponent(q)}`, { headers });
      const data = await res.json();
      setInviteResults(data);
    } catch {
      setInviteResults([]);
    }
  };

  // Send invite
  const handleInvite = async (player) => {
    try {
      const res = await fetch(`${API_BASE}/invite`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ toUserId: player._id }),
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({ message: 'Failed to send invite' }));
        throw new Error(msg.message || 'Failed to send invite');
      }
      setInviteMessage(`Invite sent to ${player.username}`);
      setTimeout(() => setInviteMessage(''), 2000);
      setInviteOpen(false);
      setSearch('');
      setInviteResults([]);
    } catch (e) {
      setInviteMessage(e.message);
    }
  };

  // Accept / Reject invite
  const respondInvite = async (inviteId, action) => {
    try {
      const res = await fetch(`${API_BASE}/invites/${inviteId}/respond`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to respond');
      if (action === 'accept') {
        setTeam(data.team?.members || team);
      }
      setPending(pending.filter(p => p._id !== inviteId));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8 flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">My Team</h1>
      {error && <div className="text-red-600">{error}</div>}
      {/* Team Members */}
      <div className="bg-white rounded-xl shadow p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Team Members</h2>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            onClick={() => setInviteOpen(true)}
          >
            Invite Player
          </button>
        </div>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {team.map(member => (
              <div key={member._id} className="flex flex-col items-center gap-1 bg-gray-50 rounded-lg p-3 w-32">
                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-2xl text-gray-400 overflow-hidden">
                  <span>{(member.username || 'U')[0]}</span>
                </div>
                <span className="font-medium text-gray-800 text-sm text-center">{member.username}</span>
                <span className="text-xs text-gray-500 text-center">{member.email}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Pending Invites */}
      <div className="bg-white rounded-xl shadow p-6 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Pending Invites</h2>
        {pending.length === 0 ? (
          <div className="text-gray-400">No pending invites.</div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {pending.map(player => (
              <div key={player._id} className="flex flex-col items-center gap-1 bg-gray-50 rounded-lg p-3 w-40">
                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-2xl text-gray-400 overflow-hidden">
                  <span>{(player.from?.username || 'U')[0]}</span>
                </div>
                <span className="font-medium text-gray-800 text-sm text-center">{player.from?.username}</span>
                <span className="text-xs text-gray-500 text-center">{player.from?.email}</span>
                <div className="flex gap-2 mt-2">
                  <button
                    className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200 transition"
                    onClick={() => respondInvite(player._id, 'accept')}
                  >
                    Accept
                  </button>
                  <button
                    className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition"
                    onClick={() => respondInvite(player._id, 'reject')}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Invite Modal */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setInviteOpen(false)}>&times;</button>
            <h3 className="text-lg font-bold mb-4">Invite Player</h3>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={handleSearch}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            {inviteResults.length === 0 && search.length > 1 && (
              <div className="text-gray-400 text-center">No players found.</div>
            )}
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
              {inviteResults.map(player => (
                <button
                  key={player._id}
                  className="flex items-center gap-3 px-3 py-2 rounded hover:bg-blue-50 transition border border-gray-100"
                  onClick={() => handleInvite(player)}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-lg text-gray-400 overflow-hidden">
                    <span>{player.username[0]}</span>
                  </div>
                  <span className="font-medium text-gray-800">{player.username}</span>
                  <span className="text-xs text-gray-500">{player.email}</span>
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
