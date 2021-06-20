import { FormCRUD, SubmissionCRUD, TeamAdapter } from '@automagical/contracts';
import {
  CREATE_MEMBER_EVENT,
  LIB_SERVER,
  PORTAL_RESOURCES,
  TRUNCATE_TEAM_EVENT,
} from '@automagical/contracts/constants';
import { FilterDTO, ResultControlDTO } from '@automagical/contracts/fetch';
import {
  FormDTO,
  TeamDTO,
  TeamMemberDataDTO,
  TeamMemberDTO,
  UserDTO,
} from '@automagical/contracts/formio-sdk';
import { InjectLogger, Trace } from '@automagical/utilities';
import { BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { eachLimit } from 'async';
import { PinoLogger } from 'nestjs-pino';

import { FormioSdkService } from './formio-sdk.service';
import { TeamService } from './team.service';
import { UserService } from './user.service';

export class MemberService {
  // #region Object Properties

  public form: FormDTO;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(MemberService, LIB_SERVER)
    private readonly logger: PinoLogger,
    @Inject(SubmissionCRUD) private readonly submissionService: SubmissionCRUD,
    @Inject(FormCRUD) private readonly formService: FormCRUD,
    private readonly formioSDK: FormioSdkService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly teamService: TeamService,
    @Inject(TeamAdapter)
    private readonly teamAdapter: TeamAdapter,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async acceptInvite(team: TeamDTO, user: UserDTO): Promise<void> {
    user = await this.userService.findById(user);
    const member = await this.getMember(team, user);
    if (!member) {
      throw new BadRequestException('No invitation');
    }
    user.metadata.teams ??= [];
    if (user.metadata.teams.includes(team._id)) {
      throw new BadRequestException('Invite already accepted');
    }
    // Add team to list of user teams
    user.metadata.teams.push(team._id);
    await this.userService.update(user);
    // Flag invite as accepted
    member.metadata.accepted = true;
    await this.update(member);
    // Increment member count
    team.metadata.memberCount ??= 0;
    team.metadata.memberCount++;
    await this.teamService.update(team);
  }

  @Trace()
  public async delete(
    member: TeamMemberDTO,
    skipTeamUpdate = false,
  ): Promise<boolean> {
    const user = await this.userService.findByEmail(member.data.email);
    user.metadata.teams = user.metadata.teams.filter(
      (teamId) => member.data.team._id !== teamId,
    );
    await this.userService.update(user);
    if (skipTeamUpdate === false) {
      const team = await this.teamService.findById(member.data.team._id);
      team.metadata.memberCount--;
      await this.teamService.update(team);
    }
    return await this.submissionService.delete(member);
  }

  @Trace()
  public async findById(submission: string): Promise<TeamMemberDTO> {
    return await this.submissionService.findById(submission);
  }

  @Trace()
  public async findManyTeams(
    query: ResultControlDTO,
  ): Promise<TeamMemberDTO[]> {
    return await this.submissionService.findMany(query);
  }

  @Trace()
  public async getMember(
    team: TeamDTO | string,
    user: UserDTO,
  ): Promise<TeamMemberDTO> {
    team = typeof team === 'string' ? team : team._id;
    const list = await this.submissionService.findMany<TeamMemberDTO>({
      filters: new Set([
        {
          field: 'data.team._id',
          value: team,
        },
        {
          field: 'data.email',
          value: user.data.email,
        },
      ]),
    });
    return list[0];
  }

  @Trace()
  public async teamMembers(team: TeamDTO | string): Promise<TeamMemberDTO[]> {
    team = typeof team === 'string' ? team : team._id;
    return this.submissionService.findMany({
      filters: new Set([
        {
          field: 'data.team._id',
          value: team,
        },
      ]),
    });
  }

  @Trace()
  public async update(source: TeamMemberDTO): Promise<TeamMemberDTO> {
    return await this.submissionService.update(source);
  }

  @Trace()
  public async userTeams(
    user: UserDTO,
    admin = false,
    accepted = true,
  ): Promise<TeamDTO[]> {
    const email = user.data?.email;
    if (!email) {
      this.logger.debug({ user }, `User has no email`);
      return [];
    }
    const filters = new Set<FilterDTO>([
      {
        field: 'data.email',
        value: user.data.email,
      },
    ]);
    if (admin) {
      filters.add({
        field: 'data.admin',
        value: true,
      });
    }
    if (accepted) {
      filters.add({
        field: 'metadata.accepted',
        value: true,
      });
    }
    const members = await this.teamAdapter.getUserTeams({ filters });
    return members
      .filter((member) => {
        return member.data.team;
      })
      .map((item) => item.data.team);
  }

  @Trace()
  @OnEvent(CREATE_MEMBER_EVENT)
  public async create(
    member: TeamMemberDataDTO,
    accepted = false,
  ): Promise<TeamMemberDTO> {
    return await this.submissionService.create({
      data: member,
      form: this.form._id,
      metadata: {
        accepted,
      },
      project: this.formioSDK.PORTAL_BASE._id,
    } as TeamMemberDTO);
  }

  // #endregion Public Methods

  // #region Protected Methods

  @OnEvent(TRUNCATE_TEAM_EVENT)
  protected async truncateTeam(team: TeamDTO | string): Promise<void> {
    const members = await this.teamMembers(team);
    await eachLimit(members, 5, async (teamMember) => {
      await this.delete(teamMember, true);
    });
  }

  // #endregion Protected Methods

  // #region Private Methods

  @Trace()
  private async onModuleInit() {
    this.form = await this.formService.findByName(
      PORTAL_RESOURCES.member,
      this.formioSDK.PORTAL_BASE,
    );
  }

  // #endregion Private Methods
}
