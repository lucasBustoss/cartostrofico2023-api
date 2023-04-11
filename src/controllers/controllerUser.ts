import { UserAuthenticated } from '@/models/User';
import serviceUser from '@/services/serviceUser';

class ControllerUser {
  async create(req: any): Promise<void> {
    const { email, password } = req.body;

    const user = await serviceUser.load(email);

    if (user) {
      throw new Error('E-mail já existente!');
    }

    await serviceUser.create(email, password);
  }

  async login(req: any): Promise<UserAuthenticated> {
    const { email, password } = req.body;

    const user = await serviceUser.login(email, password);

    return user;
  }

  async validate(req: any): Promise<boolean> {
    const { token } = req.body;

    const validation = await serviceUser.validate(token);

    return validation;
  }
}

export default new ControllerUser();
