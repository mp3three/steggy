import { Inject, Injectable } from '@nestjs/common';
import { is } from '@steggy/utilities';
import JSON from 'comment-json';
import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { cwd } from 'process';

import { LIB_UTILS } from '../config';
import {
  ACTIVE_APPLICATION,
  GenericVersionDTO,
  PACKAGE_FILE,
  PackageJsonDTO,
} from '../contracts';
import { LibraryModule } from '../decorators';
import { AutoLogService } from './auto-log.service';

/**
 * The workspace file is def not getting out into any builds, seems like a reasonably unique name
 */
const isDevelopment = existsSync(join(cwd(), 'steggy.code-workspace'));

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly logger: AutoLogService,
    @Inject(ACTIVE_APPLICATION) private readonly application: symbol,
  ) {
    logger.setContext(LIB_UTILS, WorkspaceService);
  }
  public IS_DEVELOPMENT = isDevelopment;
  /**
   * package.json
   */
  public PACKAGES = new Map<string, PackageJsonDTO>();
  public ROOT_PACKAGE: PackageJsonDTO;

  private isWindows = process.platform === 'win32';
  private loaded = false;

  /**
   * Find files at:
   * - /etc/{name}/config
   * - /etc/{name}/config.json
   * - /etc/{name}/config.ini
   * - /etc/{name}/config.yaml
   * - /etc/{name}rc
   * - /etc/{name}rc.json
   * - /etc/{name}rc.ini
   * - /etc/{name}rc.yaml
   * - cwd()/.{name}rc
   * - Recursively to system root
   * - cwd()/../.{name}rc
   * - ~/.config/{name}
   * - ~/.config/{name}.json
   * - ~/.config/{name}.ini
   * - ~/.config/{name}.yaml
   * - ~/.config/{name}/config
   * - ~/.config/{name}/config.json
   * - ~/.config/{name}/config.ini
   * - ~/.config/{name}/config.yaml
   */
  public get configFilePaths(): string[] {
    const out: string[] = [];
    const name = this.application.description;
    if (!this.isWindows) {
      out.push(
        ...this.withExtensions(join(`/etc`, name, 'config')),
        ...this.withExtensions(join(`/etc`, `${name}rc`)),
      );
    }
    let current = cwd();
    let next: string;
    while (!is.empty(current)) {
      out.push(join(current, `.${name}rc`));
      next = join(current, '..');
      if (next === current) {
        break;
      }
      current = next;
    }
    out.push(
      ...this.withExtensions(join(homedir(), '.config', name)),
      ...this.withExtensions(join(homedir(), '.config', name, 'config')),
    );
    return out;
  }

  public initMetadata(): void {
    if (this.loaded) {
      return;
    }
    this.loaded = true;
    this.loadPackages();
  }

  public isApplication(project: string): boolean {
    return this.application.description === project;
  }

  public isProject(project: string): boolean {
    return this.application.description !== project;
  }

  public path(project: string): string {
    return isDevelopment
      ? join(
          cwd(),
          `${this.isApplication(project) ? 'apps' : 'libs'}/${project}`,
          PACKAGE_FILE,
        )
      : join(
          __dirname,
          'assets',
          project ?? this.application.description,
          PACKAGE_FILE,
        );
  }

  public version(): GenericVersionDTO {
    const versions: Record<string, string> = {};
    this.PACKAGES.forEach(({ version }, name) => (versions[name] = version));
    return {
      projects: versions,
      rootVersion: this.ROOT_PACKAGE.version,
      version: versions[this.application.description],
    };
  }

  protected onModuleInit(): void {
    this.initMetadata();
  }

  private loadPackages(): void {
    this.logger.info(`Loading package info`);
    LibraryModule.configs.forEach((meta, project) => {
      const packageFile = this.path(project);
      const exists = existsSync(packageFile);
      if (!exists) {
        return;
      }
      const data = JSON.parse(
        readFileSync(packageFile, 'utf8'),
      ) as unknown as PackageJsonDTO;
      this.logger.debug(` - [${project}] {${data.version}}`);
      this.PACKAGES.set(project, data);
    });
  }

  private withExtensions(path: string): string[] {
    return [path, `${path}.json`, `${path}.ini`, `${path}.yaml`, `${path}.yml`];
  }
}
