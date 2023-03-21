import apiCartola from '@/infra/api/apiCartola';
import repositoryTournament from '@/infra/mongodb/repos/repositoryTournament';
import {
  Award,
  LoadTournamentParameters,
  Parameters,
  Tournament,
} from '@/models/Tournament';

class ServiceTournament {
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
    return repositoryTournament.save({
      name,
      participants,
      type,
      awards,
      parameters,
      ownerId,
    });
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
}

export default new ServiceTournament();
