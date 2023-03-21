import { Express } from 'express';
import routes from '@/routes';

export const setupRoutes = (app: Express): void => {
  app.use('/api', routes);
};
