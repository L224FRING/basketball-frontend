export interface Team {
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


