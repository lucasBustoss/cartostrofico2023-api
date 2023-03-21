import mongoose from 'mongoose';
import './config/module-alias';
import { env } from '@/config/env';

mongoose
  .connect(env.mongoUrl)
  .then(async () => {
    const app = (await import('./config/app')).default;
    app.listen(env.appPort, () =>
      console.log(`Server running at http://localhost:${env.appPort}`),
    );
  })
  .catch(console.error);
