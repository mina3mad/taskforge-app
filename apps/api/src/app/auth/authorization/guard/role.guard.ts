import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/app/users/enum/user-role.enum';
import { ROLES_KEY } from '../decorator/roles.decorator';


@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,[
      context.getHandler(),
      context.getClass()]);
    if (!requiredRoles) {
      return true;
    }
    const request=context.switchToHttp().getRequest();
    const user=request.user;

     if (!user || !user.userRole)
      throw new UnauthorizedException("Invalid token");

    const hasRole = requiredRoles.some((role) => user.userRole === role);
    if (!hasRole) {
      throw new UnauthorizedException('Forbidden: insufficient role');
    }
    return true;
  }
}
