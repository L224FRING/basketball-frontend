import React, { useState, useEffect } from 'react';
import { teamsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Teams.css';

interface Team {
  _id: string;
  name: string;
  description?: string;
  foundedYear?: number;
  homeVenue?: string;
  colors: {
    primary: string;
    secondary: string;
  };
  coach: {
    _id: string;
    name: string;
    email: string;
  };
  players: Array<{
    _id: string;
    name: string;
    position: string;
    jerseyNumber: number;
  }>;
  stats: {
    wins: number;
    losses: number;
    winPercentage: number;
  };
  isActive: boolean;
}

const Teams: React.FC = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await teamsAPI.getTeams();
      setTeams(response.data.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (teamData: any) => {
    try {
      await teamsAPI.createTeam(teamData);
      fetchTeams();
      setShowCreateForm(false);
    } catch (error: any) {
      console.error('Error creating team:', error);
      alert(error.response?.data?.message || 'Failed to create team');
    }
  };

  const handleUpdateTeam = async (teamId: string, teamData: any) => {
    try {
      await teamsAPI.updateTeam(teamId, teamData);
      fetchTeams();
      setEditingTeam(null);
    } catch (error: any) {
      console.error('Error updating team:', error);
      alert(error.response?.data?.message || 'Failed to update team');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await teamsAPI.deleteTeam(teamId);
        fetchTeams();
      } catch (error: any) {
        console.error('Error deleting team:', error);
        alert(error.response?.data?.message || 'Failed to delete team');
      }
    }
  };

  const canManageTeam = (team: Team) => {
    return user?.role === 'admin' || (user?.role === 'coach' && team.coach._id === user.id);
  };

  if (loading) {
    return <div className="loading">Loading teams...</div>;
  }

  return (
    <div className="teams-container">
      <div className="teams-header">
        <h1>Teams</h1>
        {(user?.role === 'admin' || user?.role === 'coach') && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            Create Team
          </button>
        )}
      </div>

      {showCreateForm && (
        <TeamForm
          onSubmit={handleCreateTeam}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {editingTeam && (
        <TeamForm
          team={editingTeam}
          onSubmit={(data) => handleUpdateTeam(editingTeam._id, data)}
          onCancel={() => setEditingTeam(null)}
        />
      )}

      <div className="teams-grid">
        {teams.map((team) => (
          <div key={team._id} className="team-card">
            <div 
              className="team-header"
              style={{ 
                backgroundColor: team.colors.primary,
                color: team.colors.secondary 
              }}
            >
              <h3>{team.name}</h3>
              {canManageTeam(team) && (
                <div className="team-actions">
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => setEditingTeam(team)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteTeam(team._id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            
            <div className="team-content">
              <div className="team-info">
                <p><strong>Coach:</strong> {team.coach.name}</p>
                {team.description && <p><strong>Description:</strong> {team.description}</p>}
                {team.foundedYear && <p><strong>Founded:</strong> {team.foundedYear}</p>}
                {team.homeVenue && <p><strong>Home Venue:</strong> {team.homeVenue}</p>}
              </div>
              
              <div className="team-stats">
                <h4>Record</h4>
                <p>{team.stats.wins}W - {team.stats.losses}L</p>
                <p>Win %: {(team.stats.winPercentage * 100).toFixed(1)}%</p>
              </div>
              
              <div className="team-players">
                <h4>Players ({team.players.length})</h4>
                <div className="players-list">
                  {team.players.slice(0, 5).map((player) => (
                    <div key={player._id} className="player-item">
                      #{player.jerseyNumber} {player.name} - {player.position}
                    </div>
                  ))}
                  {team.players.length > 5 && (
                    <div className="player-item">
                      +{team.players.length - 5} more players
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="no-teams">
          <p>No teams found. Create your first team to get started!</p>
        </div>
      )}
    </div>
  );
};

interface TeamFormProps {
  team?: Team | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const TeamForm: React.FC<TeamFormProps> = ({ team, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: team?.name || '',
    description: team?.description || '',
    foundedYear: team?.foundedYear || '',
    homeVenue: team?.homeVenue || '',
    colors: {
      primary: team?.colors?.primary || '#000000',
      secondary: team?.colors?.secondary || '#FFFFFF'
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      foundedYear: formData.foundedYear ? parseInt(formData.foundedYear.toString()) : undefined
    };
    onSubmit(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('colors.')) {
      const colorKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        colors: {
          ...prev.colors,
          [colorKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="team-form-overlay">
      <div className="team-form">
        <h2>{team ? 'Edit Team' : 'Create Team'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Team Name *</label>
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
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="foundedYear">Founded Year</label>
              <input
                type="number"
                id="foundedYear"
                name="foundedYear"
                value={formData.foundedYear}
                onChange={handleChange}
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="form-group">
              <label htmlFor="homeVenue">Home Venue</label>
              <input
                type="text"
                id="homeVenue"
                name="homeVenue"
                value={formData.homeVenue}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="colors.primary">Primary Color</label>
              <input
                type="color"
                id="colors.primary"
                name="colors.primary"
                value={formData.colors.primary}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="colors.secondary">Secondary Color</label>
              <input
                type="color"
                id="colors.secondary"
                name="colors.secondary"
                value={formData.colors.secondary}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {team ? 'Update Team' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Teams;



