import { User } from '@/models/User';

import mongoose from 'mongoose';
import { v4 as uuid } from 'uuid';

const UserSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      default: uuid(),
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    updatedAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      required: true,
      default: () => Date.now(),
    },
  },
  {
    timestamps: true,
  },
);

const schema = mongoose.model<User>('Users', UserSchema);

export { schema as UserSchema };
