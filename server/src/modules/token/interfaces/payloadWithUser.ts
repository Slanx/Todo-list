import { JwtPayload } from 'jsonwebtoken';
import { UserData } from 'src/modules/auth/interfaces/userData';

export type PayloadWithUser = JwtPayload & UserData;
