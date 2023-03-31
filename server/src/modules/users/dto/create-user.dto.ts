import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @Transform(({ value }) => value.toLowerCase())
  @MinLength(3)
  @MaxLength(30)
  login: string;

  @MinLength(5)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;
}
