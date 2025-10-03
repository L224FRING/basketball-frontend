import { Team } from "./team";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;

  // for coaches only
  managedTeams?: Team[];

  // for players
  team?: Team;


}
