import { Team } from "../../types/team";
import { Game } from "../../types/game";
import { useState } from "react";

interface GameFormProps {
  game?: Game; // make optional for create mode
  teams: Team[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const GameForm: React.FC<GameFormProps> = ({ game, teams, onSubmit, onCancel }) => {
  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    homeTeam: game?.homeTeam?._id || "",
    awayTeam: game?.awayTeam?._id || "",
    gameDate: game?.gameDate?.split("T")[0] || today, // ensure proper date format
    venue: game?.venue || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="game-form-overlay">
      <div className="game-form">
        <h2>{game ? "Edit Game" : "Create Game"}</h2>
        <form onSubmit={handleSubmit}>

          {/* Home Team */}
          <div className="form-group">
            <label htmlFor="homeTeam">Home Team *</label>
            <select
              id="homeTeam"
              name="homeTeam"
              value={formData.homeTeam}
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

          {/* Away Team */}
          <div className="form-group">
            <label htmlFor="awayTeam">Away Team *</label>
            <select
              id="awayTeam"
              name="awayTeam"
              value={formData.awayTeam}
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

          {/* Venue */}
          <div className="form-group">
            <label htmlFor="venue">Venue *</label>
            <input
              type="text"
              id="venue"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              required
            />
          </div>

          {/* Date */}
          <div className="form-group">
            <label htmlFor="gameDate">Date *</label>
            <input
              type="date"
              id="gameDate"
              name="gameDate"
              value={formData.gameDate}
              onChange={handleChange}
              required
            />
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {game ? "Update Game" : "Create Game"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

