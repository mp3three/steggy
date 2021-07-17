import { FormCRUD, SubmissionCRUD } from '@formio/contracts';
import { FormDTO } from '@formio/contracts/formio-sdk';
import {
  ChangelogDataDTO,
  ChangelogDTO,
  ChangelogTicketDTO,
  CHANGELOG_FORM,
  CHANGELOG_TAGS,
  CHANGELOG_TICKETSOURCE,
  CLIService,
} from '@formio/contracts/terminal';
import { Inject, Injectable } from '@nestjs/common';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { SystemService } from '../services';
import { MainCLIREPL } from './main-cli.repl';

@Injectable()
export class ChangelogREPL implements CLIService {
  // #region Object Properties

  public description = [`Version bumping`, `Changelog generation`];
  public name = 'Changelog';

  private form: FormDTO;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly cli: MainCLIREPL,
    @Inject(FormCRUD)
    private readonly formCrud: FormCRUD,
    @Inject(SubmissionCRUD)
    private readonly submissionCrud: SubmissionCRUD,
    private readonly systemService: SystemService,
  ) {
    this.cli.addScript(this);
  }

  // #endregion Constructors

  // #region Public Methods

  public async exec(): Promise<void> {
    const affected = await this.systemService.getAffected();
    const nodeModules = affected.projects.filter(
      (item) => item.substr(0, 3) === 'npm',
    );
    if (nodeModules) {
      console.log(chalk`{bgGreen.black Node Dependencies}`);
      console.log(nodeModules.map((item) => ` - ${item.substr(4)}`).join(`\n`));
    }
    console.log();
    const repoAffected = affected.projects.filter(
      (item) => item.substr(0, 3) !== 'npm',
    );
    await this.versionBump(repoAffected);
    const changelog = await this.buildChangelog(
      repoAffected,
      nodeModules.map((item) => item.substr(4)),
    );
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected async onModuleInit(): Promise<void> {
    this.form = await this.formCrud.findByName(CHANGELOG_FORM, {});
  }

  // #endregion Protected Methods

  // #region Private Methods

  private async buildChangelog(
    projects: string[],
    nodeModules: string[],
  ): Promise<ChangelogDTO> {
    const ticket = await this.getTicket();
    const comments = await this.getComments();
    const tags = await this.getTags();
    const changelog = {
      rootVersion: this.systemService.bumpRootPackageVersion(),
      tags,
      comments,
      nodeModules,
      libraryUpdates: projects
        .filter((item) => this.systemService.isLibrary(item))
        .map((name) => {
          return {
            name,
            version: this.systemService.packageGet(name).version,
          };
        }),
      ticket,
      appVersions: projects
        .filter((item) => !this.systemService.isLibrary(item))
        .map((name) => {
          return {
            name,
            version: this.systemService.packageGet(name).version,
          };
        }),
    } as ChangelogDataDTO;
    return await this.submissionCrud.create(
      { data: changelog },
      {
        form: this.form,
      },
    );
  }

  private async getComments(): Promise<string> {
    const { comments } = await inquirer.prompt([
      {
        message: 'Changelog Comments',
        name: 'comments',
        type: 'editor',
        default: [
          `Commit Messages`,
          ``,
          ...(await this.getCommitMessages()).map((item) => ` * ${item}`),
        ].join(`\n`),
      },
    ]);
    return comments;
  }

  private async getCommitMessages(): Promise<string[]> {
    const branch = await this.systemService.getBranchName();
    return await this.systemService.getCommitMessages(branch);
  }

  private async getTags(): Promise<string[]> {
    const { tags } = await inquirer.prompt([
      {
        choices: Object.values(CHANGELOG_TAGS),
        message: 'Tags',
        name: 'tags',
        type: 'checkbox',
      },
    ]);
    return tags;
  }

  private async getTicket(): Promise<ChangelogTicketDTO> {
    const { source } = await inquirer.prompt([
      {
        choices: Object.values(CHANGELOG_TICKETSOURCE),
        message: 'Ticket Source',
        name: 'source',
        type: 'list',
        default: CHANGELOG_TICKETSOURCE.none,
      },
    ]);
    let ticketNumber = '';
    let description = '';
    if (source !== CHANGELOG_TICKETSOURCE.none) {
      const { num } = await inquirer.prompt([
        {
          message: 'Ticket Number',
          name: 'num',
          type: 'input',
        },
      ]);
      ticketNumber = num;
      description = '';
    }
    return {
      source,
      ticketNumber,
      description,
    };
  }

  private async versionBump(projects: string[]) {
    const { workspace } = this.systemService;
    const { list } = (await inquirer.prompt([
      {
        type: 'checkbox',
        message: 'Version Bump',
        name: 'list',
        pageSize: 20,
        choices: [
          new inquirer.Separator('Applications'),
          ...projects
            .filter(
              (item) => workspace.projects[item].projectType === 'application',
            )
            .map((name) => {
              return {
                name,
                checked: true,
              };
            }),
          new inquirer.Separator('Libraries'),
          ...projects
            .filter(
              (item) => workspace.projects[item].projectType === 'library',
            )
            .map((name) => {
              return {
                name,
                checked: true,
              };
            }),
        ],
      },
    ])) as Record<'list', string[]>;
    await this.systemService.bumpLibraries(list);
    await this.systemService.bumpApplications(list);
  }

  // #endregion Private Methods
}
