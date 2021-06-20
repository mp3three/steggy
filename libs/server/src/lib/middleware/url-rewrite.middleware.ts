import { PROJECT_KEYS } from '@automagical/config';
import { FormCRUD, ProjectCRUD } from '@automagical/contracts';
import { RESERVED_WORDS } from '@automagical/contracts/constants';
import type { APIRequest, APIResponse } from '@automagical/contracts/server';
import { BadRequestException, INestApplication, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction } from 'express';

/**
 * NOT INJECTABLE
 *
 * This class should be bound as GLOBAL MIDDLEWARE. Same way as helmet and other similar middleware
 *
 * It's just vaguely shaped like a normal injectable class because reasons
 */
export class UrlRewriteMiddleware {
  // #region Public Static Methods

  public static async middleware(
    app: INestApplication,
  ): Promise<(...arguments_) => void> {
    const middleware = new UrlRewriteMiddleware(
      app.get(ProjectCRUD),
      app.get(FormCRUD),
      app.get(ConfigService),
    );
    return function (
      request: APIRequest,
      response: APIResponse,
      next: NextFunction,
    ): void {
      middleware.use(request, response, next);
    };
  }

  // #endregion Public Static Methods

  // #region Constructors

  constructor(
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
    const [subdomain] = request.hostname.split('.');
    const [path] = request.url.split('?');
    const urlParts = path.split('/');
    urlParts.shift();
    let id = await this.resolveProject(subdomain, urlParts, request, response);
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
    locals.form = await this.formService.findByName(formName, locals.project);
    return locals.form._id;
  }

  private async getProjectId(subdomain: string, { locals }: APIResponse) {
    locals.project = await this.projectService.findByName(subdomain);
    if (locals.project) {
      locals.projectApiKey = this.configService.get(
        `${PROJECT_KEYS}.${locals.project._id}`,
      );
    }
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
    response: APIResponse,
  ): Promise<string> {
    const urlPiece: string = urlParts.shift();
    let subdomainId;
    if (!RESERVED_WORDS.has(subdomain)) {
      subdomainId = await this.getProjectId(subdomain, response);
      if (urlPiece === 'project' && subdomainId !== urlParts.shift()) {
        // project name via subdomain, project id via path
        // these don't resolve to the same id
        throw new BadRequestException('Unclear project identifier');
      }
      request.params.projectId = subdomainId;
      return `project/${subdomainId}`;
    }
    if (RESERVED_WORDS.has(urlPiece)) {
      return urlPiece;
    }
    if (urlPiece === 'project') {
      return `project/${urlParts.shift() || ''}`;
    }
    subdomainId = await this.getProjectId(urlPiece, response);
    request.params.projectId = subdomainId;
    return `project/${subdomainId}`;
  }

  // #endregion Private Methods
}
