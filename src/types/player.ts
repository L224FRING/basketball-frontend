import { Team } from "./team";
import { User } from "./user";

export interface Player {
  _id: string;
  name: string;
  team: Team;
  user: User;
  position: string;
  jerseyNumber: number;
  height: string;
  weight: number;
  age: number;
  stats: {
    pointsPerGame: number;
    reboundsPerGame: number;
    assistsPerGame: number;
    stealsPerGame: number;
    blocksPerGame: number;
  };
  // cumulative career/season points (keeps in sync with server Player.points)
  points?: number;
  isActive: boolean;
}
