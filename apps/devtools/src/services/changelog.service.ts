import { FormDTO } from '@automagical/contracts/formio-sdk';
import {
  ChangelogDataDTO,
  ChangelogDTO,
} from '@automagical/contracts/terminal';
import { FormService, SubmissionService } from '@automagical/formio-sdk';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import prompts from 'prompts';

@Injectable()
export class ChangelogREPL2 {
  // #region Object Properties

  private form: FormDTO;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger()
    private readonly logger: PinoLogger,
    private readonly submissionService: SubmissionService,
    private readonly formService: FormService,
    private readonly configService: ConfigService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async cliBuild(): Promise<ChangelogDTO> {
    const ticket = await this.getTicket();
    const data: ChangelogDataDTO = {
      comments: await this.getComments(),
      tags: await this.getTags(),
      ticket,
    } as ChangelogDataDTO;
    this.logger.info(data);
    return undefined;
    // return await this.createEntry(data);
  }

  @Trace()
  public async createEntry(data: ChangelogDataDTO): Promise<ChangelogDTO> {
    return await this.submissionService.create({ data }, { form: this.form });
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Trace()
  protected async onModuleInit(): Promise<void> {
    this.form = await this.formService.findByName('changelog', {});
  }

  // #endregion Protected Methods

  // #region Private Methods

  @Trace()
  private async getComments(): Promise<string> {
    const { comments } = await prompts({
      message: 'Extra messages to include with changelog',
      name: 'comments',
      type: 'text',
    });
    return comments;
  }

  @Trace()
  private async getTags(): Promise<string[]> {
    const { tags } = await prompts({
      choices: ['fix', 'feature'].map((text) => {
        return {
          title: text,
          value: text,
        };
      }),
      message: 'Change tags',
      name: 'tags',
      type: 'multiselect',
    });
    return tags;
  }

  private async getTicket(): Promise<
    Record<'description' | 'ticketNumber', string>
  > {
    // const { source } = await prompts({
    //   choices: ['jira', 'none', 'trello', 'github'].map((text) => {
    //     return {
    //       selected: text === 'jira',
    //       title: text,
    //       value: text,
    //     };
    //   }),
    //   message: 'Issue Source',
    //   name: 'source',
    //   type: 'select',
    // });
    // if (source !== 'jira') {
    //   return {
    //     description: '',
    //     ticketNumber: '',
    //   };
    // }
    // console.log('--');
    // console.log('--');
    // console.log('--');
    // console.log('--');
    // const { ticketNumber } = await prompts({
    //   message: 'Ticket number',
    //   name: 'ticketNumber',
    //   type: 'text',
    // });
    // console.log('asdf');
    // const response = await prompt({
    //   message: 'Do you like pizza?',
    //   name: 'dish',
    //   type: 'text',
    // });
    // console.log(response);

    return {
      description: '',
      ticketNumber: '',
    };
    // return await prompts([
    //   {
    //     choices: ['jira', 'none', 'trello', 'github'].map((text) => {
    //       return {
    //         selected: text === 'jira',
    //         title: text,
    //         value: text,
    //       };
    //     }),
    //     message: 'Issue Source',
    //     name: 'source',
    //     type: 'select',
    //   },
    //   {
    //     message: 'Ticket number',
    //     name: 'ticketNumber',
    //     onState(state) {
    //       if (state.exited) {
    //         console.log('onState', arguments_);
    //       }
    //     },
    //     type: 'text',
    //   },
    //   {
    //     message: 'Description',
    //     name: 'description',
    //     onState(previous, values) {
    //       // console.log(values);
    //     },
    //     type: (previous, values) => {
    //       return values.source === 'jira' ? 'text' : undefined;
    //     },
    //   },
    // ]);
  }

  // #endregion Private Methods
}
