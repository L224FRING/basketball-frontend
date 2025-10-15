import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Home.css';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="home">
      <div className="hero">
        <div className="hero-content">
          <h1>Welcome to Basketball App</h1>
          <p>Manage players, track games, and analyze statistics all in one place.</p>
          
          {!user ? (
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary">Get Started</Link>
              <Link to="/login" className="btn btn-secondary">Login</Link>
            </div>
          ) : (
            <div className="hero-actions">
            </div>
          )}
        </div>
      </div>

      <div className="features">
        <div className="container">
          <h2>Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Player Management</h3>
              <p>Add, edit, and manage player profiles with detailed statistics and information.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🏀</div>
              <h3>Game Tracking</h3>
              <p>Track games, scores, and player performance in real-time.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Statistics</h3>
              <p>View comprehensive statistics and analytics for players and teams.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <h3>Role-based Access</h3>
              <p>Different access levels for players, coaches, and administrators.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cta">
        <div className="container">
          <h2>Ready to get started?</h2>
          <p>Join thousands of basketball teams already using our platform.</p>
          {!user && (
            <Link to="/register" className="btn btn-primary btn-large">
              Create Account
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

