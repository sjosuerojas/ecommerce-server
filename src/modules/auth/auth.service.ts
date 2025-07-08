import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import type { SignInOptions } from './dto/auth.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import type { IJwtResponse, IJwtStrategy } from './interfaces/auth.interfaces';

@Injectable()
export class AuthService {
  private readonly jwtExpiration: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwtExpiration =
      this.configService.get<string>('JWT_EXPIRATION') ?? '3600s';
  }

  /**
   * Retrieves a Json-Web-Token Type Response
   * @param payload - The JwtStrategyType which jwt strategy recives
   * @returns Oject Json-Web-Token strategy configured
   */
  jwtSign(payload: IJwtStrategy): IJwtResponse {
    return {
      accessToken: this.jwtService.sign(payload),
      tokenType: 'Bearer',
      expiresIn: this.jwtExpiration,
    };
  }

  /**
   * Creates a new user in the database.
   * @param userCredentialsDto - Data transfer object containing user creation details.
   * @returns The created user.
   */
  async signUp(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);

    return {
      ...this.jwtSign({ id: user.id }),
      user,
    };
  }

  /**
   * Creates a new session.
   * @param signInOptions - Data transfer object containing user creation details.
   * @returns The sign-in response with Authorization and User details
   */
  async signIn({ email, password }: SignInOptions) {
    const user = await this.usersService.findOneByIdOrEmail(email, true);

    if (!user || !bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException(
        `The user ${email} has incorrect credenctials. Please verify again`,
      );

    user.password = '';

    return {
      ...this.jwtSign({ id: user.id }),
      user,
    };
  }

  /**
   * Retrives the user information
   * @param id - The search id, which can be a UUID
   */
  async profile(id: string): Promise<User | null> {
    return await this.usersService.findOneByIdOrEmail(id);
  }
}
