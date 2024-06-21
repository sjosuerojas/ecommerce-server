import { User } from '../../users/entities/user.entity';

export type AuthResponse = {
  user: User;
} & IJwtResponse;

export interface IJwtStrategy {
  id: string;
}

export interface IJwtResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
}
