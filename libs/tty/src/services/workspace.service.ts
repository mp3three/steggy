import {
  AutoLogService,
  AutomagicalMetadataDTO,
  METADATA_FILE,
  PACKAGE_FILE,
  PackageJsonDTO,
} from '@automagical/utilities';
import { Trace } from '@automagical/utilities';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { cwd } from 'process';

import {
  NX_WORKSPACE_FILE,
  NXProjectTypes,
  NXWorkspaceDTO,
} from '../contracts/dto';

@Injectable()
export class WorkspaceService {
  /**
   * automagical.json
   */
  public METADATA = new Map<string, AutomagicalMetadataDTO>();
  /**
   * package.json
   */
  public PACKAGES = new Map<string, PackageJsonDTO>();
  /**
   * NX workspaces
   */
  public workspace: NXWorkspaceDTO;

  public constructor(private readonly logger: AutoLogService) {}

  @Trace()
  public list(type: NXProjectTypes): string[] {
    const { projects } = this.workspace;
    return Object.keys(projects).filter(
      (item) => projects[item].projectType === type,
    );
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

  public setVersion(project: string, version: string): void {
    const packageJson = this.PACKAGES.get(project);
    this.logger.debug(
      {
        new: version,
        old: packageJson.version,
      },
      `Updated package version for {${packageJson.displayName}}`,
    );
    packageJson.version = version;
    const packageFile = this.path(project, 'package');
    writeFileSync(packageFile, JSON.stringify(packageJson));
  }

  @Trace()
  protected onModuleInit(): void {
    this.loadNX();
    this.loadPackages();
    this.loadMetadata();
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
    this.workspace = JSON.parse(readFileSync(NX_WORKSPACE_FILE, 'utf-8'));
    Object.keys(this.workspace.projects).forEach((key) => {
      this.workspace.projects[key] = JSON.parse(
        readFileSync(
          join(
            // After initial loading, this type is correct
            this.workspace.projects[key] as unknown as string,
            'project.json',
          ),
          'utf-8',
        ),
      );
    });
  }

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
