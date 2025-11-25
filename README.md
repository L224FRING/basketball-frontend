# Basketball App - Frontend

React TypeScript frontend for the Basketball MERN Stack Application. This client application provides a responsive user interface for managing players, teams, and games with real-time updates.

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety and better developer experience
- **React Router v7** - Client-side routing and navigation
- **Axios** - HTTP client for API requests
- **Socket.IO Client** - Real-time bidirectional communication
- **React Testing Library** - Component testing
- **CSS3** - Custom styling

## Project Structure

```
client/
├── public/              # Static assets
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/      # Reusable components
│   │   └── Navbar.tsx   # Navigation bar
│   ├── context/         # React Context
│   │   └── AuthContext.tsx  # Authentication state management
│   ├── pages/           # Page components
│   │   ├── Auth/        # Login & Register pages
│   │   ├── Dashboard/   # Dashboard view
│   │   ├── Games/       # Game management pages
│   │   ├── Home/        # Landing page
│   │   ├── Players/     # Player management pages
│   │   └── Teams/       # Team management pages
│   ├── services/        # API services
│   │   └── api.ts       # Axios configuration and API calls
│   ├── types/           # TypeScript type definitions
│   │   ├── user.ts
│   │   ├── player.ts
│   │   ├── team.ts
│   │   └── game.ts
│   ├── App.tsx          # Main app component with routing
│   ├── index.tsx        # Entry point
│   └── setupTests.ts    # Test configuration
├── env.example          # Environment variables example
├── package.json
└── tsconfig.json        # TypeScript configuration
```

## Prerequisites

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- Backend server running on `http://localhost:5000` (or configured URL)

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your backend URL
   nano .env
   ```

   Example `.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

## Available Scripts

### `npm start`

Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload when you make changes.
You may also see lint errors in the console.

### `npm test`

Launches the test runner in interactive watch mode.
Tests are written using React Testing Library and Jest.

### `npm run build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for best performance.

The build is minified and filenames include hashes.
Your app is ready to be deployed!

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

## Features

### Authentication
- User registration with role selection
- Login with JWT token management
- Protected routes based on authentication status
- Persistent authentication using localStorage
- Automatic token refresh

### Player Management
- View all players with filtering options
- Create new player profiles
- Edit player information
- View detailed player statistics
- Delete players (admin only)

### Team Management
- View all teams
- Create new teams
- Edit team information
- Assign players to teams
- Delete teams (admin only)

### Game Management
- View all games with status filters
- Schedule new games
- View game details
- Update game scores in real-time
- Real-time score updates via WebSocket
- Delete games (admin only)

### Dashboard
- Overview of key statistics
- Recent games
- Quick access to main features
- Role-based content display

## API Integration

The frontend communicates with the backend API using Axios. All API calls are centralized in `src/services/api.ts`.

### API Configuration
```typescript
// Base URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Axios instance with interceptors for authentication
```

### WebSocket Integration
Real-time updates are handled using Socket.IO client:
```typescript
// Connect to Socket.IO server
const socket = io(SOCKET_URL);

// Authenticate socket connection
socket.emit('authenticate', { token });

// Listen for real-time updates
socket.on('scoreUpdate', handleScoreUpdate);
```

## Routing

The application uses React Router v7 for client-side routing:

- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Dashboard (protected)
- `/players` - Players list (protected)
- `/players/:id` - Player details (protected)
- `/teams` - Teams list (protected)
- `/games` - Games list (protected)
- `/games/:id` - Game details (protected)

## State Management

- **AuthContext**: Manages authentication state globally
- **Local State**: Component-level state using React hooks
- **Real-time State**: WebSocket events update state in real-time

## Styling

The application uses custom CSS with a consistent design system:
- Responsive layout for mobile and desktop
- Custom color scheme
- Reusable CSS classes
- Component-specific stylesheets

## Testing

Tests are written using React Testing Library and Jest:

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

Example test file: `src/App.test.tsx`

## Building for Production

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Serve the build folder**
   The build folder can be served using any static file server or integrated with the backend Express server.

## Environment Variables

Create a `.env` file in the client directory:

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:5000

# Socket.IO server URL
REACT_APP_SOCKET_URL=http://localhost:5000
```

## Troubleshooting

### CORS Issues
Ensure the backend has CORS configured to allow requests from `http://localhost:3000` during development.

### WebSocket Connection Issues
- Verify `REACT_APP_SOCKET_URL` is correctly set
- Check that the backend Socket.IO server is running
- Ensure JWT token is valid for socket authentication

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`

## Learn More

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [React Router Documentation](https://reactrouter.com/)
- [Socket.IO Client Documentation](https://socket.io/docs/v4/client-api/)
- [Create React App Documentation](https://create-react-app.dev/)
