import { ResponseFlags, ResponseLocals } from '@automagical/contracts';
import { SessionTokenDTO } from '@automagical/contracts/authentication';
import { REMOTE_SECRET } from '@automagical/contracts/config';
import { LIB_AUTHENTICATION } from '@automagical/contracts/constants';
import { HTTP_METHODS } from '@automagical/contracts/fetch';
import { PERMISSION_ACCESS_TYPES, UserDTO } from '@automagical/contracts/formio-sdk';
import { APIResponse, REMOTE_TOKEN_HEADER } from '@automagical/contracts/server';
import { InjectLogger, Trace } from '@automagical/utilities';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { decode } from 'jsonwebtoken';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class RemoteTokenGuard implements CanActivate {
  // #region Constructors

  constructor(
    @InjectLogger(RemoteTokenGuard, LIB_AUTHENTICATION)
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const { locals } = context.switchToHttp().getResponse<APIResponse>();

    const token: string =
      locals.headers.get(REMOTE_TOKEN_HEADER) ||
      locals.query.get(REMOTE_TOKEN_HEADER);
    if (!token) {
      // Maybe another strategy will resolve
      return true;
    }
    const secret = this.configService.get(REMOTE_SECRET);
    if (!secret) {
      this.logger.fatal(`Remote secret not defined`);
      throw new InternalServerErrorException();
    }
    locals.flags.add(ResponseFlags.REMOTE_TOKEN);
    locals.session = decode(token) as SessionTokenDTO;
    locals.remotePermission = locals.session.permission;
    locals.user = locals.session.user as UserDTO;
    locals.authenticated = this.authenticate(locals);
    return locals.authenticated;
  }

  // #endregion Public Methods

  // #region Private Methods

  private authenticate(locals: ResponseLocals) {
    switch (locals.remotePermission) {
      case PERMISSION_ACCESS_TYPES.team_admin:
      case PERMISSION_ACCESS_TYPES.owner:
        if (locals.session?.project?.owner === locals.session?.user?._id) {
          locals.flags.add(ResponseFlags.ADMIN);
        }
        return true;
      case PERMISSION_ACCESS_TYPES.team_read:
        return locals.method === HTTP_METHODS.get;
      case PERMISSION_ACCESS_TYPES.team_write:
      default:
        return true;
    }
  }

  // #endregion Private Methods
}
