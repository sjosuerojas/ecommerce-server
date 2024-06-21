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
    super({
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: IJwtStrategy): Promise<User> {
    const user = await this.usersService.findOneByIdOrEmail(payload.id);
    if (!user)
      throw new UnauthorizedException(
        `Error token for userId: ${user.id} is invalid`,
      );

    if (!user.active)
      throw new UnauthorizedException(
        `Error for account user: ${user.email} has been blocked`,
      );

    return user;
  }
}
