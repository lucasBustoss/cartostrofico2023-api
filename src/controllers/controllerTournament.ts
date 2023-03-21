import { Tournament } from '@/models/Tournament';
import serviceTournament from '@/services/serviceTournament';

class ControllerLeague {
  async load(req: any): Promise<Tournament[]> {
    const { ownerId, id, name, type } = req.query;
    return serviceTournament.load({ ownerId, id, name, type });
  }

  async create(req: any): Promise<Tournament> {
    const { name, participants, type, awards, parameters } = req.body;
    const { id } = req.user;

    if (!id) {
      throw new Error('Usuário inválido');
    }

    const tournament = await serviceTournament.loadOne({
      ownerId: id,
      name,
      type,
    });

    if (tournament) {
      throw new Error(
        'Já existe um campeonato criado com esse nome e esse tipo. Verifique e tente novamente.',
      );
    }

    return serviceTournament.create(
      name,
      participants,
      type,
      awards,
      parameters,
      id,
    );
  }

  async addTeam(req: any): Promise<string> {
    const { tournamentId, name } = req.body;

    const cartolaTeam = await serviceTournament.getTeamOnCartola(name);

    if (!cartolaTeam) {
      throw new Error('Time não existe no Cartola!');
    }

    const tournament = await serviceTournament.loadOne({ id: tournamentId });

    if (
      tournament &&
      tournament.teams.find(t => t.teamId === cartolaTeam.teamId)
    ) {
      throw new Error('Time já adicionado no torneio!');
    }

    await serviceTournament.addTeam(name, tournamentId);

    return 'Time adicionado com sucesso!';
  }
}

export default new ControllerLeague();
