import { Team } from "./team";

export interface Game {
    _id: string;
    homeTeam: Team;
    awayTeam: Team;
    homeScore: number;
    awayScore: number;
    gameDate: string;
    venue: string;
    status: string;
    attendance: number;
    timeRemaining: string;
    quater: number;
}
