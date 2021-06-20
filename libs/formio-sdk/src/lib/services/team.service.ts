import {
  FormCRUD,
  ProjectCRUD,
  SubmissionCRUD,
  TeamAdapter,
} from '@automagical/contracts';
import {
  CREATE_MEMBER_EVENT,
  LIB_SERVER,
  PORTAL_RESOURCES,
  TRUNCATE_TEAM_EVENT,
} from '@automagical/contracts/constants';
import { ResultControlDTO } from '@automagical/contracts/fetch';
import {
  FormDTO,
  PERMISSION_ACCESS_TYPES,
  ProjectDTO,
  TeamDTO,
  UserDTO,
} from '@automagical/contracts/formio-sdk';
import {
  TeamProjectListDTO,
  TeamProjectPermissionDTO,
} from '@automagical/contracts/server';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { each, eachLimit } from 'async';
import { PinoLogger } from 'nestjs-pino';

import { FormioSdkService } from './formio-sdk.service';
import { UserService } from './user.service';

export class TeamService {
  // #region Object Properties

  private form: FormDTO;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(TeamService, LIB_SERVER) private readonly logger: PinoLogger,
    @Inject(SubmissionCRUD) private readonly submissionService: SubmissionCRUD,
    private readonly configService: ConfigService,
    @Inject(ProjectCRUD) private readonly projectService: ProjectCRUD,
    @Inject(FormCRUD) private readonly formService: FormCRUD,
    private readonly formioSDK: FormioSdkService,
    @Inject(TeamAdapter) private readonly teamService: TeamAdapter,
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async create(team: TeamDTO, user: UserDTO): Promise<TeamDTO> {
    const out = await this.submissionService.create(team);
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
  public async delete(team: TeamDTO): Promise<boolean> {
    process.nextTick(async () => {
      // Clean up members / user permissions in background
      this.eventEmitter.emit(TRUNCATE_TEAM_EVENT, team);

      // Clean up projects
      const projects = await this.teamService.getTeamProjects(team);
      await eachLimit(projects, 5, async (project) => {
        project.access = project.access.map((access) => {
          access.roles = access.roles.filter((item) => item !== team._id);
          return access;
        });
        await this.projectService.update(project, project);
      });
    });

    return await this.submissionService.delete(team);
  }

  @Trace()
  public async findById(submission: string): Promise<TeamDTO> {
    return await this.submissionService.findById(submission);
  }

  @Trace()
  public async findManyTeams(query: ResultControlDTO): Promise<TeamDTO[]> {
    return await this.submissionService.findMany(query);
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
      const team = await this.findById(teamId);
      teams.set(teamId, {
        ...team,
        permission: this.getTeamPermission(teamId, project),
      });
    });
    return teams;
  }

  @Trace()
  public async teamProjects(team: string): Promise<TeamProjectListDTO[]> {
    const projects = await this.teamService.getTeamProjects(team);

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
  public async update(update?: TeamDTO): Promise<TeamDTO> {
    return await this.submissionService.update(update);
  }

  // #endregion Public Methods

  // #region Private Methods

  @Trace()
  private async onModuleInit() {
    this.form = await this.formService.findByName(
      PORTAL_RESOURCES.team,
      this.formioSDK.PORTAL_BASE,
    );
    this.submissionService.attach(this.formioSDK.PORTAL_BASE, this.form);
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
