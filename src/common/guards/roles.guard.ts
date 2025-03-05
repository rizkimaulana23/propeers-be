// src/auth/guards/roles.guard.ts
import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
  } from '@nestjs/common';
import { Role } from '../entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Reflector } from '@nestjs/core';
  
  @Injectable()
  export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
  
    canActivate(context: ExecutionContext): boolean {
      // 1. Get the roles required by the handler
      const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );
      if (!requiredRoles || requiredRoles.length === 0) {
        // If no roles specified, no special authorization needed
        return true;
      }
  
      // 2. Get the user from request
      const { user } = context.switchToHttp().getRequest();
  
      // user.roles might be an array of roles, e.g. ["USER", "ADMIN"]
      console.log("User Roles")
      console.log(user.roles);
      const hasRole = requiredRoles.some(role => user.roles?.includes(role));
  
      if (!hasRole) {
        throw new ForbiddenException('Forbidden resource');
      }
  
      return true;
    }
  }  