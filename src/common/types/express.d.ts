import { Role } from "../entities/user.entity";

declare namespace Express {
    export interface Request {
      user?: {
        id: string;
        email: string;
        roles: Role;
      };
    }
  }