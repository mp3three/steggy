import { AWS_ENVIRONMENTS } from '@automagical/contracts/config';
import {
  EBApplicationDTO,
  EBEnvironmentDTO,
} from '@automagical/contracts/utilities';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Table from 'cli-table';
import execa from 'execa';
import inquirer from 'inquirer';

import { ConfigBuilderREPL } from '../repl/config-builder.repl';

@Injectable()
export class AWSService {
  // #region Object Properties

  private environments: EBEnvironmentDTO[];

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => ConfigBuilderREPL))
    private readonly configBuilder: ConfigBuilderREPL,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  /**
   * AWS_ENVIRONMENTS builder
   *   key: 'Environment Name',
   *   value: 'Version Label',
   */
  public async buildConfigMapping(): Promise<Record<string, string>> {
    const environments = this.configService.get(AWS_ENVIRONMENTS, {});
    const environmentsNames = Object.keys(environments);

    const { list } = await inquirer.prompt([
      {
        choices: environmentsNames,
        message: 'Which environments?',
        type: 'checkbox',
      },
    ]);

    const applications = await this.describeEnvironments();
    const { environment } = await inquirer.prompt([
      {
        choices: applications.map((item) => item.EnvironmentName),
        message: 'Select an application',
        name: 'environment',
        type: 'list',
      },
    ]);
    return {};
  }

  public async updateEnvironment(environmentName: string): Promise<void> {
    const [environment] = await this.describeEnvironments({ environmentName });
    console.log('update', environmentName);
    // const { stdout } = await execa('aws', [
    //   'elasticbeanstalk',
    //   'update-environment',
    //   '--environment-name',
    //   environment.EnvironmentName,
    //   '--version-label',
    //   environment.VersionLabel,
    // ]);
    // const output = JSON.parse(stdout);
    // console.log(output);
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected onModuleInit(): void {
    this.configBuilder.provider.set(
      'ebenvironment',
      async (defaultValue: unknown) => {
        this.environments ??= await this.describeEnvironments();
        const { environment } = await inquirer.prompt([
          {
            choices: this.environments.map((item) => item.EnvironmentName),
            default: defaultValue,
            message: 'Select an environment',
            name: 'environment',
            type: 'list',
          },
        ]);
        return environment;
      },
    );
  }

  // #endregion Protected Methods

  // #region Private Methods

  private async describeApplications(): Promise<EBApplicationDTO[]> {
    const { stdout } = await execa('aws', [
      'elasticbeanstalk',
      'describe-applications',
    ]);
    return JSON.parse(stdout);
  }

  private async describeEnvironments({
    environmentName,
  }: {
    environmentName?: string;
  } = {}): Promise<EBEnvironmentDTO[]> {
    const arguments_ = ['elasticbeanstalk', 'describe-environments'];
    if (environmentName) {
      arguments_.push('--environment-names', environmentName);
    }
    const { stdout } = await execa('aws', arguments_);
    const environments = JSON.parse(stdout).Environments as EBEnvironmentDTO[];
    const columns: (keyof EBEnvironmentDTO)[] = [
      'EnvironmentName',
      'ApplicationName',
      'VersionLabel',
      'Health',
      'EndpointURL',
    ];
    const table = new Table({ head: columns });
    environments.forEach((environment) => {
      table.push(columns.map((col) => environment[col]));
    });
    console.log(table.toString());
    return environments;
  }

  // #endregion Private Methods
}
