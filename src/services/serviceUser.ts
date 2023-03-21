import repositoryUser from '@/infra/mongodb/repos/repositoryUser';
import { User, UserAuthenticated } from '@/models/User';
import authConfig from '@/config/auth';

import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';

class ServiceUser {
  async create(email: string, password: string): Promise<void> {
    const hashedPassword = await hash(password, 8);

    await repositoryUser.save({
      email,
      password: hashedPassword,
    });
  }

  async login(email: string, password: string): Promise<UserAuthenticated> {
    const user = await this.load(email);

    if (!user) {
      throw new Error('Usuário e/ou senha incorretos.');
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      throw new Error('Usuário e/ou senha incorretos.');
    }
    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({}, secret, {
      subject: user.id,
      expiresIn,
    });

    const userAuthenticated = {
      id: user.id,
      email,
      password,
      token,
    };

    return userAuthenticated;
  }

  async load(email?: string): Promise<User> {
    const user = await repositoryUser.loadOne(email);

    return user;
  }
}

export default new ServiceUser();
