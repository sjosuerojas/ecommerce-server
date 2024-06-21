import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';

export type SignInOptions = Pick<CreateUserDto, 'email' | 'password'>;
