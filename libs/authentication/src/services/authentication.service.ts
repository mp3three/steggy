import { SessionCRUD } from '@automagical/contracts';
import { SessionTokenDTO } from '@automagical/contracts/authentication';
import {
  DEFAULT_JWT_SECRET,
  DEFAULT_REMOTE_SECRET,
  EXPIRES_IN,
  JWT_SECRET,
  REMOTE_SECRET,
  VERIFY_JWT,
} from '@automagical/contracts/config';
import { LIB_AUTHENTICATION } from '@automagical/contracts/constants';
import {
  FormDTO,
  PERMISSION_ACCESS_TYPES,
  ProjectDTO,
  UserDTO,
} from '@automagical/contracts/formio-sdk';
import { InjectLogger, Trace } from '@automagical/utilities';
import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class AuthenticationService {
  // #region Constructors

  constructor(
    @InjectLogger(AuthenticationService, LIB_AUTHENTICATION)
    private readonly logger: PinoLogger,
    private readonly jwtService: JwtService,
    private readonly configSerivice: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
    @Inject(SessionCRUD)
    private readonly sessionService: SessionCRUD,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async create(
    user: UserDTO,
    form: FormDTO,
    project: ProjectDTO,
  ): Promise<unknown> {
    await this.sessionService.create({
      form: form._id,
      project: project._id,
      submission: user._id,
    });
    const expiresIn = this.configSerivice.get(EXPIRES_IN);
    const accessToken = this.jwtService.sign(
      this.formatToken(user, form, project),
    );
    return {
      accessToken,
      expiresIn,
    };
  }

  @Trace()
  public async logout(token: SessionTokenDTO): Promise<void> {
    const session = await this.sessionService.findById(token.sessionId);
    if (!session) {
      this.logger.warn(`wat`);
      return;
    }
    // Insert an entry into redis to flag this session as logged out
    // If one already exists, it's fine to bump it
    // TTL is slightly longer than the original duration
    const ttl = this.configService.get<number>(EXPIRES_IN) / 900;
    await this.cacheManager.set(
      this.cacheKey(session._id),
      Date.now().toString(),
      { ttl },
    );
    if (session.logout) {
      this.logger.debug({ session }, 'Already logged out');
      return;
    }
    session.logout = new Date();
    await this.sessionService.update(session);
  }

  @Trace()
  public async verifyToken(token: string): Promise<SessionTokenDTO> {
    const verifyJWT = this.configService.get(VERIFY_JWT);
    const session = verifyJWT
      ? this.jwtService.verify<SessionTokenDTO>(token)
      : (this.jwtService.decode(token) as SessionTokenDTO);
    if (session.sessionId) {
      const logout = await this.cacheManager.get(
        this.cacheKey(session.sessionId),
      );
      if (logout) {
        throw new BadRequestException('JWT Blocked');
      }
    }
    return session;
  }

  // #endregion Public Methods

  // #region Private Methods

  @Trace()
  private onModuleInit() {
    if (this.configSerivice.get(JWT_SECRET) === DEFAULT_JWT_SECRET) {
      this.logger.error(`Default DEFAULT_JWT_SECRET in use`);
    }
    if (this.configSerivice.get(REMOTE_SECRET) === DEFAULT_REMOTE_SECRET) {
      this.logger.error(`Default DEFAULT_JWT_SECRET in use`);
    }
  }

  private cacheKey(session: string): string {
    return `session.${session}`;
  }

  private formatToken(
    user: UserDTO,
    form: FormDTO,
    project: ProjectDTO,
  ): SessionTokenDTO {
    return {
      form: {
        _id: form._id,
        name: form.name,
        owner: form.owner,
        title: form.title,
      } as FormDTO,
      permission: PERMISSION_ACCESS_TYPES.self,
      project: {
        _id: project._id,
        name: project.name,
        owner: project.owner,
        title: project.title,
      } as ProjectDTO,
      user: {
        _id: user._id,
        created: user.created,
        data: user.data,
        modified: user.modified,
      } as UserDTO,
    };
  }

  // #endregion Private Methods
}
