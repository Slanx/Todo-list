import { Transform } from 'class-transformer';
import { MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @Transform(({ value }) => value.toLowerCase())
  @MinLength(3)
  @MaxLength(30)
  login: string;

  @MinLength(5)
  password: string;
}
