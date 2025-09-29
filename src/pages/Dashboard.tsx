import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { playersAPI, gamesAPI } from '../services/api';
import './Dashboard.css';

interface DashboardStats {
  totalPlayers: number;
  activePlayers: number;
  totalGames: number;
  upcomingGames: number;
  completedGames: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPlayers: 0,
    activePlayers: 0,
    totalGames: 0,
    upcomingGames: 0,
    completedGames: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [topPlayers, setTopPlayers] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch players data
      const playersResponse = await playersAPI.getPlayers();
      const players = playersResponse.data.data;
      
      // Fetch games data
      const gamesResponse = await gamesAPI.getGames();
      const games = gamesResponse.data.data;
      
      // Calculate stats
      const totalPlayers = players.length;
      const activePlayers = players.filter((p: any) => p.isActive).length;
      const totalGames = games.length;
      const upcomingGames = games.filter((g: any) => g.status === 'scheduled').length;
      const completedGames = games.filter((g: any) => g.status === 'completed').length;
      
      setStats({
        totalPlayers,
        activePlayers,
        totalGames,
        upcomingGames,
        completedGames
      });
      
      // Get recent games (last 5)
      const sortedGames = games
        .sort((a: any, b: any) => new Date(b.gameDate).getTime() - new Date(a.gameDate).getTime())
        .slice(0, 5);
      setRecentGames(sortedGames);
      
      // Get top players by points per game
      const sortedPlayers = players
        .filter((p: any) => p.isActive)
        .sort((a: any, b: any) => b.stats.pointsPerGame - a.stats.pointsPerGame)
        .slice(0, 5);
      setTopPlayers(sortedPlayers);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.name}!</p>
        </div>

        {/* User Profile Section */}
        <div className="user-profile-section">
          <h2>Your Profile</h2>
          <div className="profile-card">
            <div className="profile-info">
              <div className="profile-item">
                <span className="label">Name:</span>
                <span className="value">{user?.name}</span>
              </div>
              <div className="profile-item">
                <span className="label">Email:</span>
                <span className="value">{user?.email}</span>
              </div>
              <div className="profile-item">
                <span className="label">Role:</span>
                <span className="value role-badge">{user?.role}</span>
              </div>
              <div className="profile-item">
                <span className="label">User ID:</span>
                <div className="user-id-container">
                  <span className="user-id">{user?.id}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(user?.id || '');
                      alert('User ID copied to clipboard!');
                    }}
                    title="Copy User ID"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Instructions for Players */}
          {user?.role === 'player' && (
            <div className="player-instructions">
              <h3>How to Join a Team</h3>
              <div className="instructions-content">
                <p>To join a team, follow these steps:</p>
                <ol>
                  <li>Copy your User ID above using the copy button</li>
                  <li>Share your User ID with a coach</li>
                  <li>The coach will add you to their team using your User ID</li>
                  <li>Once added, your team information will appear here</li>
                </ol>
                <div className="instruction-note">
                  <strong>Note:</strong> Only coaches can add players to teams. Contact a coach to get started!
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Total Players</h3>
              <p className="stat-number">{stats.totalPlayers}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Active Players</h3>
              <p className="stat-number">{stats.activePlayers}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🏀</div>
            <div className="stat-content">
              <h3>Total Games</h3>
              <p className="stat-number">{stats.totalGames}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>Upcoming Games</h3>
              <p className="stat-number">{stats.upcomingGames}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <h3>Completed Games</h3>
              <p className="stat-number">{stats.completedGames}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="dashboard-section">
            <h2>Recent Games</h2>
            <div className="games-list">
              {recentGames.length > 0 ? (
                recentGames.map((game) => (
                  <div key={game._id} className="game-item">
                    <div className="game-teams">
                      <span className="team">{game.homeTeam}</span>
                      <span className="score">{game.homeScore} - {game.awayScore}</span>
                      <span className="team">{game.awayTeam}</span>
                    </div>
                    <div className="game-meta">
                      <span className="date">{formatDate(game.gameDate)}</span>
                      <span className={`status ${game.status}`}>
                        {game.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">No recent games found.</p>
              )}
            </div>
          </div>

          <div className="dashboard-section">
            <h2>Top Scorers</h2>
            <div className="players-list">
              {topPlayers.length > 0 ? (
                topPlayers.map((player, index) => (
                  <div key={player._id} className="player-item">
                    <div className="player-rank">#{index + 1}</div>
                    <div className="player-info">
                      <h4>{player.name}</h4>
                      <p>{player.team} • {player.position}</p>
                    </div>
                    <div className="player-stats">
                      <span className="ppg">{player.stats.pointsPerGame.toFixed(1)} PPG</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">No player data available.</p>
              )}
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn">
              <span className="action-icon">➕</span>
              <span>Add Player</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">🏀</span>
              <span>Schedule Game</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">📊</span>
              <span>View Statistics</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">⚙️</span>
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

