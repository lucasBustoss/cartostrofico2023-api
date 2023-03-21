import { User } from '@/models/User';
import { UserSchema } from '@/infra/mongodb/schemas/schemaUser';

class RepositoryUser {
  async save(user: User): Promise<void> {
    await UserSchema.create(user);
  }

  async load(email?: string): Promise<User[]> {
    return UserSchema.find({ email });
  }

  async loadOne(email?: string): Promise<User> {
    return UserSchema.findOne({ email });
  }
}

export default new RepositoryUser();
