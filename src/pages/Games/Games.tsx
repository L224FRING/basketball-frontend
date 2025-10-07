import React, { useState, useEffect } from 'react';
import { gamesAPI, teamsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Games.css';
import { Game } from '../../types/game';
import { Team } from '../../types/team';
import { GameForm } from './GameForm';

const Games: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    team: '',
    date: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user } = useAuth();
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  useEffect(() => {
    fetchGames();
    fetchTeams();
  }, [filters]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await gamesAPI.getGames(filters);
      setGames(response.data.data);
    } catch (err: any) {
      setError('Failed to fetch games');
      console.error('Error fetching games:', err);
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

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      team: '',
      date: ''
    });
  };

  const handleCreateGame = async (gameData: any) => {
    try {
      await gamesAPI.createGame(gameData);
      fetchGames();
      setShowCreateForm(false);
    } catch (error: any) {
      console.error('Error creating Game:', error);
      alert(error.response?.data?.message || 'Failed to create game');
    }
  };


  const handleUpdateGame = async (gameId: string, gameData: any) => {
    try {
      await gamesAPI.updateGame(gameId, gameData);
      fetchGames();
      setEditingGame(null);
    } catch (error: any) {
      console.error('Error updating game:', error);
      alert(error.response?.data?.message || 'Failed to update game');
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      try {
        await gamesAPI.deleteGame(gameId);
        fetchGames();
      } catch (error: any) {
        console.error('Error deleting player:', error);
        alert(error.response?.data?.message || 'Failed to delete game');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'scheduled';
      case 'in_progress': return 'in-progress';
      case 'completed': return 'completed';
      case 'cancelled': return 'cancelled';
      default: return 'scheduled';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="games-container">
        <div className="loading">Loading games...</div>
      </div>
    );
  }

  return (
    <div className="games-container">
      <div className="container">
        <div className="games-header">
          <h1>Games</h1>
          {user && (user.role === 'admin' || user.role === 'coach') && (
            <button className="btn btn-primary" onClick={()=>setShowCreateForm(true)} >Add Game</button>
              
          )}
        </div>


        {showCreateForm && (
          <GameForm
            teams={teams}
            onSubmit={handleCreateGame}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {editingGame && (
          <GameForm
            game={editingGame}
            teams={teams}
            onSubmit={(data) => handleUpdateGame(editingGame._id, data)}
            onCancel={() => setEditingGame(null)}
          />
        )}
        <div className="filters">
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <input
            type="text"
            name="team"
            value={filters.team}
            onChange={handleFilterChange}
            placeholder="Search by team..."
            className="filter-input"
          />

          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
            className="filter-input"
          />

          <button onClick={clearFilters} className="btn btn-secondary">
            Clear Filters
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="games-list">
          {games.map((game) => (
            <div key={game._id} className="game-card">
              <div className="game-header">
                <div className="game-teams">
                  <div className="team">
                    <span className="team-name">{game.homeTeam.name}</span>
                    <span className="team-score">{game.homeScore}</span>
                  </div>
                  <div className="vs">VS</div>
                  <div className="team">
                    <span className="team-name">{game.awayTeam.name}</span>
                    <span className="team-score">{game.awayScore}</span>
                  </div>
                </div>
                <span className={`status ${getStatusColor(game.status)}`}>
                  {game.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="game-info">
                <div className="info-item">
                  <span className="label">Date:</span>
                  <span className="value">{formatDate(game.gameDate)}</span>
                </div>
                {game.venue && (
                  <div className="info-item">
                    <span className="label">Venue:</span>
                    <span className="value">{game.venue}</span>
                  </div>
                )}
                {game.attendance && (
                  <div className="info-item">
                    <span className="label">Attendance:</span>
                    <span className="value">{game.attendance.toLocaleString()}</span>
                  </div>
                )}
                {game.status === 'in_progress' && (
                  <div className="info-item">
                    <span className="label">Quarter:</span>
                    <span className="value">{game.quater}</span>
                  </div>
                )}
                {game.status === 'in_progress' && (
                  <div className="info-item">
                    <span className="label">Time:</span>
                    <span className="value">{game.timeRemaining}</span>
                  </div>
                )}
              </div>

              {user && (user.role === 'admin' || user.role === 'coach') && (
                <div className="game-actions">
                  <button className="btn btn-sm btn-secondary">Edit</button>
                  {game.status === 'scheduled' && (
                    <button className="btn btn-sm btn-primary">Start Game</button>
                  )}
                  {game.status === 'in_progress' && (
                    <button className="btn btn-sm btn-success" onClick={()=>setEditingGame(game)}>Update Score</button>
                  )}
                  {(
                    <button className="btn btn-sm btn-danger" onClick={()=>handleDeleteGame(game._id)}>Delete</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {games.length === 0 && !loading && (
          <div className="no-games">
            <p>No games found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Games;

