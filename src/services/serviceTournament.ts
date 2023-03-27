import apiCartola from '@/infra/api/apiCartola';
import repositoryTournament from '@/infra/mongodb/repos/repositoryTournament';
import {
  Award,
  Draw,
  LoadTournamentParameters,
  Parameters,
  Team,
  Tournament,
} from '@/models/Tournament';

interface Teams {
  homeTeam: Team;
  awayTeam: Team;
}

interface RoundTeams {
  round: number;
  group?: string;
  teams: Teams[];
}

interface MatchByTeam {
  id: Team;
  matches: Team[];
}

class ServiceTournament {
  private readonly teamNames = [
    'Boa Timei FC',
    'Pura Várzea SC',
    'Esportes4 FC',
    'Refds FC',
    'TaytSohn FC',
    'Morschester United',
    'Dituga FC',
    'Lzcee FC',
    'Lindholm FC',
    'Codeck FC',
    'SAF Gabaritando FC',
    'Paçoca Rio FC',
    'Super Júlia FC',
    'LittleGrapes FC',
    'TheManaósFC',
    'Droninho FC',
    'Brup FC',
    'DAVIDGOOL FC ',
    'FAVARETTO FC',
    'King Curry FC',
  ];

  async load(parameters: LoadTournamentParameters): Promise<Tournament[]> {
    return repositoryTournament.load(parameters);
  }

  async loadOne(parameters: LoadTournamentParameters): Promise<Tournament> {
    return repositoryTournament.loadOne(parameters);
  }

  async create(
    name: string,
    participants: number,
    type: string,
    awards: Award[],
    parameters: Parameters,
    ownerId: string,
  ): Promise<Tournament> {
    const tournament = await repositoryTournament.save({
      name,
      participants,
      type,
      awards,
      parameters,
      ownerId,
    });

    if (process.env.NODE_ENV === 'dev') {
      for (let i = 0; i < participants; i++) {
        const teamName = this.teamNames[i];
        await this.addTeam(teamName, tournament.id);
      }
    }

    return tournament;
  }

  async addTeam(name: string, tournamentId: string): Promise<void> {
    const cartolaTeam = await this.getTeamOnCartola(name);

    if (!cartolaTeam) {
      throw new Error('Time não existe no Cartola!');
    }

    await repositoryTournament.saveTeam(cartolaTeam, tournamentId);
  }

  async getTeamOnCartola(name: string) {
    const cartolaTeam = await apiCartola.getTeam(name);

    return cartolaTeam;
  }

  async update(
    id: string,
    userId: string,
    name: string,
    participants: number,
    type: string,
    awards: Award[],
    parameters: Parameters,
  ): Promise<void> {
    await repositoryTournament.update({
      id,
      ownerId: userId,
      name,
      participants,
      type,
      awards,
      parameters,
    });
  }

  async drawTournament(id: string): Promise<Draw> {
    const tournament = await this.loadOne({ id });
    const teams = tournament.teams.sort(() => Math.random() - 0.5);
    let matches;
    let standing;

    if (tournament.type === 'pontos') {
      matches = await this.drawLeagueMatches(teams, tournament.participants);
      standing = await this.createLeagueStanding(teams);
    }

    if (tournament.type === 'resta') {
      matches = null;
      standing = await this.createLeftStanding(teams);
    }

    if (tournament.type === 'mata') {
      matches = await this.drawPlayoffMatches(teams);
      standing = null;
    }

    if (tournament.type === 'mesclado') {
      standing = [];
      matches = [];
      const groups = ['A', 'B', 'C', 'D'];
      const participants = [...teams];

      for (let i = 0; i < groups.length; i++) {
        const groupTeams = participants.splice(0, 4);

        const standingGroup = await this.createLeagueStanding(
          groupTeams,
          groups[i],
        );

        const matchesGroup = await this.drawLeagueMatches(
          groupTeams,
          groupTeams.length,
          groups[i],
        );

        standing.push(...standingGroup);
        matches.push(...matchesGroup);
      }
    }

    return { matches, standing };
  }

  async startTournament(id: string): Promise<void> {
    const tournament = await this.loadOne({ id });

    tournament.startDate = new Date();

    await repositoryTournament.update(tournament);
  }

  private async createLeftStanding(teams: Team[]) {
    return teams.map(t => {
      return {
        id: t.teamId,
        name: t.name,
        eliminated: false,
      };
    });
  }

  private async createLeagueStanding(teams: Team[], group?: string) {
    return teams.map(t => {
      return {
        id: t.teamId,
        name: t.name,
        group,
        position: 1,
        points: 0,
        matches: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        poinsFavor: 0,
        pointsAgainst: 0,
        pointsBalance: 0,
        average: 0,
      };
    });
  }

  private async drawPlayoffMatches(teams: Team[]) {
    const matches = [];
    let totalMatches =
      teams.length === 16
        ? 15
        : teams.length === 8
        ? 7
        : teams.length === 4
        ? 3
        : 2;

    let totalRounds =
      teams.length === 16
        ? 4
        : teams.length === 8
        ? 3
        : teams.length === 4
        ? 2
        : 1;

    let matchNumber = 0;
    let homeTeam = null;
    let awayTeam = null;

    // Round 1
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      if (i % 2 === 0) {
        matchNumber++;
        homeTeam = team;
      } else {
        awayTeam = team;

        const match = {
          homeTeam,
          awayTeam,
          round: 1,
          match: matchNumber,
        };

        matches.push(match);
        totalMatches--;
      }
    }

    totalRounds--;

    // Other rounds
    let matchNextRound = 1;
    let round = 2;
    while (totalRounds >= 1) {
      const matchesInRound =
        totalMatches === 7 ? 4 : totalMatches === 3 ? 2 : 1;

      for (let index = 0; index < matchesInRound; index++) {
        matchNumber++;
        const matchCorresponding = [];

        homeTeam = `Ganhador da partida ${matchNextRound}`;
        matchCorresponding.push(matchNextRound);
        matchNextRound++;

        awayTeam = `Ganhador da partida ${matchNextRound}`;
        matchCorresponding.push(matchNextRound);

        const match = {
          homeTeam,
          awayTeam,
          round,
          matchNumber,
          matchCorresponding,
        };

        matches.push(match);
        totalMatches--;
        matchNextRound++;
      }

      totalRounds--;
      round++;
    }

    return matches;
  }

  private async drawLeagueMatches(
    teams: Team[],
    participants: number,
    group?: string,
  ) {
    const matchesByTeam = await this.fixture(teams);
    const matchesByRound: RoundTeams[] = [];

    for (let round = 1; round <= participants - 1; round++) {
      const roundTeams: RoundTeams = {
        round,
        group,
        teams: [],
      };

      for (const team of matchesByTeam) {
        const { homeTeam, awayTeam } = this.defineHomeAwayTeam(
          team.id,
          team.matches[round - 1],
          round,
          matchesByRound,
        );

        if (
          !roundTeams.teams.find(
            t =>
              (t.homeTeam === homeTeam && t.awayTeam === awayTeam) ||
              (t.homeTeam === awayTeam && t.awayTeam === homeTeam),
          )
        ) {
          roundTeams.teams.push({ homeTeam, awayTeam });
        }
      }

      matchesByRound.push(roundTeams);
    }

    const matchesSecondTurn = [...matchesByRound];

    for (let i = 0; i < matchesByRound.length; i++) {
      const matchByRound = matchesByRound[i];
      const round = matchByRound.round + (participants - 1);

      const newMatchByRound = {
        round,
        group,
        teams: [] as Teams[],
      };

      for (let t = 0; t < matchByRound.teams.length; t++) {
        const teamsMbr = matchByRound.teams[t];

        const homeTeam = teamsMbr.awayTeam;
        const awayTeam = teamsMbr.homeTeam;

        newMatchByRound.teams.push({ homeTeam, awayTeam });
      }

      matchesSecondTurn.push(newMatchByRound);
    }

    return matchesSecondTurn;
  }

  async delete(id: string): Promise<void> {
    await repositoryTournament.delete(id);
  }

  // Schedule matches of 'n' teams:
  private fixture(teams: Team[]): MatchByTeam[] {
    const rounds = Array.from({ length: teams.length - 1 }, (_, j) =>
      this.roundFixture(teams.length, j),
    );
    return Array.from({ length: teams.length }, (_, i) => ({
      id: teams[i],
      matches: rounds.map(round => teams[round[i]]),
    }));
  }

  // Schedule single round `j` for 'n' teams:
  private roundFixture(n: number, j: number) {
    const m = n - 1;
    const round = Array.from({ length: n }, (_, i) => (m + j - i) % m); // circular shift
    round[(round[m] = (j * (n >> 1)) % m)] = m; // swapping self-match
    return round;
  }

  private defineHomeAwayTeam(
    teamA: Team,
    teamB: Team,
    round: number,
    matchesByRound: RoundTeams[],
  ): Teams {
    if (round === 1) {
      return { homeTeam: teamA, awayTeam: teamB };
    }

    const previousRound = matchesByRound.find(mbr => mbr.round === round - 1);
    let teamAWasHome = false;

    for (let i = 0; i < previousRound.teams.length; i++) {
      const teamsInRound = previousRound.teams[i];

      if (teamsInRound.homeTeam === teamA) {
        teamAWasHome = true;
      }
    }

    if (teamAWasHome) {
      return { homeTeam: teamB, awayTeam: teamA };
    }

    return { homeTeam: teamA, awayTeam: teamB };
  }
}

export default new ServiceTournament();
