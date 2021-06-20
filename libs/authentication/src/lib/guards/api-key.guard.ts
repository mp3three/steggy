import { ResponseFlags } from '@automagical/contracts';
import {
  API_KEY_HEADER,
  LIB_AUTHENTICATION,
} from '@automagical/contracts/constants';
import { UserDTO } from '@automagical/contracts/formio-sdk';
import { APIResponse } from '@automagical/contracts/server';
import { InjectLogger, Trace } from '@automagical/utilities';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  // #region Constructors

  constructor(
    @InjectLogger(ApiKeyGuard, LIB_AUTHENTICATION)
    private readonly logger: PinoLogger,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const locals = context.switchToHttp().getResponse<APIResponse>().locals;

    const token: string =
      locals.headers.get(API_KEY_HEADER) || locals.query.get(API_KEY_HEADER);
    if (!token) {
      // Maybe another strategy will resolve
      return true;
    }
    if (!locals.project) {
      this.logger.fatal('No project to compare api key against');
      throw new InternalServerErrorException();
    }
    if (locals.project.settings) {
      const validKey = locals.project.settings.keys?.some(
        (key) => key.key === token,
      );
      if (!validKey) {
        throw new UnauthorizedException();
      }
    }
    locals.flags.add(ResponseFlags.API_KEY);
    locals.flags.add(ResponseFlags.ADMIN);
    locals.authenticated = true;
    locals.user = {
      _id: locals.project.owner,
    } as UserDTO;
    return true;
  }

  // #endregion Public Methods
}
