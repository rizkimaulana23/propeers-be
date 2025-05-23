// src/common/interfaces/custom-request.interface.ts
import { Request } from 'express';
import { Role } from '../entities/user.entity';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    roles: Role;
  };
}
