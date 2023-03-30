import { genSaltSync, hash } from 'bcrypt';

export const hashPassword = (rounds: number, password: string) => {
  const salt = genSaltSync(rounds);
  return hash(password, salt);
};
