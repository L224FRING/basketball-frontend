import { Team } from "../../types/team";
import React, { useState, useEffect } from "react";
import { useAuth } from '../../context/AuthContext';
import { teamsAPI } from '../../services/api';

interface TeamFormProps {
  team?: Team | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const TeamForm: React.FC<TeamFormProps> = ({ team, onSubmit, onCancel }) => {
  interface FormState {
    name: string;
    description: string;
    foundedYear: string | number | '';
    homeVenue: string;
    colors: { primary: string; secondary: string };
    coach: string;
  }

  const [formData, setFormData] = useState<FormState>({
    name: team?.name || '',
    description: team?.description || '',
    foundedYear: team?.foundedYear || '',
    homeVenue: team?.homeVenue || '',
    colors: {
      primary: team?.colors?.primary || '#000000',
      secondary: team?.colors?.secondary || '#FFFFFF'
    },
    coach: typeof team?.coach === 'string' ? (team.coach as string) : (team?.coach?._id || '')
  });

  const { user } = useAuth();
  const [coaches, setCoaches] = useState<Array<any>>([]);

  useEffect(() => {
    const loadCoaches = async () => {
      if (user?.role !== 'admin') return;
      try {
        const res = await teamsAPI.getCoaches();
        setCoaches(res.data?.data || []);
      } catch (err) {
        console.error('Failed to load coaches', err);
      }
    };
    loadCoaches();
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      foundedYear: formData.foundedYear ? parseInt(formData.foundedYear.toString()) : undefined
    };
    onSubmit(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const { name, value } = target;
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

          {user?.role === 'admin' && (
            <div className="form-group">
              <label htmlFor="coach">Assign Coach</label>
              <select id="coach" name="coach" value={formData.coach} onChange={handleChange}>
                <option value="">Unassigned</option>
                {coaches.map(c => (
                  <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
                ))}
              </select>
            </div>
          )}

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





