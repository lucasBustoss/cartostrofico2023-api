import mongoose from 'mongoose';
import './config/module-alias';
import * as dotenv from 'dotenv';

const path = '.env';
dotenv.config({ path });

mongoose
  .connect(process.env.MONGO_URL)
  .then(async () => {
    const app = (await import('./config/app')).default;
    app.listen(process.env.APP_PORT, () =>
      console.log(`Server started at http://localhost:${process.env.APP_PORT}`),
    );
  })
  .catch(console.error);
