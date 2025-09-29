import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  register: (userData: any) =>
    api.post('/api/auth/register', userData),
  getMe: () => api.get('/api/auth/me'),
};

// Players API
export const playersAPI = {
  getPlayers: (params?: any) => api.get('/api/players', { params }),
  getPlayer: (id: string) => api.get(`/api/players/${id}`),
  createPlayer: (playerData: any) => api.post('/api/players', playerData),
  updatePlayer: (id: string, playerData: any) => api.put(`/api/players/${id}`, playerData),
  deletePlayer: (id: string) => api.delete(`/api/players/${id}`),
};

// Games API
export const gamesAPI = {
  getGames: (params?: any) => api.get('/api/games', { params }),
  getGame: (id: string) => api.get(`/api/games/${id}`),
  createGame: (gameData: any) => api.post('/api/games', gameData),
  updateGame: (id: string, gameData: any) => api.put(`/api/games/${id}`, gameData),
  updateScore: (id: string, scoreData: any) => api.put(`/api/games/${id}/score`, scoreData),
  deleteGame: (id: string) => api.delete(`/api/games/${id}`),
};

// Teams API
export const teamsAPI = {
  getTeams: (params?: any) => api.get('/api/teams', { params }),
  getTeam: (id: string) => api.get(`/api/teams/${id}`),
  createTeam: (teamData: any) => api.post('/api/teams', teamData),
  updateTeam: (id: string, teamData: any) => api.put(`/api/teams/${id}`, teamData),
  deleteTeam: (id: string) => api.delete(`/api/teams/${id}`),
  addPlayerToTeam: (teamId: string, playerId: string) => 
    api.post(`/api/teams/${teamId}/players`, { playerId }),
  removePlayerFromTeam: (teamId: string, playerId: string) => 
    api.delete(`/api/teams/${teamId}/players/${playerId}`),
};

export default api;
