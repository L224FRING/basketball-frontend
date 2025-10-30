import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { useAuth } from '../../context/AuthContext';
import { playersAPI, teamsAPI, gamesAPI } from '../../services/api';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopyId = async () => {
    if (!user?.id) return;
    try {
      await navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const [teamsCount, setTeamsCount] = useState<number | null>(null);
  const [playersCount, setPlayersCount] = useState<number | null>(null);
  const [gamesCount, setGamesCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [pRes, tRes, gRes] = await Promise.all([
          playersAPI.getPlayers(),
          teamsAPI.getTeams(),
          gamesAPI.getGames(),
        ]);

        const pData = pRes.data?.data ?? pRes.data ?? [];
        const tData = tRes.data?.data ?? tRes.data ?? [];
        const gData = gRes.data?.data ?? gRes.data ?? [];

        setPlayersCount(Array.isArray(pData) ? pData.length : 0);
        setTeamsCount(Array.isArray(tData) ? tData.length : 0);
        setGamesCount(Array.isArray(gData) ? gData.length : 0);
      } catch (err) {
        console.error('Failed to fetch dashboard counts', err);
        setPlayersCount(0);
        setTeamsCount(0);
        setGamesCount(0);
      }
    };

    fetchCounts();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome{user?.name ? `, ${user.name}` : ''}!</h1>
        <p className="dashboard-sub">Overview of teams, players and live games.</p>
      </div>

      <section className="dashboard-grid">
        <div className="card userid-card">
          <h3>Your User ID</h3>
          <p className="muted">Use this ID when needed — copy to clipboard</p>
          <div className="userid-row">
            <code className="userid-value">{user?.id ?? '—'}</code>
            <button className="btn-copy" onClick={handleCopyId}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        <div className="card stat">
          <h3>Teams</h3>
          <p className="big">{teamsCount === null ? '—' : teamsCount}</p>
          <p className="muted">Total teams</p>
        </div>

        <div className="card stat">
          <h3>Players</h3>
          <p className="big">{playersCount === null ? '—' : playersCount}</p>
          <p className="muted">Total players</p>
        </div>

        <div className="card stat">
          <h3>Live Games</h3>
          <p className="big">{gamesCount === null ? '—' : gamesCount}</p>
          <p className="muted">Ongoing</p>
        </div>

        <div className="card recent">
          <h3>Recent Activity</h3>
          <ul className="activity-list">
            <li>No recent activity yet</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
