import { FormioJSValidationConfig } from '@automagical/contracts';
import { LIB_SERVER } from '@automagical/contracts/constants';
import { FormDTO, SubmissionDTO } from '@automagical/contracts/formio-sdk';
import { APIRequest, JWT_HEADER } from '@automagical/contracts/server';
import type { FormValidator } from '@automagical/contracts/validation';
import { SubmissionDocument } from '@automagical/persistence/mongo';
import { InjectLogger, InjectMongo, Trace } from '@automagical/utilities';
import { Formio } from '@automagical/wrapper';
import { BadRequestException, Inject, Injectable, Scope } from '@nestjs/common';
import { unset } from 'lodash';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

// Working with a lib without type information, stick to known working code to save time
/* eslint-disable unicorn/no-null */
/**
 * Validation stack based off formio.js. Upgraded logic from the 8.x branch
 *
 * This code is abstracted out to provide a standard validation interface for SubmissionValidatorPipe,
 * cleanly tie type information to a library that does not provide any, and to eventually allow conversion to core renderer validation
 */
@Injectable({ scope: Scope.REQUEST })
export class FormioJSValidationService implements FormValidator {
  // #region Constructors

  constructor(
    @InjectLogger(FormioJSValidationService, LIB_SERVER)
    private readonly logger: PinoLogger,
    @Inject(APIRequest)
    private readonly request: APIRequest,
    @InjectMongo(SubmissionDTO)
    private readonly submissionModel: Model<SubmissionDocument>,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  /**
   * Built from
   * https://github.com/formio/api/blob/master/src/entities/Submission/Validator.ts
   *
   * Formiojs requires direct access to the submissionModel to work right. Future updates should resolve this with a PR to formiojs
   *
   * The root reason is because formiojs assembles a mongo query to do a findOne with. It should instead have a flag output query control objects so repo CRUD interfaces can be used
   */
  @Trace()
  public async validate(
    inputForm: FormDTO,
    submission: SubmissionDTO,
  ): Promise<SubmissionDTO> {
    let unsetsEnabled = false;
    const unsets = new Set<{ data: unknown; key: string }>();
    const form = await Formio.createForm(
      {
        ...inputForm,
        schema: '1.0',
      },
      {
        hooks: {
          setDataValue(value, key, data) {
            if (!unsetsEnabled) {
              return value;
            }
            // Check if this component is not persistent.
            // `this` refers to the formio form in this case
            if (
              !this.component.persistent ||
              this.component.persistent === 'client-only' ||
              (this.component.clearOnHide !== false &&
                (!this.conditionallyVisible() || !this.parentVisible))
            ) {
              unsets.add({ data, key });
            }
            return value;
          },
        },
      },
    );
    const { headers } = this.request.res.locals;

    // Set the validation config.
    form.validator.config = {
      db: this.submissionModel,
      form: inputForm,
      submission: {
        ...submission,
        data: {
          ...submission.data,
        },
      },
      token: headers.get(JWT_HEADER),
    } as FormioJSValidationConfig;

    // Set the submission data
    form.data = submission;

    // Perform calculations and conditions.
    form.calculateValue();
    form.checkConditions();

    // Reset the data
    form.data = {};

    // Set the value to the submission.
    unsetsEnabled = true;
    form.setValue(submission, {
      sanitize: true,
    });

    // Check the validity of the form.
    const valid = await form.checkAsyncValidity(null, true);
    if (valid) {
      // Clear the non-persistent fields.
      unsets.forEach(({ data, key }) => unset(data, key));
      // submission.data = form.data;
      return submission;
    }

    const details: string[] = [];
    form.errors.forEach((error) =>
      error.messages.forEach((message: string) => details.push(message)),
    );

    throw new BadRequestException({ details });
  }

  // #endregion Public Methods
}
