import {
  CrudOptions,
  FormCRUD,
  ProjectCRUD,
  SubmissionCRUD,
  TeamAdapter,
} from '@formio/contracts';
import {
  CREATE_MEMBER_EVENT,
  LIB_FORMIO_SDK,
  TRUNCATE_TEAM_EVENT,
} from '@formio/contracts/constants';
import { ResultControlDTO } from '@formio/contracts/fetch';
import {
  FormDTO,
  PERMISSION_ACCESS_TYPES,
  PORTAL_RESOURCES,
  ProjectDTO,
  TeamDTO,
  UserDTO,
} from '@formio/contracts/formio-sdk';
import {
  TeamProjectListDTO,
  TeamProjectPermissionDTO,
} from '@formio/contracts/server';
import { InjectLogger, Trace } from '@formio/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { each, eachLimit } from 'async';
import { PinoLogger } from 'nestjs-pino';

import { FormioSdkService } from './formio-sdk.service';
import { UserService } from './user.service';

@Injectable()
export class TeamService {
  // #region Object Properties

  private form: FormDTO;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(TeamService, LIB_FORMIO_SDK)
    private readonly logger: PinoLogger,
    @Inject(SubmissionCRUD) private readonly submissionCrud: SubmissionCRUD,
    private readonly configService: ConfigService,
    @Inject(ProjectCRUD) private readonly projectCrud: ProjectCRUD,
    @Inject(FormCRUD) private readonly formCrud: FormCRUD,
    private readonly formioSDK: FormioSdkService,
    @Inject(TeamAdapter) private readonly teamService: TeamAdapter,
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async create(
    team: TeamDTO,
    user: UserDTO,
    options: CrudOptions,
  ): Promise<TeamDTO> {
    const out = await this.submissionCrud.create(team, options);
    this.eventEmitter.emit(
      CREATE_MEMBER_EVENT,
      {
        admin: true,
        email: user.data.email,
        team,
      },
      true,
    );
    return out;
  }

  @Trace()
  public async delete(team: TeamDTO, options: CrudOptions): Promise<boolean> {
    process.nextTick(async () => {
      // Clean up members / user permissions in background
      this.eventEmitter.emit(TRUNCATE_TEAM_EVENT, team);

      // Clean up projects
      const projects = await this.teamService.getTeamProjects(team, options);
      await eachLimit(projects, 5, async (project) => {
        project.access = project.access.map((access) => {
          access.roles = access.roles.filter((item) => item !== team._id);
          return access;
        });
        await this.projectCrud.update(project, { project });
      });
    });

    return await this.submissionCrud.delete(team, options);
  }

  @Trace()
  public async findById(
    submission: string,
    options: CrudOptions,
  ): Promise<TeamDTO> {
    return await this.submissionCrud.findById(submission, options);
  }

  @Trace()
  public async findManyTeams(
    query: ResultControlDTO,
    options: CrudOptions,
  ): Promise<TeamDTO[]> {
    return await this.submissionCrud.findMany(query, options);
  }

  @Trace()
  public getTeamPermission(
    team: string,
    project: ProjectDTO,
  ): PERMISSION_ACCESS_TYPES {
    return [
      PERMISSION_ACCESS_TYPES.team_admin,
      PERMISSION_ACCESS_TYPES.team_write,
      PERMISSION_ACCESS_TYPES.team_read,
      PERMISSION_ACCESS_TYPES.team_access,
    ].find((permission) => this.hasPermission(team, project, permission));
  }

  /**
   * TODO: refactor me / get rid of excess loops
   */
  @Trace()
  public async projectTeams(
    project: ProjectDTO,
    options: CrudOptions,
  ): Promise<Map<string, TeamProjectPermissionDTO>> {
    const teams = new Map<string, TeamProjectPermissionDTO>();
    project.access ??= [];
    project.access.forEach((access) => {
      if (access.type.slice(0, 4) !== 'team') {
        return;
      }
      access.roles.map((item) => {
        if (teams.has(item)) {
          return;
        }
        const project = undefined;
        teams.set(item, project);
      });
    });
    await each(teams.keys(), async (teamId: string) => {
      const team = await this.findById(teamId, options);
      teams.set(teamId, {
        ...team,
        permission: this.getTeamPermission(teamId, project),
      });
    });
    return teams;
  }

  @Trace()
  public async teamProjects(
    team: string,
    options: CrudOptions,
  ): Promise<TeamProjectListDTO[]> {
    const projects = await this.teamService.getTeamProjects(team, options);

    return projects.map((project) => {
      return {
        _id: project._id,
        name: project.name,
        owner: project.title,
        permission: this.getTeamPermission(team, project),
        title: project.title,
      };
    });
  }

  @Trace()
  public async update(update: TeamDTO, options: CrudOptions): Promise<TeamDTO> {
    return await this.submissionCrud.update(update, options);
  }

  // #endregion Public Methods

  // #region Private Methods

  @Trace()
  private async onModuleInit() {
    this.form = await this.formCrud.findByName(PORTAL_RESOURCES.team, {
      project: this.formioSDK.BASE_PROJECT,
    });
    if (typeof this.form === 'string') {
      this.logger.warn(`Failed to load team data`);
      return;
    }
    this.submissionCrud.attach(this.formioSDK.BASE_PROJECT, this.form);
  }

  private hasPermission(
    team: string,
    project: ProjectDTO,
    type: PERMISSION_ACCESS_TYPES,
  ): boolean {
    return project.access.some(
      (access) => access.type === type && access.roles.includes(team),
    );
  }

  // #endregion Private Methods
}
