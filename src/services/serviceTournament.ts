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
      currentRound: 0,
      currentPhase: type === 'mesclado' ? 'group' : null,
      finished: false,
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
    currentRound: number,
    finished: boolean,
    awards: Award[],
    parameters: Parameters,
    matches?: any,
    standing?: any,
  ): Promise<void> {
    await repositoryTournament.update({
      id,
      ownerId: userId,
      name,
      participants,
      type,
      currentRound,
      finished,
      awards,
      parameters,
      matches,
      standing,
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

    for (let i = 0; i < tournament.parameters.correspondentRounds.length; i++) {
      const cr = tournament.parameters.correspondentRounds[i];

      cr.played = false;
    }

    tournament.currentRound = 1;
    tournament.currentPhase = 'group';
    tournament.finished = false;
    tournament.matches = tournament.type !== 'mata' ? matches : null;
    tournament.matchesPlayoffs = tournament.type === 'mata' ? matches : null;
    tournament.standing = standing;
    tournament.drawDate = new Date();

    await repositoryTournament.update(tournament);

    return { matches, standing };
  }

  async startTournament(id: string): Promise<void> {
    const tournament = await this.loadOne({ id });

    tournament.startDate = new Date();

    await repositoryTournament.update(tournament);
  }

  async updatePoints(id: string): Promise<void> {
    const tournament = await this.loadOne({ id });

    const statusMarket = await apiCartola.getStatusMarket();

    let actualRound =
      process.env.NODE_ENV === 'dev' ? 1 : statusMarket.actualRound;

    // FOR MOCKADO PARA SIMULAR 10 RODADAS
    for (actualRound; actualRound <= 15; actualRound++) {
      let round;

      if (tournament.finished) {
        return;
      }

      if (tournament.type === 'pontos' || tournament.type === 'mesclado') {
        const correspondent =
          tournament.type === 'mesclado' &&
          tournament.parameters.correspondentRounds.find(
            cr => cr.correspondent === actualRound,
          );

        if (correspondent) {
          if (tournament.currentPhase === 'group') {
            round = tournament.matches.find(
              (m: any) => m.round === correspondent.round,
            );
            tournament.currentRound = correspondent.round;
          } else {
            round = tournament.matchesPlayoffs.find(
              (m: any) =>
                m.round === correspondent.phase && !correspondent.played,
            );
            tournament.currentRound = correspondent.round;
          }
        } else {
          round = tournament.matches.find((m: any) => m.round === actualRound);
          tournament.currentRound = actualRound;
        }

        if (round) {
          for (let i = 0; i < round.teams.length; i++) {
            const match = round.teams[i];

            const { homeTeam, awayTeam } = match;
            if (process.env.NODE_ENV === 'dev') {
              const homePoints = await apiCartola.getTeamPointsByJson(
                homeTeam.teamId,
              );

              const awayPoints = await apiCartola.getTeamPointsByJson(
                awayTeam.teamId,
              );

              if (tournament.currentPhase !== 'group') {
                if (tournament.currentRound === 1) {
                  homeTeam.points = 0;
                  awayTeam.points = 0;
                }

                homeTeam.points += homePoints;
                awayTeam.points += awayPoints;
              } else {
                homeTeam.points = homePoints;
                awayTeam.points = awayPoints;
              }
            } else {
              homeTeam.points = await apiCartola.getTeamPoints(homeTeam.teamId);
              awayTeam.points = await apiCartola.getTeamPoints(awayTeam.teamId);
            }
          }

          if (process.env.NODE_ENV === 'dev') {
            if (
              (tournament.type === 'mesclado' &&
                tournament.currentPhase === 'group' &&
                correspondent &&
                tournament.currentRound === correspondent.round) ||
              (tournament.type !== 'mesclado' &&
                tournament.currentRound === actualRound)
            ) {
              tournament.standing = await this.updateStanding(tournament);
            } else if (
              tournament.type === 'mesclado' &&
              tournament.currentPhase !== 'group' &&
              tournament.currentRound === 2
            ) {
              await this.updatePlayoffs(tournament);
            }
          } else if (
            (tournament.type === 'mesclado' &&
              tournament.currentPhase === 'group' &&
              correspondent &&
              tournament.currentRound !== correspondent.round) ||
            (tournament.type !== 'mesclado' &&
              tournament.currentRound !== actualRound)
          ) {
            tournament.standing = await this.updateStanding(tournament);
          }
        }

        if (correspondent) {
          correspondent.played = true;
        }
      }

      if (tournament.type === 'mesclado') {
        if (
          tournament.currentPhase === 'final' &&
          tournament.currentRound === 2
        ) {
          tournament.finished = true;
        }

        if (!tournament.finished) {
          const updatePhase = await this.checkIfNeedsChangePhase(tournament);
          tournament.currentPhase = updatePhase.phase;
          tournament.currentRound = updatePhase.round;

          if (tournament.currentPhase !== 'group') {
            if (!tournament.matchesPlayoffs) {
              const teamsPlayoffs = [];

              const { standing } = tournament;
              teamsPlayoffs.push(
                ...this.getBestTeamsByGroup(tournament, standing, 'A', 2),
              );
              teamsPlayoffs.push(
                ...this.getBestTeamsByGroup(tournament, standing, 'B', 2),
              );
              teamsPlayoffs.push(
                ...this.getBestTeamsByGroup(tournament, standing, 'C', 2),
              );
              teamsPlayoffs.push(
                ...this.getBestTeamsByGroup(tournament, standing, 'D', 2),
              );

              tournament.matchesPlayoffs = await this.drawPlayoffMatches(
                teamsPlayoffs,
              );
            }

            // Significa que mudou de fase, então tenho que gerar novos jogos
            if (
              tournament.currentPhase !== 'quarter' &&
              tournament.currentRound === 1
            ) {
              const phasesPlayed =
                tournament.parameters.correspondentRounds.filter(
                  cr => !!cr.played,
                );

              const lastPhase =
                phasesPlayed.length > 0 &&
                phasesPlayed[phasesPlayed.length - 1].phase;

              const nextMatches = tournament.matchesPlayoffs.find(
                (mp: any) => mp.round === tournament.currentPhase,
              );

              const lastPhaseMatches = tournament.matchesPlayoffs.find(
                (mp: any) => mp.round === lastPhase,
              );

              for (let i = 0; i < nextMatches.teams.length; i++) {
                const match = nextMatches.teams[i];
                const correspondentMatchHome = lastPhaseMatches.teams.find(
                  (m: any) => m.matchNumber === match.homeTeam.corresponding,
                );

                if (!correspondentMatchHome.homeTeam.eliminated) {
                  match.homeTeam = correspondentMatchHome.homeTeam;
                } else {
                  match.homeTeam = correspondentMatchHome.awayTeam;
                }

                const correspondentMatchAway = lastPhaseMatches.teams.find(
                  (m: any) => m.matchNumber === match.awayTeam.corresponding,
                );

                if (!correspondentMatchAway.homeTeam.eliminated) {
                  match.awayTeam = correspondentMatchAway.homeTeam;
                } else {
                  match.awayTeam = correspondentMatchAway.awayTeam;
                }
              }
            }
          }
        }
      }

      if (tournament.type === 'resta') {
        tournament.standing = await this.updateStanding(tournament);
      }

      await repositoryTournament.update(tournament);
    }
  }

  async updateStanding(tournament: Tournament): Promise<void> {
    const { standing } = tournament;
    let matchesRound;

    if (
      tournament.type === 'pontos' ||
      (tournament.type === 'mesclado' && tournament.currentPhase === 'group')
    ) {
      matchesRound = tournament.matches.find(
        (m: any) => m.round === tournament.currentRound,
      );

      if (matchesRound) {
        for (let i = 0; i < matchesRound.teams.length; i++) {
          const match = matchesRound.teams[i];

          const { homeTeam, awayTeam } = match;

          const homeTeamStanding = standing.find(
            (st: any) => st.id === homeTeam.teamId,
          );

          const awayTeamStanding = standing.find(
            (st: any) => st.id === awayTeam.teamId,
          );

          homeTeamStanding.matches += 1;
          homeTeamStanding.pointsFavor += homeTeam.points;
          homeTeamStanding.pointsAgainst += awayTeam.points;
          homeTeamStanding.pointsBalance = Number(
            (
              homeTeamStanding.pointsFavor - homeTeamStanding.pointsAgainst
            ).toFixed(2),
          );

          awayTeamStanding.matches += 1;
          awayTeamStanding.pointsFavor += awayTeam.points;
          awayTeamStanding.pointsAgainst += homeTeam.points;
          awayTeamStanding.pointsBalance = Number(
            (
              awayTeamStanding.pointsFavor - awayTeamStanding.pointsAgainst
            ).toFixed(2),
          );

          if (
            Math.abs(homeTeam.points - awayTeam.points) <
              tournament.parameters.drawOffset ||
            homeTeam.points === awayTeam.points
          ) {
            homeTeamStanding.points += 1;
            homeTeamStanding.draws += 1;

            awayTeamStanding.points += 1;
            awayTeamStanding.draws += 1;
          } else if (homeTeam.points > awayTeam.points) {
            homeTeamStanding.points += 3;
            homeTeamStanding.wins += 1;

            awayTeamStanding.losses += 1;
          } else if (homeTeam.points < awayTeam.points) {
            awayTeamStanding.points += 3;
            awayTeamStanding.wins += 1;

            homeTeamStanding.losses += 1;
          }

          const totalPointsHome = homeTeamStanding.matches * 3;
          const earnedPointsHome =
            homeTeamStanding.wins * 3 + homeTeamStanding.draws;

          homeTeamStanding.average = (
            earnedPointsHome / totalPointsHome
          ).toFixed();

          const totalPointsAway = awayTeamStanding.matches * 3;
          const earnedPointAway =
            awayTeamStanding.wins * 3 + awayTeamStanding.draws;

          awayTeamStanding.average = (
            earnedPointAway / totalPointsAway
          ).toFixed();

          standing.sort((a: any, b: any) => {
            return b.points - a.points || b.pointsFavor - a.pointsFavor;
          });

          for (let j = 1; j <= standing.length; j++) {
            const team = standing[j - 1];
            team.position = j;
          }
        }
      }
    }

    if (tournament.type === 'resta') {
      for (let i = 0; i < standing.length; i++) {
        const team = standing[i];

        if (process.env.NODE_ENV === 'dev') {
          team.points = await apiCartola.getTeamPointsByJson(team.id);
        } else {
          team.points = await apiCartola.getTeamPoints(team.id);
        }
      }

      standing.sort((a: any, b: any) => {
        return b.points - a.points;
      });

      standing[standing.length - 1].eliminated = true;
    }

    return standing;
  }

  async updatePlayoffs(tournament: Tournament): Promise<void> {
    const matches = tournament.matchesPlayoffs.find(
      (mp: any) => mp.round === tournament.currentPhase,
    );

    for (let i = 0; i < matches.teams.length; i++) {
      const match = matches.teams[i];
      const { homeTeam, awayTeam } = match;

      console.log(homeTeam);
      if (homeTeam.points > awayTeam.points) {
        awayTeam.eliminated = true;
      } else if (awayTeam.points > homeTeam.points) {
        homeTeam.eliminated = false;
      }
    }
  }

  async delete(id: string): Promise<void> {
    await repositoryTournament.delete(id);
  }

  // #region Private methods

  private async createLeftStanding(teams: Team[]) {
    return teams.map(t => {
      return {
        id: t.teamId,
        name: t.name,
        logo: t.logoSvg,
        eliminated: false,
      };
    });
  }

  private async createLeagueStanding(teams: Team[], group?: string) {
    return teams.map(t => {
      return {
        id: t.teamId,
        name: t.name,
        logo: t.logoSvg,
        group,
        position: 1,
        points: 0,
        matches: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        pointsFavor: 0,
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

    const totalRoundsTournament = totalRounds;
    let matchNumber = 0;
    let homeTeam = null;
    let awayTeam = null;

    const matchRound1 = {
      teams: [] as any[],
      round: this.getRoundName(totalRoundsTournament, 1),
    };

    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      if (i % 2 === 0) {
        matchNumber++;
        homeTeam = team;
        homeTeam.points = 0;
      } else {
        awayTeam = team;
        awayTeam.points = 0;

        matchRound1.teams.push({ homeTeam, awayTeam, matchNumber });

        totalMatches--;
      }
    }

    matches.push(matchRound1);

    totalRounds--;

    // Other rounds
    let matchNextRound = 1;
    let round = 2;
    while (totalRounds >= 1) {
      const matchesInRound =
        totalMatches === 7 ? 4 : totalMatches === 3 ? 2 : 1;

      const match = {
        teams: [] as any[],
        round: this.getRoundName(totalRoundsTournament, round),
      };

      for (let index = 0; index < matchesInRound; index++) {
        matchNumber++;

        homeTeam = {} as any;
        homeTeam.name = `Ganhador da partida ${matchNextRound}`;
        homeTeam.corresponding = matchNextRound;
        matchNextRound++;

        awayTeam = {} as any;
        awayTeam.name = `Ganhador da partida ${matchNextRound}`;
        awayTeam.corresponding = matchNextRound;

        match.teams.push({ homeTeam, awayTeam, matchNumber });

        totalMatches--;
        matchNextRound++;
      }

      matches.push(match);

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

  private getBestTeamsByGroup(
    tournament: Tournament,
    standing: any,
    group: string,
    numberOfTeams: number,
  ) {
    const teams = [];
    const teamsStanding = standing
      .filter((s: any) => s.group === group)
      .sort((a: any, b: any) => {
        return b.points - a.points || b.pointsFavor - a.pointsFavor;
      })
      .slice(0, numberOfTeams);

    for (let i = 0; i < teamsStanding.length; i++) {
      const teamStanding = teamsStanding[i];

      const team = tournament.teams.find(t => t.teamId === teamStanding.id);

      if (team) {
        teams.push(team);
      }
    }

    return teams;
  }

  private getRoundName(totalRounds: number, round: number): string {
    if (round === 4) {
      return 'final';
    }

    if (round === 3) {
      if (totalRounds === 3) return 'final';
      if (totalRounds === 4) return 'semi';
    }

    if (round === 2) {
      if (totalRounds === 2) return 'final';
      if (totalRounds === 3) return 'semi';
      if (totalRounds === 4) return 'quarter';
    }

    if (round === 1) {
      if (totalRounds === 1) return 'final';
      if (totalRounds === 2) return 'semi';
      if (totalRounds === 3) return 'quarter';
      if (totalRounds === 4) return 'roundOf16';
    }

    return '';
  }

  private checkIfNeedsChangePhase(tournament: Tournament) {
    if (
      tournament.currentPhase === 'group' &&
      !tournament.parameters.correspondentRounds.some(
        cr => cr.phase === 'group' && !cr.played,
      )
    ) {
      return { phase: 'quarter', round: 1 };
    }

    if (
      tournament.currentPhase === 'quarter' &&
      !tournament.parameters.correspondentRounds.some(
        cr => cr.phase === 'quarter' && !cr.played,
      )
    ) {
      return { phase: 'semi', round: 1 };
    }

    if (
      tournament.currentPhase === 'semi' &&
      !tournament.parameters.correspondentRounds.some(
        cr => cr.phase === 'semi' && !cr.played,
      )
    ) {
      return { phase: 'final', round: 1 };
    }

    return {
      phase: tournament.currentPhase,
      round: tournament.currentRound + 1,
    };
  }

  // #endregion
}

export default new ServiceTournament();
