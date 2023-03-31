import { MinLength } from 'class-validator';

export class PasswordDto {
  @MinLength(5)
  password: string;
}
