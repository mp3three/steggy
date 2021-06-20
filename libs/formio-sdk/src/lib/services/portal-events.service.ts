import { ActionCRUD, FormCRUD } from '@automagical/contracts';
import {
  CREATE_FORM,
  DELETE_FORM,
  DELETE_PROJECT,
  LIB_FORMIO_SDK,
} from '@automagical/contracts/constants';
import { FormDTO, ProjectDTO } from '@automagical/contracts/formio-sdk';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PinoLogger } from 'nestjs-pino';

/**
 * This class listens to various server events that get fired, and binds logic to them
 *
 * The intent is to non-invasively bind portal side-effects to routes
 */
@Injectable()
export class PortalEventsService {
  // #region Constructors

  constructor(
    @InjectLogger(PortalEventsService, LIB_FORMIO_SDK)
    private readonly logger: PinoLogger,
    @Inject(ActionCRUD)
    private readonly actionService: ActionCRUD,
    @Inject(FormCRUD)
    private readonly formService: FormCRUD,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // #endregion Constructors

  // #region Private Methods

  @OnEvent(DELETE_FORM)
  @Trace()
  private async onFormDelete(form: FormDTO) {
    const actions = await this.actionService.findMany({}, form);
    actions.forEach(async (action) => {
      await this.actionService.delete(action, form);
    });
    // TODO: Should they be cleaned up?
    this.logger.debug({ form }, `Left behind submissions during form cleanup`);
  }

  @OnEvent(DELETE_PROJECT)
  @Trace()
  /**
   * Whenever any project gets deleted, also delete any attached forms
   */
  private async onProjectDelete(project: ProjectDTO) {
    const forms = await this.formService.findMany({}, project);
    forms.forEach(async (form) => {
      await this.formService.delete(form, project);
      this.eventEmitter.emit(DELETE_FORM, form);
    });
  }

  // #endregion Private Methods
}

// @OnEvent(CREATE_PROJECT)
// @Trace()
// private async onProjectCreate(project: ProjectDTO) {
//   return;
// }
