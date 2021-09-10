import { PACKAGE_FILE } from '@automagical/contracts';
import { AutomagicalConfig } from '@automagical/contracts/config';
import { NXAffected } from '@automagical/contracts/terminal';
import { filterUnique } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { eachSeries } from 'async';
import chalk from 'chalk';
import JSON from 'comment-json';
import execa from 'execa';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { encode } from 'ini';
import inquirer from 'inquirer';
import { homedir } from 'os';
import { join } from 'path';
import { cwd } from 'process';
import { inc } from 'semver';

import { TypePromptService } from './type-prompt.service';
import { WorkspaceService } from './workspace.service';

/**
 * Class for working with the host operating system,
 * and performing operations against the workspace
 */
@Injectable()
export class SystemService {
  constructor(
    private readonly prompt: TypePromptService,
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
    return filterUnique(stdout.split(`\n`).filter((item) => item.length > 0));
  }

  public isLibrary(project: string): boolean {
    return this.projects[project].projectType === 'library';
  }

  public async writeConfig(
    application: string,
    config: AutomagicalConfig,
  ): Promise<void> {
    const file = this.configPath(application);
    console.log(chalk.green('path'), file);
    if (
      existsSync(file) &&
      (await this.prompt.confirm('Overwrite existing config file?')) === false
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
