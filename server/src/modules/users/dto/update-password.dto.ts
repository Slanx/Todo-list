import { MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @MinLength(5)
  oldPassword: string;

  @MinLength(5)
  newPassword: string;
}
