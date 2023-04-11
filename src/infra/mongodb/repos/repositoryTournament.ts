import {
  LoadTournamentParameters,
  Team,
  Tournament,
} from '@/models/Tournament';
import { TournamentSchema } from '@/infra/mongodb/schemas/schemaTournament';

class RepositoryTournament {
  async save(tournament: Tournament): Promise<Tournament> {
    return TournamentSchema.create(tournament);
  }

  async saveTeam(team: Team, tournamentId: string): Promise<void> {
    const tournament = await this.loadOne({ id: tournamentId });

    if (tournament) {
      tournament.teams.push(team);
    }

    await TournamentSchema.findOneAndUpdate({ id: tournamentId }, tournament);
  }

  async load(parameters: LoadTournamentParameters): Promise<Tournament[]> {
    const query = this.getQueryParams(parameters);
    return TournamentSchema.find(query);
  }

  async loadOne(parameters: LoadTournamentParameters): Promise<Tournament> {
    const query = this.getQueryParams(parameters);
    return TournamentSchema.findOne(query);
  }

  async update(tournament: Tournament): Promise<void> {
    await TournamentSchema.findOneAndUpdate({ id: tournament.id }, tournament);
  }

  async delete(id: string): Promise<void> {
    await TournamentSchema.findOneAndDelete({ id });
  }

  private getQueryParams(
    parameters: LoadTournamentParameters,
  ): LoadTournamentParameters {
    const query = {} as LoadTournamentParameters;

    if (
      parameters &&
      parameters.ownerId &&
      parameters.ownerId !== process.env.ADMIN_ID
    ) {
      query.ownerId = parameters.ownerId;
    }

    if (parameters && parameters.id) {
      query.id = parameters.id;
    }

    if (parameters && parameters.name) {
      query.name = parameters.name;
    }

    if (parameters && parameters.type) {
      query.type = parameters.type;
    }

    return query;
  }
}

export default new RepositoryTournament();
