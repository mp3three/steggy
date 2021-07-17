import {
  CrudOptions,
  FormCRUD,
  SubmissionCRUD,
  TeamAdapter,
} from '@formio/contracts';
import {
  CREATE_MEMBER_EVENT,
  LIB_FORMIO_SDK,
  TRUNCATE_TEAM_EVENT,
} from '@formio/contracts/constants';
import { FilterDTO, ResultControlDTO } from '@formio/contracts/fetch';
import {
  FormDTO,
  PORTAL_RESOURCES,
  TeamDTO,
  TeamMemberDataDTO,
  TeamMemberDTO,
  UserDTO,
} from '@formio/contracts/formio-sdk';
import { InjectLogger, Trace } from '@formio/utilities';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { eachLimit } from 'async';
import { PinoLogger } from 'nestjs-pino';

import { FormioSdkService } from './formio-sdk.service';
import { TeamService } from './team.service';
import { UserService } from './user.service';

@Injectable()
export class MemberService {
  // #region Object Properties

  public form: FormDTO;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(MemberService, LIB_FORMIO_SDK)
    private readonly logger: PinoLogger,
    @Inject(SubmissionCRUD) private readonly submissionService: SubmissionCRUD,
    @Inject(FormCRUD) private readonly formCrud: FormCRUD,
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
  public async acceptInvite(
    team: TeamDTO,
    user: UserDTO,
    options: CrudOptions,
  ): Promise<void> {
    user = await this.userService.findById(user, options);
    const member = await this.getMember(team, user, options);
    if (!member) {
      throw new BadRequestException('No invitation');
    }
    user.metadata.teams ??= [];
    if (user.metadata.teams.includes(team._id)) {
      throw new BadRequestException('Invite already accepted');
    }
    // Add team to list of user teams
    user.metadata.teams.push(team._id);
    await this.userService.update(user, options);
    // Flag invite as accepted
    member.metadata.accepted = true;
    await this.update(member, options);
    // Increment member count
    team.metadata.memberCount ??= 0;
    team.metadata.memberCount++;
    await this.teamService.update(team, options);
  }

  @Trace()
  public async delete(
    member: TeamMemberDTO,
    skipTeamUpdate = false,
    options: CrudOptions,
  ): Promise<boolean> {
    const user = await this.userService.findByEmail(member.data.email, options);
    user.metadata.teams = user.metadata.teams.filter(
      (teamId) => member.data.team._id !== teamId,
    );
    await this.userService.update(user, options);
    if (skipTeamUpdate === false) {
      const team = await this.teamService.findById(
        member.data.team._id,
        options,
      );
      team.metadata.memberCount--;
      await this.teamService.update(team, options);
    }
    return await this.submissionService.delete(member, options);
  }

  @Trace()
  public async findById(
    submission: string,
    options: CrudOptions,
  ): Promise<TeamMemberDTO> {
    return await this.submissionService.findById(submission, options);
  }

  @Trace()
  public async findManyTeams(
    query: ResultControlDTO,
    options: CrudOptions,
  ): Promise<TeamMemberDTO[]> {
    return await this.submissionService.findMany(query, options);
  }

  @Trace()
  public async getMember(
    team: TeamDTO | string,
    user: UserDTO,
    options: CrudOptions,
  ): Promise<TeamMemberDTO> {
    team = typeof team === 'string' ? team : team._id;
    const list = await this.submissionService.findMany<TeamMemberDTO>(
      {
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
      },
      options,
    );
    return list[0];
  }

  @Trace()
  public async teamMembers(
    team: TeamDTO | string,
    options: CrudOptions,
  ): Promise<TeamMemberDTO[]> {
    team = typeof team === 'string' ? team : team._id;
    return this.submissionService.findMany(
      {
        filters: new Set([
          {
            field: 'data.team._id',
            value: team,
          },
        ]),
      },
      options,
    );
  }

  @Trace()
  public async update(
    source: TeamMemberDTO,
    options: CrudOptions,
  ): Promise<TeamMemberDTO> {
    return await this.submissionService.update(source, options);
  }

  @Trace()
  public async userTeams(
    user: UserDTO,
    options: CrudOptions & Partial<Record<'admin' | 'accepted', boolean>>,
  ): Promise<TeamDTO[]> {
    const email = user.data?.email;
    const { admin, accepted } = options;
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
    const members = await this.teamAdapter.getUserTeams({ filters }, options);
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
    options: CrudOptions,
  ): Promise<TeamMemberDTO> {
    return await this.submissionService.create(
      {
        data: member,
        form: this.form._id,
        metadata: {
          accepted,
        },
        project: this.formioSDK.BASE_PROJECT._id,
      } as TeamMemberDTO,
      options,
    );
  }

  // #endregion Public Methods

  // #region Protected Methods

  @OnEvent(TRUNCATE_TEAM_EVENT)
  protected async truncateTeam(
    team: TeamDTO | string,
    options: CrudOptions,
  ): Promise<void> {
    const members = await this.teamMembers(team, options);
    await eachLimit(members, 5, async (teamMember) => {
      await this.delete(teamMember, true, options);
    });
  }

  // #endregion Protected Methods

  // #region Private Methods

  @Trace()
  private async onModuleInit() {
    this.form = await this.formCrud.findByName(PORTAL_RESOURCES.member, {
      project: this.formioSDK.BASE_PROJECT,
    });
    if (typeof this.form === 'string') {
      this.logger.warn(`Failed to load team data`);
    }
  }

  // #endregion Private Methods
}
