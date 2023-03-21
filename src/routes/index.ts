import { Router } from 'express';
import tournamentRouter from './tournaments.routes';
import userRouter from './users.routes';

const routes = Router();

routes.use('/torneios', tournamentRouter);
routes.use('/usuarios', userRouter);

export default routes;
