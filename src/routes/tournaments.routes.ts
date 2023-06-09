import controllerTournament from '@/controllers/controllerTournament';
import ensureAuthenticated from '@/middlewares/ensureAuthenticated';

import { Router } from 'express';

const tournamentRouter = Router();

tournamentRouter.use(ensureAuthenticated);

tournamentRouter.get('/', async (req, res) => {
  try {
    const tournaments = await controllerTournament.load(req);

    return res.status(200).json(tournaments);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message });
  }
});

tournamentRouter.get('/cartola', async (req, res) => {
  try {
    const teams = await controllerTournament.searchCartolaTeam(req);

    return res.status(200).json(teams);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message });
  }
});

tournamentRouter.post('/', async (req, res) => {
  try {
    const tournament = await controllerTournament.create(req);

    return res.status(200).json(tournament);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message });
  }
});

tournamentRouter.post('/adicionarTime', async (req, res) => {
  try {
    const response = await controllerTournament.addTeam(req);

    return res.status(200).json({ message: response });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message });
  }
});

tournamentRouter.post('/adicionarJogos', async (req, res) => {
  try {
    const response = await controllerTournament.addMatches(req);

    return res.status(200).json({ message: response });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message });
  }
});

tournamentRouter.post('/excluirTime', async (req, res) => {
  try {
    const response = await controllerTournament.deleteTeam(req);

    return res.status(200).json({ message: response });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message });
  }
});

tournamentRouter.post('/sortear', async (req, res) => {
  try {
    const response = await controllerTournament.drawTournament(req);

    return res.status(200).json(response);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message });
  }
});

tournamentRouter.post('/iniciar', async (req, res) => {
  try {
    const response = await controllerTournament.startTournament(req);

    return res.status(200).json({ message: response });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message });
  }
});

tournamentRouter.post('/atualizar', async (req, res) => {
  try {
    const response = await controllerTournament.updatePoints(req);

    return res.status(200).json({ message: response });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message });
  }
});

tournamentRouter.put('/', async (req, res) => {
  try {
    const response = await controllerTournament.update(req);

    return res.status(200).json({ message: response });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message });
  }
});

tournamentRouter.delete('/:id', async (req, res) => {
  try {
    const response = await controllerTournament.delete(req);

    return res.status(200).json({ message: response });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message });
  }
});

export default tournamentRouter;
