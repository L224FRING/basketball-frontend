import React, { useState, useEffect } from 'react';
import { playersAPI, teamsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Player } from '../../types/player';
import { Team } from '../../types/team';
import './Players.css';
import { PlayerForm } from './PlayerForm';



const Players: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [filters, setFilters] = useState({
    team: '',
    position: '',
    isActive: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, [filters]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await playersAPI.getPlayers(filters);
      setPlayers(response.data.data);
    } catch (err: any) {
      setError('Failed to fetch players');
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await teamsAPI.getTeams();
      setTeams(response.data.data);
    } catch (err: any) {
      console.error('Error fetching teams:', err);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      team: '',
      position: '',
      isActive: ''
    });
  };

  const handleCreatePlayer = async (playerData: any) => {
    try {
      await playersAPI.createPlayer(playerData);
      fetchPlayers();
      setShowCreateForm(false);
    } catch (error: any) {
      console.error('Error creating player:', error);
      alert(error.response?.data?.message || 'Failed to create player');
    }
  };

  const handleUpdatePlayer = async (playerId: string, playerData: any) => {
    try {
      await playersAPI.updatePlayer(playerId, playerData);
      fetchPlayers();
      setEditingPlayer(null);
    } catch (error: any) {
      console.error('Error updating player:', error);
      alert(error.response?.data?.message || 'Failed to update player');
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      try {
        await playersAPI.deletePlayer(playerId);
        fetchPlayers();
      } catch (error: any) {
        console.error('Error deleting player:', error);
        alert(error.response?.data?.message || 'Failed to delete player');
      }
    }
  };

  const canManagePlayer = (player: Player) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'coach') {
      // player.team may be an object or an id string
      const teamId = typeof player.team === 'string' ? player.team : player.team?._id;
      return !!teamId && user.managedTeams?.some((t) => t._id === teamId);
    }
    return false;
  };

  if (loading) {
    return (
      <div className="players-container">
        <div className="loading">Loading players...</div>
      </div>
    );
  }

  return (
    <div className="players-container">
      <div className="container">
        <div className="players-header">
          <h1>Players</h1>
          {user && (user.role === 'admin' || user.role === 'coach') && (
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              Add Player
            </button>
          )}
        </div>

        {showCreateForm && (
          <PlayerForm
            teams={teams}
            onSubmit={handleCreatePlayer}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {/* Coach Instructions */}

        {editingPlayer && (
          <PlayerForm
            player={editingPlayer}
            teams={teams}
            onSubmit={(data) => handleUpdatePlayer(editingPlayer._id, data)}
            onCancel={() => setEditingPlayer(null)}
          />
        )}

        <div className="filters">
          <select
            name="team"
            value={filters.team}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Teams</option>
            {teams.map((team) => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </select>

          <select
            name="position"
            value={filters.position}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Positions</option>
            <option value="PG">Point Guard</option>
            <option value="SG">Shooting Guard</option>
            <option value="SF">Small Forward</option>
            <option value="PF">Power Forward</option>
            <option value="C">Center</option>
          </select>

          <select
            name="isActive"
            value={filters.isActive}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Players</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <button onClick={clearFilters} className="btn btn-secondary">
            Clear Filters
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="players-grid">
        {players.map((player) => (
          <div key={player._id} className="player-card">
            <div className="player-header">
              <div>
                <h3 className="font-bold">{player.name}</h3>
                <div style={{display: 'flex', gap: '0.75rem', alignItems: 'center'}}>
                  <span className="text-sm text-gray-500">
                    {player.team?.name || "No Team"}
                  </span>
                  <span className="text-sm" style={{color: '#ffd166', fontWeight: 600}}>
                    PTS: {player.points ?? 0}
                  </span>
                </div>
              </div>

              {/* Actions always visible (if permitted) */}
              <div className="player-actions">
                {canManagePlayer(player) && (
                  <>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => setEditingPlayer(player)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeletePlayer(player._id)}
                      style={{marginLeft: '0.5rem'}}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Always-visible content (no expand) */}
            <div className="mt-3 space-y-2 text-sm">
                <span className="label font-medium">Position:</span>{" "}
                <span>{player.position}</span>
              </div>
              <div className="info-item">
                <span className="label font-medium">Jersey:</span>{" "}
                <span>#{player.jerseyNumber}</span>
              </div>
              <div className="info-item">
                <span className="label font-medium">Height:</span>{" "}
                <span>{player.height}</span>
              </div>
              <div className="info-item">
                <span className="label font-medium">Weight:</span>{" "}
                <span>{player.weight} lbs</span>
              </div>
              <div className="info-item">
                <span className="label font-medium">Age:</span>{" "}
                <span>{player.age}</span>
              </div>

              {/* Stats (condensed) */}
          </div>
        ))}
        </div>

        {players.length === 0 && !loading && (
          <div className="no-players">
            <p>No players found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Players;
