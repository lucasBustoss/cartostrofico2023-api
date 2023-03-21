import controllerTournament from '@/controllers/controllerTournament';
import ensureAuthenticated from '@/middlewares/ensureAuthenticated';

import { Router } from 'express';

const tournamentRouter = Router();

tournamentRouter.use(ensureAuthenticated);

tournamentRouter.get('/', async (req, res) => {
  try {
    const status = await controllerTournament.load(req);

    return res.status(200).json({ message: status });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message });
  }
});

export default tournamentRouter;
