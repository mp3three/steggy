import { AWSService, MainCLIREPL } from '@automagical/terminal';
import { AutoConfigService, filterUnique } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { each } from 'async';
import inquirer from 'inquirer';

import { MULTICONTAINERS } from '../typings/multicontainer';


enum DeploymentActions {
  redeploy = 'Redeploy Environment',
  multicontainer = 'Create multicontainer.zip',
}

@Injectable()
export class DeployREPL {
  // #region Object Properties

  public description = [
    `Interact with your deployments`,
    `  - Generate`,
    `  - Update`,
  ];
  public name = 'Deployments';

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly cli: MainCLIREPL,
    private readonly configService: AutoConfigService,
    private readonly awsService: AWSService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public async buildMulticontainers(): Promise<void> {
    return;
  }

  public async exec(): Promise<void> {
    const { action } = await inquirer.prompt({
      choices: [DeploymentActions.redeploy, DeploymentActions.multicontainer],
      message: 'Which action',
      name: 'action',
      type: 'list',
    });
    switch (action as DeploymentActions) {
      case DeploymentActions.redeploy:
        const { applications } = await inquirer.prompt([
          {
            choices: filterUnique(
              Object.values(
                this.configService.get(`application.AWS_ENVIRONMENTS`),
              ),
            ),
            message: 'Which applications?',
            name: 'applications',
            type: 'checkbox',
          },
        ]);
        await this.updateDeployment(applications);
        break;
      case DeploymentActions.multicontainer:
        const { containers } = await inquirer.prompt([
          {
            choices: Object.values(MULTICONTAINERS),
            message: 'Which containers?',
            name: 'containers',
            type: 'checkbox',
          },
        ]);
        break;
    }
  }

  public async updateDeployment(applications: string[]): Promise<void> {
    const environmentList = this.configService.get(
      `application.AWS_ENVIRONMENTS`,
    );
    const environments = Object.keys(environmentList);
    await Promise.all(
      applications.map(async (application) => {
        const updateList = environments.filter(
          (environment) => environmentList[environment] === application,
        );
        await each(updateList, async (environment, callback) => {
          await this.awsService.updateEnvironment(environment);
          callback();
        });
      }),
    );
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected onModuleInit(): void {
    this.cli.addScript(this);
  }

  // #endregion Protected Methods
}
