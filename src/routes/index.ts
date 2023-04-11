import { Router } from 'express';
import tournamentRouter from './tournaments.routes';
import userRouter from './users.routes';

const routes = Router();

routes.use('/torneios', tournamentRouter);
routes.use('/usuarios', userRouter);

routes.get('/', async (req, res) => {
  try {
    return res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message });
  }
});

export default routes;
