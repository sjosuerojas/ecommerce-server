import { SetMetadata } from '@nestjs/common';
import { ROLE_KEY, ValidRoles } from '@common/interfaces/role.interfaces';

export const MetaDataRole = (...args: ValidRoles[]) => {
  return SetMetadata(ROLE_KEY, args);
};
