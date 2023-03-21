import { setupRoutes } from '@/config/routes';
import { setupMiddlewares } from '@/config/middlewares';

import express from 'express';

const app = express();
setupMiddlewares(app);
setupRoutes(app);

export default app;
