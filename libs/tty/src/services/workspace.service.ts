import {
  AutomagicalMetadataDTO,
  METADATA_FILE,
  PACKAGE_FILE,
  PackageJsonDTO,
  Trace,
} from '@automagical/utilities';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import JSON from 'comment-json';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { cwd } from 'process';

import {
  NX_METADATA_FILE,
  NX_WORKSPACE_FILE,
  NXMetadata,
  NXProjectTypes,
  NXWorkspaceDTO,
} from '../contracts/dto';

@Injectable()
export class WorkspaceService {
  /**
   * automagical.json
   */
  public METADATA = new Map<string, AutomagicalMetadataDTO>();
  public NX_METADATA: NXMetadata = JSON.parse(
    readFileSync(NX_METADATA_FILE, 'utf-8'),
  );
  /**
   * package.json
   */
  public PACKAGES = new Map<string, PackageJsonDTO>();

  public ROOT_PACKAGE: PackageJsonDTO = JSON.parse(
    readFileSync(PACKAGE_FILE, 'utf-8'),
  );

  /**
   * NX workspaces
   */
  public workspace: NXWorkspaceDTO;

  @Trace()
  public list(type: NXProjectTypes): string[] {
    const { projects } = this.workspace;
    return Object.keys(projects).filter(
      (item) => projects[item].projectType === type,
    );
  }
  @Trace()
  public setPackageVersion(project: string, version: string): string {
    const packageJson = this.PACKAGES.get(project);
    packageJson.version = version;
    const packageFile = this.path(project, 'package');
    this.writeJson(packageFile, packageJson);
    return version;
  }

  @Trace()
  public writeJson(path: string, data: unknown): void {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(data, undefined, '  ') + `\n`);
  }

  public isApplication(project: string): boolean {
    return this.workspace.projects[project].projectType === 'application';
  }

  public path(project: string, type: 'package' | 'metadata'): string {
    return join(
      cwd(),
      this.workspace.projects[project].root,
      type === 'package' ? PACKAGE_FILE : METADATA_FILE,
    );
  }

  public updateRootPackage(): void {
    this.writeJson(PACKAGE_FILE, this.ROOT_PACKAGE);
  }
  @Trace()
  protected onModuleInit(): void {
    this.loadNX();
    this.loadPackages();
    this.loadMetadata();
  }

  @Trace()
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

  @Trace()
  private loadNX(): void {
    this.workspace = JSON.parse(readFileSync(NX_WORKSPACE_FILE, 'utf-8'));
    const { projects } = this.workspace;
    Object.keys(projects).forEach((key) => {
      // Shh... this is actually a string before this point
      const basePath = String(projects[key]);
      projects[key] = JSON.parse(
        readFileSync(join(basePath, 'project.json'), 'utf-8'),
      );
    });
  }

  @Trace()
  private loadPackages(): void {
    Object.keys(this.workspace.projects).forEach((project) => {
      const packageFile = this.path(project, 'package');
      const exists = existsSync(packageFile);
      if (!exists) {
        throw new InternalServerErrorException(
          `Missing package file: ${packageFile}`,
        );
      }
      const data = JSON.parse(readFileSync(packageFile, 'utf-8'));
      this.PACKAGES.set(project, data);
    });
  }
}
