import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { MetaDataRole } from './meta-data-role.decorator';
import { AuthRolesGuard } from '../guards/auth-roles.guard';
import type { ValidRoles } from '@common/interfaces/role.interfaces';

export function AuthMiddleware(...roles: ValidRoles[]) {
  return applyDecorators(
    MetaDataRole(...roles),
    UseGuards(AuthGuard(), AuthRolesGuard),
  );
}
