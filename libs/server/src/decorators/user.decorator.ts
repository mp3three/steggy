import { UserDTO } from '@automagical/contracts/formio-sdk';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: UserDTO, context: ExecutionContext): UserDTO => {
    const { locals } = context.switchToHttp().getResponse();
    return data ?? locals.user;
  },
);
