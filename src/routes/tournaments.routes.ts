import controllerLeague from '@/controllers/controllerTournament';

import { Router } from 'express';

const tournamentRouter = Router();

tournamentRouter.get('/', async (req, res) => {
  try {
    const status = await controllerLeague.load(req);

    return res.status(200).json({ message: status });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message });
  }
});

export default tournamentRouter;
