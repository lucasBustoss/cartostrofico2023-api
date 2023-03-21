export class LastFixturesFixture {
  date: number;

  timestamp: number;
}

export class LastFixturesLeague {
  id: number;

  name: string;
}

class LastFixturesTeam {
  id: number;

  name: string;

  logo: string;
}

export class LastFixturesTeams {
  home: LastFixturesTeam;

  away: LastFixturesTeam;
}

export class LastFixturesGoals {
  home: number;

  away: number;
}

class LastFixtureScoreDetail {
  home: number;

  away: number;
}

export class LastFixtureScore {
  halftime: LastFixtureScoreDetail;

  fulltime: LastFixtureScoreDetail;

  extratime: LastFixtureScoreDetail;

  penalty: LastFixtureScoreDetail;
}

export class LastFixturesDetail {
  fixture: LastFixturesFixture;

  league: LastFixturesLeague;

  teams: LastFixturesTeams;

  goals: LastFixturesGoals;

  score: LastFixtureScore;
}

export class LastFixtures {
  updatedAt: Date;

  detail: LastFixturesDetail[];
}
