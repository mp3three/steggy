import { ProjectDTO, PROJECT_TYPES } from '@automagical/contracts/formio-sdk';
import { Logger } from '@automagical/logger';
import { BadRequestException, Injectable } from '@nestjs/common';
import { iProjectDriver } from '../../typings/i-driver';

@Injectable()
export class ProjectService {
  // #region Object Properties

  private readonly logger = Logger(ProjectService);

  // #endregion Object Properties

  // #region Constructors

  constructor(private readonly driver: iProjectDriver) {}

  // #endregion Constructors

  // #region Public Methods

  /**
   * Verify minimum properties exist
   *
   * Ask driver to store data
   */
  public async createProject(
    project: Partial<ProjectDTO>,
  ): Promise<ProjectDTO> {
    if (!project.name) {
      throw new BadRequestException(`name is required`);
    }
    project.type = PROJECT_TYPES.project;
    project.title = project.title || project.name;
    project.settings = project.settings || {};
    project.settings.cors = project.settings.cors || '*';
    return this.driver.create(project);
  }

  // #endregion Public Methods
}
