import { Statistics } from '@/models/statistics/statistics';
import { LastFixtures } from '@/models/lastFixtures/lastFixtures';
import { Standing } from './league';

class Team {
  id: number;

  name: string;

  logo: string;

  statistics?: Statistics;

  lastFixtures?: LastFixtures;
}

export class Odds {
  fixtureId?: number;

  home: string;

  draw: string;

  away: string;
}

type FixtureResumed = {
  id: number;
  isFavorite: boolean;
  timestamp: number;
  homeTeam: Team;
  awayTeam: Team;
  odds: Odds;
};

export class FixturesByLeague {
  id: number;

  name: string;

  logo: string;

  flag: string;

  isFavorite? = false;

  fixtures?: FixtureResumed[];

  standing?: Standing;
}

export class Fixture {
  id: number;

  date: string;

  timestamp: number;

  league: FixturesByLeague;

  homeTeam: Team;

  awayTeam: Team;

  odds?: Odds;

  isFavorite = false;
}

export class FixtureByDate {
  date: string;

  leagues: FixturesByLeague[];
}
