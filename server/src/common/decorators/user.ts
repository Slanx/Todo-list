import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from 'src/modules/auth/interfaces/requestWithUser';
import { UserData } from 'src/modules/auth/interfaces/userData';

export const UserParams = createParamDecorator(
  (data: keyof UserData, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return data ? request.user?.[data] : request.user;
  },
);
