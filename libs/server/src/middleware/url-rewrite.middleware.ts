import { FormCRUD, ProjectCRUD } from '@formio/contracts';
import { PROJECT_KEYS } from '@formio/contracts/config';
import {
  API_KEY_HEADER,
  APIRequest,
  APIResponse,
  JWT_HEADER,
  RESERVED_WORDS,
} from '@formio/contracts/server';
import { BadRequestException, INestApplication, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cors from 'cors';
import { NextFunction } from 'express';
import { PinoLogger } from 'nestjs-pino';

/**
 * NOT INJECTABLE
 *
 * This class should be bound as GLOBAL MIDDLEWARE. Same way as helmet and other similar middleware
 *
 * It's just vaguely shaped like a normal injectable class because reasons
 */
export class UrlRewriteMiddleware {
  // #region Public Static Methods

  public static async middleware(app: INestApplication): Promise<void> {
    const configService = app.get(ConfigService);
    const middleware = new UrlRewriteMiddleware(
      await app.resolve(PinoLogger),
      app.get(ProjectCRUD),
      app.get(FormCRUD),
      configService,
    );
    app.use(
      /**
       * Rewrite the url.
       * Attach project to locals (if possible)
       */
      function (
        request: APIRequest,
        response: APIResponse,
        next: NextFunction,
      ): void {
        middleware.use(request, response, next);
      },
      /**
       * Bonus cors based off project settings.
       *
       * Pass through if no project available
       */
      cors((request: APIRequest, next): void => {
        const { project } = request.res.locals;
        if (
          !project ||
          !project?.settings?.cors ||
          project?.settings?.cors?.trim() === '*'
        ) {
          next(undefined, { origin: true });
          return;
        }
        const origin = project.settings.cors
          // Split on comma / space
          .split(new RegExp('[, ]', 'g'))
          // Trim the result
          .map((item) => item.trim());

        next(undefined, { origin });
      }),
    );
  }

  // #endregion Public Static Methods

  // #region Constructors

  constructor(
    private readonly logger: PinoLogger,
    @Inject(ProjectCRUD)
    private readonly projectService: ProjectCRUD,
    @Inject(FormCRUD)
    private readonly formService: FormCRUD,
    private readonly configService: ConfigService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public async use(
    request: APIRequest,
    response: APIResponse,
    next: NextFunction,
  ): Promise<void> {
    const portalUrl = await this.buildUrl(request, request.res);
    request.originalUrl = request.url = portalUrl;
    return next();
  }

  // #endregion Public Methods

  // #region Private Methods

  private async buildUrl(
    request: APIRequest,
    response: APIResponse,
  ): Promise<string> {
    if (request.url === '/') {
      return '/status';
    }
    const [subdomain] = request.hostname.split('.');
    const [path] = request.url.split('?');
    const urlParts = path
      .split('/')
      .filter((item, index) => item !== '' || index === 0);
    urlParts.shift();
    let id = await this.resolveProject(subdomain, urlParts, request);
    const portalUrl = [''];
    if (id) {
      portalUrl.push(id);
    }
    if (urlParts.length === 0) {
      return portalUrl.join('/');
    }
    if (RESERVED_WORDS.has(urlParts[0])) {
      portalUrl.push(urlParts.shift());
    } else {
      portalUrl.push('form');
      id = await this.resolveForm(urlParts, request, response);
      if (id) {
        portalUrl.push(id);
      }
    }
    return [...portalUrl, ...urlParts].join('/');
  }

  private async getFormId(formName: string, { locals }: APIResponse) {
    locals.form = await this.formService.findByName(formName, {
      project: locals.project,
    });
    return locals.form._id;
  }

  private async loadById(subdomain: string, request: APIRequest) {
    const { locals } = request.res;
    locals.authenticated = false;
    locals.headers ??= new Map(
      Object.entries(request.headers as Record<string, string>),
    );
    locals.project = await this.projectService.findById(subdomain, {
      auth: {
        apiKey: locals.headers.get(API_KEY_HEADER),
        jwtToken: locals.headers.get(JWT_HEADER),
      },
      control: {},
    });
    if (locals.project) {
      locals.projectApiKey = this.configService.get(
        `${PROJECT_KEYS}.${locals.project._id}`,
      );
    }
    if (!locals?.project?._id) {
      this.logger.error(`Bad subdomain: ${subdomain}`);
    }
    return locals.project._id;
  }

  private async loadByName(subdomain: string, request: APIRequest) {
    const { locals } = request.res;
    locals.authenticated = false;
    locals.headers ??= new Map(
      Object.entries(request.headers as Record<string, string>),
    );
    locals.project = await this.projectService.findByName(subdomain, {
      auth: {
        apiKey: locals.headers.get(API_KEY_HEADER),
        jwtToken: locals.headers.get(JWT_HEADER),
      },
      control: {},
    });
    if (locals.project) {
      locals.projectApiKey = this.configService.get(
        `${PROJECT_KEYS}.${locals.project._id}`,
      );
    }
    if (!locals?.project?._id) {
      this.logger.error(`Bad subdomain: ${subdomain}`);
    }
    // This line is very prone towards throwing errors
    // If something is happening wrong with the project crud, this acts like a canary
    return locals.project._id;
  }

  private async resolveForm(
    urlParts: string[],
    request: APIRequest,
    response: APIResponse,
  ) {
    const urlPiece = urlParts.shift();
    if (urlPiece === 'form') {
      return urlParts.shift();
    }
    return await this.getFormId(urlPiece, response);
  }

  /**
   * # Resolution Rules
   *
   * ## Valid subdomain resolutions for this function
   * :projectName.domain/
   * :projectName.domain/path
   * :projectName.domain/project/:projectId
   *
   * ### Edge cases
   *
   * If both projectName and projectId are defined, and they resolve to different ids, throw an error.
   *
   * ## Aliases & Subdirectories
   *
   * subdomain.domain/:projectName
   * subdomain.domain/project/:projectId
   *
   * ### Notes
   *
   * Force subdirectory resolution if subdomain is reserved
   *
   */
  private async resolveProject(
    subdomain: string,
    urlParts: string[],
    request: APIRequest,
  ): Promise<string> {
    const urlPiece: string = urlParts.shift();
    let subdomainId;
    if (!RESERVED_WORDS.has(subdomain)) {
      subdomainId = await this.loadByName(subdomain, request);
      if (urlPiece === 'project' && subdomainId !== urlParts.shift()) {
        // project name via subdomain, project id via path
        // these don't resolve to the same id
        throw new BadRequestException('Unclear project identifier');
      }
      request.params.projectId = subdomainId;
      await this.loadById(subdomainId, request);
      return `project/${subdomainId}`;
    }
    if (RESERVED_WORDS.has(urlPiece)) {
      return urlPiece;
    }
    if (urlPiece === 'project') {
      subdomainId = urlParts.shift() || '';
      if (subdomainId) {
        await this.loadById(subdomainId, request);
      }
      return `project/${subdomainId}`;
    }
    subdomainId = await this.loadByName(urlPiece, request);
    request.params.projectId = subdomainId;
    return `project/${subdomainId}`;
  }

  // #endregion Private Methods
}
