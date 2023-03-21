import controllerUser from '@/controllers/controllerUser';

import { Router } from 'express';

const userRouter = Router();

userRouter.post('/', async (req, res) => {
  try {
    await controllerUser.create(req);

    return res.status(200).json({ message: 'Usuário criado com sucesso' });
  } catch (err) {
    console.log(err.message);
    return res.status(400).json({ error: err.message });
  }
});

userRouter.post('/login', async (req, res) => {
  try {
    const user = await controllerUser.login(req);

    return res.status(200).json(user);
  } catch (err) {
    console.log(err.message);
    return res.status(400).json({ error: err.message });
  }
});

export default userRouter;
