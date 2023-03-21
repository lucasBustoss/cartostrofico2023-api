export class User {
  id?: string;

  email: string;

  password: string;
}

export class UserAuthenticated {
  id: string;

  email: string;

  password: string;

  token: string;
}
