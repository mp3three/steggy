import { JIRA_CONFIG } from '@automagical/contracts/config';
import { LIB_WRAPPER } from '@automagical/contracts/constants';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import JiraApi from 'jira-client';
import { PinoLogger } from 'nestjs-pino';

import { InjectLogger, Trace } from '../decorators';

@Injectable()
export class JiraService {
  // #region Object Properties

  private readonly jiraService: JiraApi;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(JiraService, LIB_WRAPPER) private readonly logger: PinoLogger,
    readonly configService: ConfigService,
  ) {
    this.jiraService = new JiraApi(configService.get(JIRA_CONFIG));
  }

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async getMRLink(ticketId: string): Promise<JiraApi.JsonResponse> {
    const ticket = await this.getTicket(ticketId);
    return ticket.fields.customfield_10809;
  }

  @Trace()
  public async getTicket(ticketId: string): Promise<JiraApi.JsonResponse> {
    return await this.jiraService.findIssue(ticketId);
  }

  @Trace()
  public async setMRLink(
    ticketId: string,
    link: string,
  ): Promise<JiraApi.JsonResponse> {
    return await this.jiraService.updateIssue(ticketId, {
      fields: {
        customfield_10809: link,
      },
    });
  }

  // #endregion Public Methods
}
