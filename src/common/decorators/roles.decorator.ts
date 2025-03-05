import { SetMetadata } from '@nestjs/common';
import { Role } from '../entities/user.entity';

export const ROLES_KEY = 'roles';
export const RolesDecorator = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);