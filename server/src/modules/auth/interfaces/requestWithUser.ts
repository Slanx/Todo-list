import { Request } from 'express';
import { UserData } from './userData';

export interface RequestWithUser extends Request {
  user: UserData;
}
