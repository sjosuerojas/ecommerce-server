import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { User } from 'src/modules/users/entities/user.entity';
import { ROLE_KEY } from '@common/interfaces/role.interfaces';

@Injectable()
export class AuthRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.get(
      ROLE_KEY,
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;
    const userRoles: string[] = user.roles.map(
      (currentRole) => currentRole.name,
    );

    for (const role of userRoles) {
      if (validRoles.includes(role)) return true;
    }

    throw new ForbiddenException(
      `Error user ${user.id} credentials for the current service does not fulfil the requirements`,
    );
  }
}
