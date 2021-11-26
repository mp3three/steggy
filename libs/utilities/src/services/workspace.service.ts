import { Injectable } from '@nestjs/common';
import JSON from 'comment-json';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { cwd } from 'process';

import {
  AutomagicalMetadataDTO,
  METADATA_FILE,
  NX_METADATA_FILE,
  NX_WORKSPACE_FILE,
  NXMetadata,
  NXProjectTypes,
  NXWorkspaceDTO,
  PACKAGE_FILE,
  PackageJsonDTO,
} from '../contracts';

/**
 * The workspace file is def not getting out into any builds, seems like a reasonably unique name
 */
const isDevelopment = existsSync(join(cwd(), 'automagical.code-workspace'));

@Injectable()
export class WorkspaceService {
  public IS_DEVELOPMENT = isDevelopment;
  /**
   * metadata.json
   */
  public METADATA = new Map<string, AutomagicalMetadataDTO>();
  public NX_METADATA: NXMetadata;
  /**
   * package.json
   */
  public PACKAGES = new Map<string, PackageJsonDTO>();

  public ROOT_PACKAGE: PackageJsonDTO = JSON.parse(
    readFileSync(
      join(isDevelopment ? cwd() : __dirname, PACKAGE_FILE),
      'utf-8',
    ),
  );

  /**
   * NX workspaces
   */
  public workspace: NXWorkspaceDTO;

  private loaded = false;

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
    return typeof this.workspace.projects[project] !== 'undefined';
  }

  public list(type: NXProjectTypes): string[] {
    const { projects } = this.workspace;
    return Object.keys(projects).filter(
      (item) => projects[item].projectType === type,
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

  public version(): { rootVersion: string; versions: Record<string, string> } {
    const versions: Record<string, string> = {};
    this.PACKAGES.forEach(({ version }, name) => (versions[name] = version));
    return {
      rootVersion: this.ROOT_PACKAGE.version,
      versions,
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
    const { projects } = this.workspace;
    Object.keys(projects).forEach((key) => {
      const path = this.path(key, 'metadata');
      if (!existsSync(path)) {
        return;
      }
      const data = JSON.parse(readFileSync(path, 'utf-8'));
      this.METADATA.set(key, data);
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
    );
    this.workspace = JSON.parse(
      readFileSync(
        isDevelopment
          ? join(cwd(), NX_WORKSPACE_FILE)
          : join(__dirname, 'assets', NX_WORKSPACE_FILE),
        'utf-8',
      ),
    );
    const { projects } = this.workspace;
    Object.keys(projects).forEach((key) => {
      // Shh... this is actually a string before this point
      const basePath = isDevelopment
        ? String(projects[key])
        : join(`assets`, key);
      const path = join(basePath, 'project.json');
      if (!existsSync(path)) {
        return;
      }
      projects[key] = JSON.parse(readFileSync(path, 'utf-8'));
    });
  }

  private loadPackages(): void {
    Object.keys(this.workspace.projects).forEach((project) => {
      const packageFile = this.path(project, 'package');
      const exists = existsSync(packageFile);
      if (!exists) {
        return;
      }
      const data = JSON.parse(readFileSync(packageFile, 'utf-8'));
      this.PACKAGES.set(project, data);
    });
  }
}