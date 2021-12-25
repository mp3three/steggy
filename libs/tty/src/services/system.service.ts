import {
  AbstractConfig,
  AutoLogService,
  filterUnique,
  IsEmpty,
  PACKAGE_FILE,
  WorkspaceService,
} from '@text-based/utilities';
import { Injectable } from '@nestjs/common';
import { eachSeries } from 'async';
import chalk from 'chalk';
import JSON from 'comment-json';
import execa from 'execa';
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { encode } from 'ini';
import inquirer from 'inquirer';
import { homedir } from 'os';
import { join, resolve } from 'path';
import { cwd } from 'process';
import { inc } from 'semver';

import { NXAffected } from '../contracts';
import { PromptService } from './prompt.service';

/**
 * Class for working with the host operating system,
 * and performing operations against the workspace
 */
@Injectable()
export class SystemService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly promptService: PromptService,
    private readonly workspace: WorkspaceService,
  ) {}

  private get projects() {
    return this.workspace.workspace.projects;
  }

  public async bumpApplications(list: string[]): Promise<void> {
    await eachSeries(
      list.filter((item) => this.projects[item].projectType === 'application'),
      async (application: string, callback) => {
        const { version } = this.workspace.PACKAGES.get(application);
        const { action } = await inquirer.prompt([
          {
            choices: [
              {
                key: 'm',
                name: 'Minor',
                value: 'minor',
              },
              {
                key: 'p',
                name: 'Patch',
                value: 'patch',
              },
              {
                key: 'r',
                name: 'Release Candidate',
                value: 'rc',
              },
            ],
            message: application,
            name: 'action',
            suffix: `@${version}`,
            type: 'expand',
          },
        ]);
        const updated =
          action === 'rc'
            ? inc(version, 'prerelease', 'rc')
            : inc(version, action);
        console.log(
          chalk.blueBright(application),
          version,
          chalk.green(`=>`),
          updated,
        );
        this.packageWriteVersion(application, updated);
        callback();
      },
    );
  }

  public bumpLibraries(list: string[]): void {
    list
      .filter((item) => this.projects[item].projectType === 'library')
      .forEach((value) => {
        const data = this.workspace.PACKAGES.get(value);
        const currentVersion = data.version;
        data.version = inc(data.version, 'patch');
        this.packageWriteVersion(value, data.version);
        console.log(
          chalk`{yellow library} ${value} ${currentVersion} {green =>} ${data.version}`,
        );
      });
  }

  public bumpRootPackageVersion(): string {
    const rootPackage = JSON.parse(readFileSync(PACKAGE_FILE, 'utf-8'));
    const current = rootPackage.version;
    rootPackage.version = inc(rootPackage.version, 'patch');
    writeFileSync(PACKAGE_FILE, JSON.stringify(rootPackage, undefined, '  '));
    console.log(
      chalk.magenta('root'),
      current,
      chalk.green(`=>`),
      rootPackage.version,
    );
    return rootPackage.version;
  }

  public configPath(application: string): string {
    return join(homedir(), '.config', application);
  }

  public async getAffected(): Promise<NXAffected> {
    const { stdout } = await execa('npx', ['nx', 'print-affected']);
    return JSON.parse(stdout);
  }

  public async getBranchName(): Promise<string> {
    const { stdout } = await execa('git', [
      'rev-parse',
      '--abbrev-ref',
      'HEAD',
    ]);
    return stdout;
  }

  public async getCommitMessages(branch: string): Promise<string[]> {
    const { stdout } = await execa('git', [
      'log',
      '--walk-reflogs',
      '--format=%B',
      branch.trim(),
    ]);
    return filterUnique(stdout.split(`\n`).filter((item) => !IsEmpty(item)));
  }

  public isLibrary(project: string): boolean {
    return this.projects[project].projectType === 'library';
  }

  /**
   * inquirer will default to vim when displaying an editor
   *
   * Ask the user if they wish to change the default if one is not set
   */
  public async verifyEditor(): Promise<void> {
    if (process.env.EDITOR || process.env.VISUAL) {
      // Something is already set!
      return;
    }
    this.logger.warn('No default editor set');
    const { editor } = await inquirer.prompt([
      {
        choices: ['default', 'vim', 'vi', 'nano'],
        message: ``,
        name: 'editor',
        type: 'list',
      },
    ]);
    if (editor === 'default') {
      return;
    }
    // const { stdout } = await execa(`which`, [editor]);
    process.env.EDITOR = editor;

    const { exportDestination } = await inquirer.prompt([
      {
        choices: ['~/.bashrc', '~/.zshrc', 'none'],
        message: `Export default editor to`,
        name: 'exportDestination',
        type: 'list',
      },
    ]);

    if (exportDestination === 'none') {
      return;
    }
    appendFileSync(resolve(exportDestination), `\nexport EDITOR=${editor}\n`);
  }

  public async writeConfig(
    application: string,
    config: AbstractConfig,
  ): Promise<void> {
    const file = this.configPath(application);
    console.log(chalk.green('path'), file);
    if (
      existsSync(file) &&
      (await this.promptService.confirm('Overwrite existing config file?')) ===
        false
    ) {
      return;
    }
    writeFileSync(file, encode(config));
    console.log(chalk.inverse(chalk.green(`${file} written`)));
  }

  private packageWriteVersion(project: string, version: string): void {
    const packageFile = join(cwd(), this.projects[project].root, PACKAGE_FILE);
    const data = this.workspace.PACKAGES.get(project);
    data.version = version;
    this.workspace.PACKAGES.set(project, data);
    writeFileSync(packageFile, JSON.stringify(data, undefined, '  '));
  }
}
