export class Team {
  name: string;

  slug: string;

  logoPng: string;

  logoSvg: string;

  coach: string;

  teamId: string;

  eliminated?: boolean;

  position?: number;
}

export class Award {
  position: number;

  award: number;
}

export class Parameters {
  drawOffset: number;

  relegationQuantity: number;

  classificationQuantity: number;

  playoffType: string;

  pointsPerWin: number;

  pointsPerDraw: number;
}

export class Tournament {
  id?: string;

  name: string;

  participants: number;

  image?: string;

  type: string;

  ownerId: string;

  drawDate?: Date;

  startDate?: Date;

  awards: Award[];

  parameters: Parameters;

  teams?: Team[];
}

export interface LoadTournamentParameters {
  ownerId?: string;
  id?: string;
  name?: string;
  type?: string;
}
