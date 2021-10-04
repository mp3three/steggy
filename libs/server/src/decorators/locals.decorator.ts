import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { APIResponse, ResponseLocals } from '../contracts';

export const Locals = createParamDecorator(
  <LOCALS extends ResponseLocals = ResponseLocals>(
    data: LOCALS,
    context: ExecutionContext,
  ): LOCALS => {
    const response = context.switchToHttp().getResponse<APIResponse>();
    return data ?? (response.locals as LOCALS);
  },
);
