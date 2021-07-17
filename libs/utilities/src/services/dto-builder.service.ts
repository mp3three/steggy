import {
  BaseInputComponentDTO,
  DataType,
  LABEL_VALUE,
  SelectComponentDTO,
  SurveyComponent,
} from '@formio/contracts/components';
import { LIB_UTILS } from '@formio/contracts/constants';
import { FormDTO } from '@formio/contracts/formio-sdk';
import { Injectable, NotImplementedException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import {
  ClassDeclaration,
  factory,
  PropertyDeclaration,
  StringLiteral,
  SyntaxKind,
  TypeNode,
  TypeReferenceNode,
  UnionTypeNode,
} from 'typescript';

import { InjectLogger } from '../decorators';
import { caseCorrect } from '../includes';
import { AnnotationBuilderService } from './annotation-builder.service';

/**
 * To anyone wanting to make additions to this file, this site is your friend:
 * https://ts-ast-viewer.com/
 */
@Injectable()
export class DTOBuilderService {
  // #region Object Properties

  /**
   * ['class-validator',['IsArray','IsEnum']]
   */
  private importTokens = new Map<string, string[]>();

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(DTOBuilderService, LIB_UTILS)
    private readonly logger: PinoLogger,
    private readonly annotationBuilderService: AnnotationBuilderService,
  ) {}

  // #endregion Constructors

  // #region Private Accessors

  private get boolean() {
    return factory.createKeywordTypeNode(SyntaxKind.BooleanKeyword);
  }

  private get export() {
    return factory.createModifier(SyntaxKind.ExportKeyword);
  }

  private get number() {
    return factory.createKeywordTypeNode(SyntaxKind.NumberKeyword);
  }

  private get string() {
    return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
  }

  private get unknown() {
    return factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword);
  }

  // #endregion Private Accessors

  // #region Public Methods

  public async build(form: FormDTO): Promise<ClassDeclaration[]> {
    this.annotationBuilderService.reset();
    const output = [
      this.extendSubmissionDTO(form),
      await this.buildDataDefinition(form),
    ];
    // Don't worry about it
    return output.reverse();
  }

  /**
   * ## Example
   *
   * ```
   * export class UserDTO extends SubmissionDTO<UserDataDTO> {}
   * ```
   */
  public extendSubmissionDTO(form: FormDTO): ClassDeclaration {
    const dataObject = `${caseCorrect(form.name)}DataDTO`;
    return factory.createClassDeclaration(
      undefined,
      [],
      // [this.export],
      factory.createIdentifier(`${caseCorrect(form.name)}DTO`),
      undefined,
      [
        factory.createHeritageClause(SyntaxKind.ExtendsKeyword, [
          factory.createExpressionWithTypeArguments(
            factory.createIdentifier('SubmissionDTO'),
            [
              factory.createTypeReferenceNode(
                factory.createIdentifier(dataObject),
              ),
            ],
          ),
        ]),
      ],
      [
        // factory.createPropertyDeclaration(
        //   [
        //     this.annotationBuilderService.annotation(
        //       TransformerAnnotations.Type,
        //       LIB_TRANSFORMER,
        //       [this.arrowTo(dataObject)],
        //     ),
        //   ],
        //   [factory.createModifier(SyntaxKind.PublicKeyword)],
        //   factory.createIdentifier('data'),
        //   undefined,
        //   factory.createTypeReferenceNode(factory.createIdentifier(dataObject)),
        // ),
      ],
    );
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected async buildDataDefinition(
    form: FormDTO,
  ): Promise<ClassDeclaration> {
    return factory.createClassDeclaration(
      undefined,
      [],
      // [this.export],
      factory.createIdentifier(`${caseCorrect(form.name)}DataDTO`),
      undefined,
      [
        // factory.createHeritageClause(SyntaxKind.ExtendsKeyword, [
        //   factory.createExpressionWithTypeArguments(
        //     factory.createIdentifier('CanFake'),
        //     undefined,
        //   ),
        // ]),
      ],
      await Promise.all(
        form.components.map(async (component) => {
          return await this.buildFromComponent(
            component as BaseInputComponentDTO,
          );
        }),
      ),
    );
  }

  protected async buildFromComponent(
    component: BaseInputComponentDTO,
  ): Promise<PropertyDeclaration> {
    // These have children
    // if (!(component instanceof BaseInputComponentDTO)) {
    //   this.logger.fatal({ component }, 'NOT BASE COMPONENT');
    //   return;
    // }
    // A basic input, with annotations and a simple value
    throw new NotImplementedException(component);
    // return factory.createPropertyDeclaration(
    //   this.annotationBuilderService.build(component),
    //   [factory.createModifier(SyntaxKind.PublicKeyword)],
    //   factory.createIdentifier(component.key),
    //   component.required || component.validate?.required
    //     ? undefined
    //     : factory.createToken(SyntaxKind.QuestionToken),
    //   this.buildSimpleTypeNode(component),
    // );
  }

  /**
   * Anything that can be expressed with normal type symbols
   *
   * Does not require building classes
   */
  protected buildSimpleTypeNode(component: BaseInputComponentDTO): TypeNode {
    let type: TypeNode;

    switch (component.dataType) {
      case DataType.number:
        type = this.number;
        break;
      case DataType.string:
        type = this.string;
        break;
      case DataType.object:
        // TODO: Can this be improved?
        type = this.record(this.string, this.unknown);
        break;
      case DataType.boolean:
        type = this.boolean;
        break;
      case DataType.auto:
      default:
        type = this.string;
        break;
    }

    // Handling the "value" property
    // Survey
    if (component instanceof SurveyComponent) {
      type = this.record(
        this.stringUnion(component.questions),
        this.stringUnion(component.values),
      );
    }
    if (component instanceof SelectComponentDTO) {
      type = this.stringUnion(
        component.data.values,
        component.valueProperty || 'value',
      );
    }

    // key: value => key: value[]
    if (component.storeas === 'array' || component.multiple) {
      type = factory.createArrayTypeNode(type);
    }

    return type;
  }

  /**
   * Record<type, values>
   */
  protected record(type: TypeNode, values: TypeNode): TypeReferenceNode {
    return factory.createTypeReferenceNode(factory.createIdentifier('Record'), [
      type,
      values,
    ]);
  }

  /**
   * ['a',{key:'B'}] => 'a' | 'B'
   */
  protected stringUnion<T extends LABEL_VALUE | string | StringLiteral>(
    items: T[],
    key?: string,
  ): UnionTypeNode {
    // item[0] | item[0] | item[0]
    return factory.createUnionTypeNode(
      items.map((index) => {
        if (key !== null) {
          // TODO: Is 'value' the correct default, or
          index = index[key || 'value'];
        }
        if (typeof index === 'string') {
          index = factory.createStringLiteral(index) as T;
        }
        return factory.createLiteralTypeNode(index as StringLiteral);
      }),
    );
  }

  // #endregion Protected Methods

  // #region Private Methods

  private arrowTo(identifier: string) {
    return factory.createArrowFunction(
      undefined,
      undefined,
      [],
      undefined,
      factory.createToken(SyntaxKind.EqualsGreaterThanToken),
      factory.createIdentifier(identifier),
    );
  }

  // #endregion Private Methods
}
