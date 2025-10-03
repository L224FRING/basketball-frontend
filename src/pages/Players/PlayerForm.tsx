import { Player } from "../../types/player";
import { Team } from "../../types/team";
import { useState } from "react";
interface PlayerFormProps {
  player?: Player | null;
  teams: Team[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const PlayerForm: React.FC<PlayerFormProps> = ({ player, teams, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: player?.name || '',
    user: player?.user?.id || '',
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



