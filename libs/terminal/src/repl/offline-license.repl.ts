import { Injectable } from '@nestjs/common';
import chalk from 'chalk';
import dayjs from 'dayjs';
import figlet from 'figlet';
import { readFileSync } from 'fs';
import inquirer from 'inquirer';
import { sign } from 'jsonwebtoken';

import { CLIService, FigletFonts } from '@formio/contracts/terminal';
import { MainCLIREPL } from './main-cli.repl';

interface ResultType {
  // #region Object Properties

  limit: number;
  scopes: string[];
  sub: string;
  validity: Date;

  // #endregion Object Properties
}
@Injectable()
export class OfflineLicenseREPL implements CLIService {
  // #region Object Properties

  public description = [`Generate licenses for use in offline deployments.`];
  public name = 'Offline License';

  private key: string = readFileSync(
    'apps/support-tools/src/assets/offline-license.key',
    'utf-8',
  );

  // #endregion Object Properties

  // #region Constructors

  constructor(private readonly cli: MainCLIREPL) {
    this.cli.addScript(this);
  }

  // #endregion Constructors

  // #region Public Methods

  public async exec(): Promise<void> {
    const results = (await inquirer.prompt(this.loadQuestions())) as ResultType;
    const out = sign(
      JSON.stringify({
        exp: results.validity.getTime(),
        iat: Date.now(),
        iss: 'https://form.io',
        sub: results.sub,
        terms: {
          // Not sure this does anything.
          formManagers: 5,
          // The portal checks this number to enable the "Add Stage" button
          livestages: 5,
          // Form manager app checks this to skip the old license. Number doesn't matter but it needs to be there.
          options: {
            sac: true, // This actually works.
          },
          projectsNumberLimit: results.limit,
          scopes: results.scopes,
          stages: 5,
        },
      }),
      this.key,
      {
        algorithm: 'PS256',
      },
    );
    const header = figlet.textSync(this.name, {
      font: FigletFonts.output,
    });
    console.log(chalk`\n{green ${header}}`);
    console.log(out);
  }

  // #endregion Public Methods

  // #region Private Methods

  private loadQuestions(): inquirer.QuestionCollection {
    return [
      {
        message: 'Company Name',
        name: 'sub',
        type: 'input',
      },
      {
        choices: [
          'apiServer',
          'pdfServer',
          'project',
          'tenant',
          'stage',
          'formManager',
        ],
        default: [
          'apiServer',
          'pdfServer',
          'project',
          'tenant',
          'stage',
          'formManager',
        ],
        loop: false,
        message: 'Scopes',
        name: 'scopes',
        type: 'checkbox',
      },
      {
        default: dayjs().add(1, 'y').toDate(),
        format: {
          hour: undefined,
          minute: undefined,
        },
        message: 'End date',
        name: 'validity',
        type: 'date',
      },
      {
        default: 1,
        message: 'Project Limit?',
        name: 'limit',
        type: 'number',
      },
    ];
  }

  // #endregion Private Methods
}
