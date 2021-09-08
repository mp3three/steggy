import {
  AutomagicalMetadataDTO,
  METADATA_FILE,
  PACKAGE_FILE,
  PackageJsonDTO,
} from '@automagical/contracts';
import {
  NX_WORKSPACE_FILE,
  NXProjectTypes,
  NXWorkspaceDTO,
} from '@automagical/contracts/terminal';
import { Trace } from '@automagical/utilities';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { cwd } from 'process';

@Injectable()
export class WorkspaceService {
  // #region Object Properties

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

  // #endregion Object Properties

  // #region Public Methods

  @Trace()
  public list(type: NXProjectTypes): string[] {
    const { projects } = this.workspace;
    return Object.keys(projects).filter(
      (item) => projects[item].projectType === type,
    );
  }

  public path(project: string, type: 'package' | 'metadata'): string {
    return join(
      cwd(),
      this.workspace.projects[project].root,
      type === 'package' ? PACKAGE_FILE : METADATA_FILE,
    );
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Trace()
  protected onModuleInit(): void {
    this.loadNX();
    this.loadPackages();
    this.loadMetadata();
  }

  // #endregion Protected Methods

  // #region Private Methods

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

  // #endregion Private Methods
}
