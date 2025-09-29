import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🏀 Basketball App
        </Link>
        
        <div className="navbar-menu">
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/players" className="navbar-link">Players</Link>
          <Link to="/games" className="navbar-link">Games</Link>
          <Link to="/teams" className="navbar-link">Teams</Link>
          
          {user ? (
            <div className="navbar-user">
              <Link to="/dashboard" className="navbar-link">Dashboard</Link>
              <span className="navbar-user-info">
                Welcome, {user.name} ({user.role})
              </span>
              <button onClick={handleLogout} className="navbar-logout">
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/register" className="navbar-link navbar-register">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;