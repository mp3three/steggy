import { Inject, Injectable } from '@nestjs/common';
import { is } from '@text-based/utilities';
import JSON from 'comment-json';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { dirname, join } from 'path';
import { cwd } from 'process';

import { LIB_UTILS } from '../config';
import {
  ACTIVE_APPLICATION,
  GenericVersionDTO,
  METADATA_FILE,
  NX_METADATA_FILE,
  NX_WORKSPACE_FILE,
  NXMetadata,
  NXProjectDTO,
  NXProjectTypes,
  NXWorkspaceDTO,
  PACKAGE_FILE,
  PackageJsonDTO,
  RepoMetadataDTO,
} from '../contracts';
import { AutoLogService } from './auto-log.service';

/**
 * The workspace file is def not getting out into any builds, seems like a reasonably unique name
 */
const isDevelopment = existsSync(join(cwd(), 'text-based.code-workspace'));

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
   * metadata.json
   */
  public METADATA = new Map<string, RepoMetadataDTO>();
  public NX_METADATA: NXMetadata;
  /**
   * package.json
   */
  public PACKAGES = new Map<string, PackageJsonDTO>();

  public ROOT_PACKAGE: PackageJsonDTO;

  /**
   * NX workspaces
   */
  public workspace: NXWorkspaceDTO;

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
    this.loadNX();
    this.loadPackages();
    this.loadMetadata();
  }

  public isApplication(project: string): boolean {
    return this.workspace.projects[project].projectType === 'application';
  }

  public isProject(project: string): boolean {
    return !is.undefined(this.workspace.projects[project]);
  }

  public list(type: NXProjectTypes): string[] {
    const { projects } = this.workspace;
    return Object.keys(projects).filter(
      item => projects[item].projectType === type,
    );
  }

  public path(project: string, type: 'package' | 'metadata'): string {
    return isDevelopment
      ? join(
          cwd(),
          String(this.workspace.projects[project].root),
          type === 'package' ? PACKAGE_FILE : METADATA_FILE,
        )
      : join(
          __dirname,
          'assets',
          project,
          type === 'package' ? PACKAGE_FILE : METADATA_FILE,
        );
  }

  public setPackageVersion(project: string, version: string): string {
    const packageJson = this.PACKAGES.get(project);
    packageJson.version = version;
    const packageFile = this.path(project, 'package');
    this.writeJson(packageFile, packageJson);
    return version;
  }

  public updateRootPackage(): void {
    this.writeJson(PACKAGE_FILE, this.ROOT_PACKAGE);
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

  public writeJson(path: string, data: unknown): void {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(data, undefined, '  ') + `\n`);
  }

  protected onModuleInit(): void {
    this.initMetadata();
  }

  private loadMetadata(): void {
    const root = join(isDevelopment ? cwd() : __dirname, PACKAGE_FILE);
    this.ROOT_PACKAGE = existsSync(root)
      ? (JSON.parse(
          readFileSync(
            join(isDevelopment ? cwd() : __dirname, PACKAGE_FILE),
            'utf-8',
          ),
        ) as unknown as PackageJsonDTO)
      : {
          description: 'unknown',
          displayName: 'unknown',
          name: 'unknown',
          version: '0.0.0',
        };
    const { projects } = this.workspace;
    this.logger.info(`Loading project metadata`);
    Object.keys(projects).forEach(key => {
      const path = this.path(key, 'metadata');
      if (!existsSync(path)) {
        return;
      }
      // this.logg
      const data = JSON.parse(readFileSync(path, 'utf-8'));
      this.logger.debug(` - {${key}}`);
      this.METADATA.set(key, data as unknown as RepoMetadataDTO);
    });
  }

  private loadNX(): void {
    this.NX_METADATA = JSON.parse(
      readFileSync(
        isDevelopment
          ? join(cwd(), NX_METADATA_FILE)
          : join(__dirname, 'assets', NX_METADATA_FILE),
        'utf-8',
      ),
    ) as unknown as NXMetadata;
    this.workspace = JSON.parse(
      readFileSync(
        isDevelopment
          ? join(cwd(), NX_WORKSPACE_FILE)
          : join(__dirname, 'assets', NX_WORKSPACE_FILE),
        'utf-8',
      ),
    ) as unknown as NXWorkspaceDTO;
    const { projects } = this.workspace;
    this.logger.info(`Loading workspace`);
    Object.keys(projects).forEach(key => {
      // Shh... this is actually a string before this point
      const basePath = isDevelopment
        ? String(projects[key])
        : join(`assets`, key);
      const path = join(basePath, 'project.json');
      if (!existsSync(path)) {
        return;
      }
      this.logger.debug(` - {${key}}`);
      projects[key] = JSON.parse(
        readFileSync(path, 'utf-8'),
      ) as unknown as NXProjectDTO;
    });
  }

  private loadPackages(): void {
    this.logger.info(`Loading package info`);
    Object.keys(this.workspace.projects).forEach(project => {
      const packageFile = this.path(project, 'package');
      const exists = existsSync(packageFile);
      if (!exists) {
        return;
      }
      const data = JSON.parse(
        readFileSync(packageFile, 'utf-8'),
      ) as unknown as PackageJsonDTO;
      this.logger.debug(` - [${project}] {${data.version}}`);
      this.PACKAGES.set(project, data);
    });
  }

  private withExtensions(path: string): string[] {
    return [path, `${path}.json`, `${path}.ini`, `${path}.yaml`, `${path}.yml`];
  }
}
