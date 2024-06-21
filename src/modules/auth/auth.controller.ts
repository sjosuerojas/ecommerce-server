import { Controller, Post, Body, Get, Req } from '@nestjs/common';

import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { SignInOptions } from './dto/auth.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthMiddleware } from './decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Post('sign-in')
  loginUser(@Body() signInOptions: SignInOptions) {
    return this.authService.signIn(signInOptions);
  }

  @Get('profile')
  @AuthMiddleware('admin')
  profileUser(@Req() request: Express.Request) {
    const user = request.user as User;
    return this.authService.profile(user.id);
  }
}
