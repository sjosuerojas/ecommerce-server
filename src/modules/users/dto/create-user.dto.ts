import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @MaxLength(50)
  @Matches(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/, {
    message: 'email must be in lowercase and a valid email address',
  })
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(60)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password must have an uppercase, lowercase letter and a number',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(35)
  @MaxLength(50)
  @Matches(/^[a-zA-Z\s]+$/g, {
    message: 'firstName must contain only letters',
  })
  firstName: string;

  @IsString()
  @IsOptional()
  @MaxLength(35)
  @MaxLength(50)
  @Matches(/^[a-zA-Z\s]+$/g, {
    message: 'lastName must contain only letters',
  })
  lastName?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message:
      'phone number must be a valid international phone number starting with +',
  })
  phone?: string;
}
