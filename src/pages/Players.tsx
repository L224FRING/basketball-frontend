import React, { useState, useEffect } from 'react';
import { playersAPI, teamsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Players.css';

interface Team {
  _id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
  };
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Player {
  _id: string;
  name: string;
  team: Team;
  user: User;
  position: string;
  jerseyNumber: number;
  height: string;
  weight: number;
  age: number;
  stats: {
    pointsPerGame: number;
    reboundsPerGame: number;
    assistsPerGame: number;
    stealsPerGame: number;
    blocksPerGame: number;
  };
  isActive: boolean;
}

const Players: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
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
    return user?.role === 'admin' || 
           (user?.role === 'coach');
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
        {user && (user.role === 'admin' || user.role === 'coach') && (
          <div className="coach-instructions">
            <h3>How to Add Players to Teams</h3>
            <div className="instructions-content">
              <p>To add a player to a team:</p>
              <ol>
                <li>Make sure the player has registered an account with role "player"</li>
                <li>Ask the player for their User ID (they can find it on their Dashboard)</li>
                <li>Click "Add Player" and enter the player's User ID and team details</li>
                <li>The player will automatically be added to the selected team</li>
              </ol>
            </div>
          </div>
        )}

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
            {/* Header: Name + Team + Drop Arrow */}
            <div
              className="player-header cursor-pointer"
              onClick={() =>
                setExpanded(expanded === player._id ? null : player._id)
              }
            >
              <div>
                <h3 className="font-bold">{player.name}</h3>
                <span className="text-sm text-gray-500">
                  {player.team?.name || "No Team"}
                </span>
              </div>

              {/* Drop arrow (rotates when open) */}
              <span
                className={`drop-arrow ${expanded === player._id ? "open" : ""}`}
              >
                ▼
              </span>
            </div>

            {/* Dropdown Content */}
            {expanded === player._id && (
              <div className="mt-3 space-y-2 text-sm animate-slide">
                <div className="info-item">
                  <span className="label font-medium">User:</span>{" "}
                  <span>{player.user?.name || "N/A"}</span>
                </div>
                <div className="info-item">
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

                {/* Stats */}
                <div className="player-stats">
                  <h4 className="font-semibold mt-2">Season Stats</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>PPG: {player.stats.pointsPerGame.toFixed(1)}</div>
                    <div>RPG: {player.stats.reboundsPerGame.toFixed(1)}</div>
                    <div>APG: {player.stats.assistsPerGame.toFixed(1)}</div>
                    <div>SPG: {player.stats.stealsPerGame.toFixed(1)}</div>
                    <div>BPG: {player.stats.blocksPerGame.toFixed(1)}</div>
                  </div>
                </div>

                {/* Actions (Admin/Coach only) */}
                {canManagePlayer(player) && (
                  <div className="player-actions flex gap-2 mt-2">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => setEditingPlayer(player)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeletePlayer(player._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
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

interface PlayerFormProps {
  player?: Player | null;
  teams: Team[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const PlayerForm: React.FC<PlayerFormProps> = ({ player, teams, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: player?.name || '',
    user: player?.user?._id || '',
    team: player?.team?._id || '',
    position: player?.position || '',
    jerseyNumber: player?.jerseyNumber || '',
    height: player?.height || '',
    weight: player?.weight || '',
    age: player?.age || '',
    isActive: player?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      jerseyNumber: parseInt(formData.jerseyNumber.toString()),
      weight: parseInt(formData.weight.toString()),
      age: parseInt(formData.age.toString())
    };
    onSubmit(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="player-form-overlay">
      <div className="player-form">
        <h2>{player ? 'Edit Player' : 'Create Player'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Player Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="user">User ID *</label>
            <input
              type="text"
              id="user"
              name="user"
              value={formData.user}
              onChange={handleChange}
              required
              placeholder="Enter user ID"
            />
            <small className="form-help">
              Ask the player for their User ID from their Dashboard
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="team">Team *</label>
            <select
              id="team"
              name="team"
              value={formData.team}
              onChange={handleChange}
              required
            >
              <option value="">Select a team</option>
              {teams.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="position">Position *</label>
              <select
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
              >
                <option value="">Select position</option>
                <option value="PG">Point Guard</option>
                <option value="SG">Shooting Guard</option>
                <option value="SF">Small Forward</option>
                <option value="PF">Power Forward</option>
                <option value="C">Center</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="jerseyNumber">Jersey Number *</label>
              <input
                type="number"
                id="jerseyNumber"
                name="jerseyNumber"
                value={formData.jerseyNumber}
                onChange={handleChange}
                min="0"
                max="99"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="height">Height *</label>
              <input
                type="text"
                id="height"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="e.g., 6'5&quot;"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="weight">Weight (lbs) *</label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                min="100"
                max="400"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">Age *</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="16"
                max="50"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="isActive">Status</label>
              <select
                id="isActive"
                name="isActive"
                value={formData.isActive.toString()}
                onChange={handleChange}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {player ? 'Update Player' : 'Create Player'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Players;

