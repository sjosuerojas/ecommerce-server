import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { User } from '../../users/entities/user.entity';
import { IJwtStrategy } from '../interfaces/auth.interfaces';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    public configService: ConfigService,
    private usersService: UsersService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in configuration');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: IJwtStrategy): Promise<User> {
    const user = await this.usersService.findOneByIdOrEmail(payload.id);

    if (!user)
      throw new UnauthorizedException(
        `Error token for userId: ${payload.id} is invalid`,
      );

    if (!user.active)
      throw new UnauthorizedException(
        `Error for account user: ${user.email} has been blocked`,
      );

    return user;
  }
}
