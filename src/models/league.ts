class StandingTeam {
  id: number;

  name: string;

  logo: string;
}

class GoalsGamesPlayed {
  for: number;

  against: number;
}

class GamesPlayed {
  played: number;

  win: number;

  draw: number;

  lose: number;

  goals: GoalsGamesPlayed;
}

export class StandingTeams {
  rank: number;

  team: StandingTeam;

  points: number;

  goalsDiff: number;

  group: string;

  form: string;

  description: string;

  all: GamesPlayed;

  home: GamesPlayed;

  away: GamesPlayed;
}

export class Standing {
  updatedAt: Date;

  teams: StandingTeams[];
}

export class League {
  id: number;

  name: string;

  logo: string;

  flag: string;

  isFavorite? = false;

  standing?: Standing;
}
