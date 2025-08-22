import 'express';

declare global {
  namespace Express {
    export interface User {
      id: string;
      username: string;
      role: 'User' | 'Admin';
    }
  }
}
