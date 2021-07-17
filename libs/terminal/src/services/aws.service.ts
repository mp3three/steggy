import { AWS_ENVIRONMENTS } from '@formio/contracts/config';
import { CONFIG_PROVIDERS } from '@formio/contracts/terminal';
import {
  EBApplicationDTO,
  EBEnvironmentDTO,
} from '@formio/contracts/utilities';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import execa from 'execa';
import inquirer from 'inquirer';
import Table from 'cli-table';
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
        type: 'checkbox',
        choices: environmentsNames,
        message: 'Which environments?',
      },
    ]);

    const applications = await this.describeEnvironments();
    const { environment } = await inquirer.prompt([
      {
        name: 'environment',
        message: 'Select an application',
        choices: applications.map((item) => item.EnvironmentName),
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

  protected onModuleInit() {
    this.configBuilder.provider.set(
      CONFIG_PROVIDERS.ebenvironment,
      async (defaultValue: unknown) => {
        this.environments ??= await this.describeEnvironments();
        const { environment } = await inquirer.prompt([
          {
            name: 'environment',
            message: 'Select an environment',
            choices: this.environments.map((item) => item.EnvironmentName),
            default: defaultValue,
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
    const args = ['elasticbeanstalk', 'describe-environments'];
    if (environmentName) {
      args.push('--environment-names', environmentName);
    }
    const { stdout } = await execa('aws', args);
    const environments = JSON.parse(stdout).Environments as EBEnvironmentDTO[];
    const columns: (keyof EBEnvironmentDTO)[] = [
      'EnvironmentName',
      'ApplicationName',
      'VersionLabel',
      'Health',
      'EndpointURL',
    ];
    const table = new Table({ head: columns });
    environments.forEach((env) => {
      table.push(columns.map((col) => env[col]));
    });
    console.log(table.toString());
    return environments;
  }

  // #endregion Private Methods
}
