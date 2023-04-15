export class Draw {
  standing: any;

  matches: any;
}

export class Team {
  name: string;

  slug: string;

  logoPng: string;

  logoSvg: string;

  coach: string;

  teamId: string;

  eliminated?: boolean;

  position?: number;

  points?: number;

  corresponding?: number;
}

export class MatchPlayoff {
  homeTeam: Team;

  awayTeam: Team;

  matchNumber: number;
}

export class MatchesPlayoffs {
  teams: MatchPlayoff[];

  round: string;
}

export class Award {
  position: number;

  award: number;
}

export class CorrespondentRounds {
  phase: string;

  round: number;

  correspondent: number;

  played?: boolean;
}

export class Parameters {
  drawOffset: number;

  relegationQuantity: number;

  classificationQuantity: number;

  playoffType: string;

  pointsPerWin: number;

  pointsPerDraw: number;

  correspondentRounds?: CorrespondentRounds[];
}

export class Tournament {
  id?: string;

  name: string;

  participants: number;

  image?: string;

  type: string;

  ownerId: string;

  currentRound: number;

  currentPhase?: string;

  finished: boolean;

  drawDate?: Date;

  startDate?: Date;

  initialRound: number;

  eliminatedsInFirstRound?: number;

  awards: Award[];

  parameters: Parameters;

  standing?: any;

  teams?: Team[];

  matches?: any;

  matchesPlayoffs?: MatchesPlayoffs[] | any;
}

export interface LoadTournamentParameters {
  ownerId?: string;
  id?: string;
  name?: string;
  type?: string;
}
