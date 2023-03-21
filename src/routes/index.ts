import { Router } from 'express';
import tournamentRouter from './tournaments.routes';

const routes = Router();

routes.use('/torneios', tournamentRouter);

export default routes;
