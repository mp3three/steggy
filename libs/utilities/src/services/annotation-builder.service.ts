import { BaseInputComponentDTO, DataType } from '@formio/contracts/components';
import { LIB_UTILS } from '@formio/contracts/constants';
import {
  LIB_SWAGGER_IMPORT,
  LIB_VALIDATOR_IMPORT,
  SwaggerAnnotations,
  ValidatorAnnotations,
} from '@formio/contracts/validation';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import {
  Decorator,
  Expression,
  factory,
  ObjectLiteralExpression,
  PropertyAssignment,
} from 'typescript';

import { InjectLogger } from '../decorators';

@Injectable()
export class AnnotationBuilderService {
  // #region Static Properties

  private static readonly LIB_VALIDATOR = '@formio/wrapper';

  // #endregion Static Properties

  // #region Object Properties

  private imports: Map<string, string[]>;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(AnnotationBuilderService, LIB_UTILS)
    private readonly logger: PinoLogger,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public annotation(
    annotation: string,
    library: string,
    body: Expression[] = [],
  ): Decorator {
    const importList: string[] = this.imports.get(library) || [];
    if (!importList.includes(annotation)) {
      importList.push(annotation);
      this.imports.set(library, importList);
    }
    return factory.createDecorator(
      factory.createCallExpression(
        factory.createIdentifier(annotation),
        undefined,
        body,
      ),
    );
  }

  public build(component: BaseInputComponentDTO): Decorator[] {
    this.imports = new Map();
    return this.validatorAnnotations(component);
  }

  public reset(): void {
    this.imports = new Map();
  }

  // #endregion Public Methods

  // #region Private Methods

  private swaggerAnnotations(component: BaseInputComponentDTO) {
    const out = [];
    out.push(
      this.annotation(SwaggerAnnotations.ApiProperty, LIB_SWAGGER_IMPORT, [
        this.validatorCallArgs(component),
      ]),
    );
    return out;
  }

  private validatorAnnotations(component: BaseInputComponentDTO) {
    const out = [];
    if (component.required || component.validate?.required) {
      out.push(
        this.annotation(ValidatorAnnotations.IsDefined, LIB_VALIDATOR_IMPORT, [
          this.validatorCallArgs(component),
        ]),
      );
    } else {
      out.push(
        this.annotation(ValidatorAnnotations.IsOptional, LIB_VALIDATOR_IMPORT, [
          this.validatorCallArgs(component),
        ]),
      );
    }
    switch (component.dataType) {
      case DataType.number:
        out.push(
          this.annotation(ValidatorAnnotations.IsNumber, LIB_VALIDATOR_IMPORT, [
            this.validatorCallArgs(component),
          ]),
        );
        break;
      case DataType.string:
        out.push(
          this.annotation(ValidatorAnnotations.IsString, LIB_VALIDATOR_IMPORT, [
            this.validatorCallArgs(component),
          ]),
        );
        break;
      case DataType.boolean:
        out.push(
          this.annotation(
            ValidatorAnnotations.IsBoolean,
            LIB_VALIDATOR_IMPORT,
            [this.validatorCallArgs(component)],
          ),
        );
        break;
    }
    if (component.storeas === 'array' || component.multiple) {
      out.push(
        this.annotation(ValidatorAnnotations.IsArray, LIB_VALIDATOR_IMPORT),
      );
    }
    if (component.validate?.maxLength) {
      out.push(
        this.annotation(ValidatorAnnotations.MaxLength, LIB_VALIDATOR_IMPORT, [
          factory.createNumericLiteral(component.validate.maxLength),
        ]),
      );
    }
    if (component.validate?.minLength) {
      out.push(
        this.annotation(ValidatorAnnotations.MinLength, LIB_VALIDATOR_IMPORT, [
          factory.createNumericLiteral(component.validate.minLength),
        ]),
      );
    }
    if (component.validate?.pattern) {
      out.push(
        this.annotation(ValidatorAnnotations.Matches, LIB_VALIDATOR_IMPORT, [
          factory.createNewExpression(
            factory.createIdentifier('RegExp'),
            undefined,
            [factory.createStringLiteral(component.validate.pattern)],
          ),
        ]),
      );
    }
    if (component.validate?.minWords) {
      this.logger.warn(`@MinWords not yet implemented`);
    }
    if (component.validate?.maxWords) {
      this.logger.warn(`@MaxWords not yet implemented`);
    }
    return out;
  }

  private validatorCallArgs(
    component: BaseInputComponentDTO,
  ): ObjectLiteralExpression {
    const out: PropertyAssignment[] = [];

    if (component.storeas === 'array' || component.multiple) {
      out.push(
        factory.createPropertyAssignment(
          factory.createIdentifier('each'),
          factory.createTrue(),
        ),
      );
    }

    return factory.createObjectLiteralExpression(out, true);
  }

  // #endregion Private Methods
}
