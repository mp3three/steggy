import { LIB_SERVER } from '@automagical/contracts/constants';
import {
  ProjectDTO,
  TeamDTO,
  TeamMemberDTO,
  UserDTO,
} from '@automagical/contracts/formio-sdk';
import {
  PATH_PARAMETERS,
  SwaggerParameters,
  TeamProjectListDTO,
} from '@automagical/contracts/server';
import { MemberService, TeamService } from '@automagical/formio-sdk';
import { InjectLogger } from '@automagical/utilities';
import {
  Controller,
  Get,
  NotFoundException,
  NotImplementedException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PinoLogger } from 'nestjs-pino';

import { PermissionScope, Project, User } from '../decorators';

@Controller('/team')
@ApiTags('team')
@PermissionScope()
export class TeamController {
  // #region Constructors

  constructor(
    @InjectLogger(TeamController, LIB_SERVER)
    private readonly logger: PinoLogger,
    private readonly teamService: TeamService,
    private readonly memberService: MemberService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  /**
   * Expose the functionality to find all of a users teams.
   */
  @Get('/all')
  public async getAll(@User() user: UserDTO): Promise<TeamDTO[]> {
    return await this.memberService.userTeams(user);
  }

  /**
   * No observed difference between this and /all, one might be legacy?
   */
  @Get('/own')
  public async getOwn(@User() user: UserDTO): Promise<TeamDTO[]> {
    return await this.getAll(user);
  }

  /**
   * Allow a user with permissions to get all the teams associated with the given project.
   */
  @Get('/project/:projectId')
  @SwaggerParameters(PATH_PARAMETERS.teamId, PATH_PARAMETERS.projectId)
  public async getProjectTeams(
    @Project() project: ProjectDTO,
  ): Promise<TeamDTO[]> {
    const teams = await this.teamService.projectTeams(project);
    return [...teams.values()];
  }

  @Get('/:teamId/member/:submissionId')
  @SwaggerParameters(PATH_PARAMETERS.teamId, PATH_PARAMETERS.submissionId)
  public async getTeamMember(
    @Param('teamId') teamId: string,
    @User() user: UserDTO,
  ): Promise<TeamMemberDTO> {
    const member = await this.memberService.getMember(teamId, user);
    if (member.data.team._id === teamId) {
      return member;
    }
    throw new NotFoundException();
  }

  /**
   * Allow a user with permission to get all the associated projects and roles that
   * the current team is associated with.
   */
  @Get('/:teamId/projects')
  @SwaggerParameters(PATH_PARAMETERS.teamId)
  public async getTeamProjects(
    @Param('teamId') teamId: string,
  ): Promise<TeamProjectListDTO[]> {
    return await this.teamService.teamProjects(teamId);
  }

  @Get('/stage/:projectId')
  @SwaggerParameters(PATH_PARAMETERS.projectId)
  public async stageTeams(): Promise<never> {
    throw new NotImplementedException();
  }

  @Post('/:teamId/members')
  @SwaggerParameters(PATH_PARAMETERS.teamId)
  public async addTeamMember(): Promise<never> {
    throw new NotImplementedException();
  }

  @Post('/:teamId/join')
  @SwaggerParameters(PATH_PARAMETERS.teamId)
  public async joinTeam(): Promise<never> {
    throw new NotImplementedException();
  }

  @Post('/:teamId/leave')
  @SwaggerParameters(PATH_PARAMETERS.teamId)
  public async leaveTeam(): Promise<never> {
    throw new NotImplementedException();
  }

  @Put('/:teamId/member/:submissionId')
  @SwaggerParameters(PATH_PARAMETERS.teamId, PATH_PARAMETERS.submissionId)
  public async updateTeamMember(): Promise<never> {
    throw new NotImplementedException();
  }

  // #endregion Public Methods
}
