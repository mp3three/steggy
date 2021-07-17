import {
  ActionCRUD,
  CrudOptions,
  FormCRUD,
  ProjectSupport,
  RoleCRUD,
} from '@formio/contracts';
import { LIB_SERVER } from '@formio/contracts/constants';
import {
  ActionDTO,
  FormDTO,
  ProjectDTO,
  RoleDTO,
} from '@formio/contracts/formio-sdk';
import { ProjectExportDetailsDTO } from '@formio/contracts/server';
import { InjectLogger, Trace } from '@formio/utilities';
import { Inject, NotImplementedException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { FormSupportService } from './form-support.service';

export class ProjectSupportService implements ProjectSupport {
  // #region Constructors

  constructor(
    @InjectLogger(ProjectSupportService, LIB_SERVER)
    private readonly logger: PinoLogger,
    @Inject(RoleCRUD) private readonly roleCrud: RoleCRUD,
    @Inject(FormCRUD) private readonly formCrud: FormCRUD,
    @Inject(ActionCRUD) private readonly actionCrud: ActionCRUD,
    private readonly formSupportService: FormSupportService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async access(options: CrudOptions): Promise<unknown> {
    throw new NotImplementedException();
  }

  @Trace()
  public async adminCreate(
    data: Record<string, unknown>,
    options: CrudOptions,
  ): Promise<unknown> {
    throw new NotImplementedException();
  }

  @Trace()
  public async adminLogin(
    data: Record<string, unknown>,
    options: CrudOptions,
  ): Promise<unknown> {
    throw new NotImplementedException();
  }

  @Trace()
  public async available(
    data: Record<string, unknown>,
    options: CrudOptions,
  ): Promise<unknown> {
    throw new NotImplementedException();
  }

  @Trace()
  public async deploy(
    data: Record<string, unknown>,
    options: CrudOptions,
  ): Promise<unknown> {
    throw new NotImplementedException();
  }

  @Trace()
  public async getCurrentTag(
    project: ProjectDTO,
    options: CrudOptions,
  ): Promise<unknown> {
    throw new NotImplementedException();
  }

  @Trace()
  public async import(
    data: Record<string, unknown>,
    options: CrudOptions,
  ): Promise<unknown> {
    throw new NotImplementedException();
  }

  @Trace()
  public async portalCheck(
    data: Record<string, unknown>,
    options: CrudOptions,
  ): Promise<unknown> {
    throw new NotImplementedException();
  }

  @Trace()
  public async report(
    data: Record<string, unknown>,
    options: CrudOptions,
  ): Promise<unknown> {
    throw new NotImplementedException();
  }

  @Trace()
  public async sqlconnector(
    project: ProjectDTO,
    options: CrudOptions,
  ): Promise<unknown> {
    throw new NotImplementedException();
  }

  @Trace()
  public async swagger(
    project: ProjectDTO,
    options: CrudOptions,
  ): Promise<unknown> {
    throw new NotImplementedException();
  }

  @Trace()
  public async tempAuthToken(
    project: ProjectDTO,
    options: CrudOptions,
  ): Promise<unknown> {
    throw new NotImplementedException();
  }

  @Trace()
  public async upgradeProject(
    data: Record<string, unknown>,
    options: CrudOptions,
  ): Promise<unknown> {
    throw new NotImplementedException();
  }

  public async export(project: ProjectDTO): Promise<ProjectExportDetailsDTO> {
    const forms = await this.formCrud.findMany({}, { project });
    const exportForms = await this.exportForms(forms);
    const details: ProjectExportDetailsDTO = {
      access: project.access,
      actions: await this.exportActions([]),
      name: project.name,
      roles: await this.exportRoles(project),
      title: project.title,
      version: 'unknown',
      ...exportForms,
    };
    return details;
  }

  // #endregion Public Methods

  // #region Private Methods

  @Trace()
  private async exportActions(
    forms: FormDTO[],
  ): Promise<Record<string, ActionDTO>> {
    const out: Record<string, ActionDTO> = {};
    const actions = await this.actionCrud.findMany({}, {});
    return out;
  }

  @Trace()
  private async exportForms(
    forms: FormDTO[],
  ): Promise<Record<'forms' | 'resources', Record<string, FormDTO>>> {
    return {
      forms: Object.fromEntries(
        forms
          .filter((form) => form.type === 'form')
          .map((form) => [
            form.machineName,
            this.formSupportService.exportForm(form),
          ]),
      ),
      resources: Object.fromEntries(
        forms
          .filter((form) => form.type === 'resource')
          // There's no constructive abstraction for this right now
          // eslint-disable-next-line radar/no-identical-functions
          .map((form) => [
            form.machineName,
            this.formSupportService.exportForm(form),
          ]),
      ),
    };
  }

  @Trace()
  private async exportRoles(
    project: ProjectDTO,
  ): Promise<Record<string, RoleDTO>> {
    return {};
  }

  // #endregion Private Methods
}
