import { Award, Draw, Parameters, Tournament } from '@/models/Tournament';
import serviceTournament from '@/services/serviceTournament';

class ControllerLeague {
  async load(req: any): Promise<Tournament[]> {
    const { ownerId, id, name, type } = req.query;
    return serviceTournament.load({ ownerId, id, name, type });
  }

  async create(req: any): Promise<Tournament> {
    const { name, participants, type, awards, parameters } = req.body;
    const { id } = req.user;

    // #region Validations

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
        'Já existe um torneio criado com esse nome e esse tipo. Verifique e tente novamente.',
      );
    }

    if (
      type === 'mata' &&
      participants !== 2 &&
      participants !== 4 &&
      participants !== 8 &&
      participants !== 16
    ) {
      throw new Error(
        'Só é possível criar um torneio de mata-mata com 2, 4, 8 ou 16 participantes. Verifique e tente novamente.',
      );
    }

    if (type === 'mesclado') {
      if (participants !== 16) {
        throw new Error(
          'Só é possível criar um torneio de grupos + playoffs com 16 participantes. Verifique e tente novamente.',
        );
      }

      if (
        !parameters.correspondentRounds ||
        parameters.correspondentRounds.length === 0 ||
        parameters.correspondentRounds.some(
          (cr: any) => cr.correspondent === null,
        )
      ) {
        throw new Error(
          'Por favor, preencha as rodadas correspondentes corretamente.',
        );
      }

      const correspondent = [] as number[];
      for (let i = 0; i < parameters.correspondentRounds.length; i++) {
        const cr = parameters.correspondentRounds[i];

        if (correspondent.includes(cr.correspondent)) {
          const phase =
            cr.phase === 'group'
              ? 'de grupos'
              : cr.phase === 'quarter'
              ? 'quartas de final'
              : cr.phase === 'semi'
              ? 'semi-final'
              : 'final';
          throw new Error(
            `Não é possível informar rodadas correspondentes duplicadas. Verifique a rodada ${cr.round} da fase ${phase}.`,
          );
        } else {
          correspondent.push(cr.correspondent);
        }
      }
    }
    // #endregion

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

    if (tournament.participants === tournament.teams.length) {
      throw new Error(
        `Já existem ${tournament.participants} participantes no torneio. Verifique e tente novamente.`,
      );
    }

    if (
      tournament &&
      tournament.teams.find(t => t.teamId === cartolaTeam.teamId)
    ) {
      throw new Error('Time já adicionado no torneio!');
    }

    await serviceTournament.addTeam(name, tournamentId);

    return 'Time adicionado com sucesso!';
  }

  async update(req: any): Promise<string> {
    const {
      id,
      name,
      participants,
      type,
      currentRound,
      finished,
      awards,
      parameters,
    } = req.body;
    const userId = req.user.id;

    if (!id) {
      throw new Error('É necessário informar o id do torneio.');
    }

    const tournament = await serviceTournament.loadOne({
      id,
    });

    if (!tournament) {
      throw new Error(
        'O torneio informado não existe. Verifique e tente novamente',
      );
    }

    if (
      tournament.drawDate &&
      (this.checkAwardIsDifferent(awards, tournament.awards) ||
        participants !== tournament.participants ||
        type !== tournament.type ||
        this.checkParametersIsDifferent(parameters, tournament.parameters))
    ) {
      throw new Error(
        'Só é possível alterar premiação, quantidade de participantes, tipo do torneio e parâmetros caso o torneio não tenha sido sorteado ainda. Verifique e tente novamente.',
      );
    }

    await serviceTournament.update(
      id,
      userId,
      name,
      participants,
      type,
      currentRound,
      finished,
      awards,
      parameters,
    );

    return 'Torneio atualizado com sucesso!';
  }

  async drawTournament(req: any): Promise<Draw> {
    const { id } = req.body;

    if (!id) {
      throw new Error('É necessário informar o id do torneio.');
    }

    const tournament = await serviceTournament.loadOne({
      id,
    });

    if (!tournament) {
      throw new Error(
        'O torneio informado não existe. Verifique e tente novamente',
      );
    }

    if (tournament.participants > tournament.teams.length) {
      throw new Error(
        `Não é possível sortear o torneio com menos participantes que o informado nos parâmetros. Atualmente o torneio tem ${tournament.teams.length} participantes e são necessários ${tournament.participants}. Verifique e tente novamente`,
      );
    }

    // await serviceTournament.drawTournament(id);
    return serviceTournament.drawTournament(id);
  }

  async startTournament(req: any): Promise<string> {
    const { id } = req.body;

    if (!id) {
      throw new Error('É necessário informar o id do torneio.');
    }

    const tournament = await serviceTournament.loadOne({
      id,
    });

    if (!tournament) {
      throw new Error(
        'O torneio informado não existe. Verifique e tente novamente',
      );
    }

    if (!tournament.drawDate) {
      throw new Error(
        'Não é possivel iniciar um torneio sem sorteio. Verifique e tente novamente',
      );
    }

    await serviceTournament.startTournament(id);

    return 'Torneio iniciado com sucesso!';
  }

  async updatePoints(req: any): Promise<string> {
    const { id } = req.body;

    if (!id) {
      throw new Error('É necessário informar o id do torneio.');
    }

    const tournament = await serviceTournament.loadOne({
      id,
    });

    if (!tournament) {
      throw new Error(
        'O torneio informado não existe. Verifique e tente novamente',
      );
    }

    if (!tournament.drawDate) {
      throw new Error(
        'Não é possivel atualizar os pontos de um torneio sem sorteio. Verifique e tente novamente',
      );
    }

    if (!tournament.startDate) {
      throw new Error(
        'Não é possivel atualizar os pontos de um torneio não iniciado. Verifique e tente novamente',
      );
    }

    if (tournament.finished) {
      throw new Error(
        'Não é possível atualizar os pontos de um campeonato já finalizado.',
      );
    }

    await serviceTournament.updatePoints(id);

    return 'Pontos atualizados!';
  }

  async delete(req: any): Promise<string> {
    const { id } = req.params;

    if (!id) {
      throw new Error('É necessário informar o id do torneio.');
    }

    const tournament = await serviceTournament.loadOne({
      id,
    });

    if (!tournament) {
      throw new Error(
        'O torneio informado não existe. Verifique e tente novamente',
      );
    }

    if (tournament.startDate) {
      throw new Error(
        'Não é possível excluir um torneio já iniciado. Verifique e tente novamente',
      );
    }

    await serviceTournament.delete(id);

    return 'Torneio excluído com sucesso!';
  }

  private checkAwardIsDifferent(
    awards: Award[],
    tournamentAwards: Award[],
  ): boolean {
    let awardsIsDifferent = false;

    if (tournamentAwards.length !== awards.length) {
      awardsIsDifferent = true;
    } else {
      for (let i = 0; i < awards.length; i++) {
        const award = awards[i];

        if (award.award !== tournamentAwards[i].award) {
          awardsIsDifferent = true;
          break;
        }
      }
    }

    return awardsIsDifferent;
  }

  private checkParametersIsDifferent(
    parameters: Parameters,
    tournamentParameters: Parameters,
  ): boolean {
    if (parameters.drawOffset !== tournamentParameters.drawOffset) {
      return true;
    }

    if (
      parameters.relegationQuantity !== tournamentParameters.relegationQuantity
    ) {
      return true;
    }

    if (
      parameters.classificationQuantity !==
      tournamentParameters.classificationQuantity
    ) {
      return true;
    }

    if (parameters.playoffType !== tournamentParameters.playoffType) {
      return true;
    }

    if (parameters.pointsPerWin !== tournamentParameters.pointsPerWin) {
      return true;
    }

    if (parameters.pointsPerDraw !== tournamentParameters.pointsPerDraw) {
      return true;
    }

    return false;
  }
}

export default new ControllerLeague();
