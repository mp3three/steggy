import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import { PersonDTO, RoomDTO, RoomMetadataDTO } from '@steggy/controller-shared';
import { EntityManagerService } from '@steggy/home-assistant';
import { HassStateDTO } from '@steggy/home-assistant-shared';
import { is } from '@steggy/utilities';
import { set } from 'object-path';
import {
  addSyntheticLeadingComment,
  createPrinter,
  createSourceFile,
  EmitHint,
  Expression,
  factory,
  NewLineKind,
  NodeFlags,
  ObjectLiteralElementLike,
  ScriptKind,
  ScriptTarget,
  SyntaxKind,
} from 'typescript';

import { EXTRA_UI_TYPINGS } from '../../typings';
import { PersonService } from '../person.service';
import { RoomService } from '../room.service';
import { SecretsService } from '../secrets.service';
import { HACallTypeGenerator } from './ha-call-type-generator.service';

const printer = createPrinter({ newLine: NewLineKind.LineFeed });
const resultFile = createSourceFile(
  '',
  '',
  ScriptTarget.Latest,
  false,
  ScriptKind.TS,
);

/**
 * Generate typescript types automatically, combining database data with secrets and entity information
 */
@Injectable()
export class TypeGeneratorService {
  constructor(
    private readonly logger: AutoLogService,
    @Inject(forwardRef(() => RoomService))
    private readonly roomService: RoomService,
    @Inject(forwardRef(() => PersonService))
    private readonly personService: PersonService,
    private readonly secretsService: SecretsService,
    private readonly entityManager: EntityManagerService,
    private readonly callService: HACallTypeGenerator,
  ) {}

  public async assemble(): Promise<string> {
    return [
      this.buildTypesFromEntities(),
      EXTRA_UI_TYPINGS,
      `declare const logger: iLogger;`,
      await this.buildTypesFromMetadata(),
      this.buildTypesFromSecrets(),
      await this.callService.buildTypes(),
    ].join(`\n`);
  }

  private buildTypesFromEntities(): string {
    const home_assistant: Record<string, Record<string, HassStateDTO>> = {};
    this.entityManager.ENTITIES.forEach(entity =>
      set(home_assistant, entity.entity_id, entity),
    );
    // Do not pass the json as a type
    // All strings will need to be strictly whatever was passed, instead of "home" turning into string
    return `const home_assistant = ${JSON.stringify(
      home_assistant,
      undefined,
      '  ',
    )};`;
  }

  /**
   * Pull data from rooms and people, and assemble into a series of const declarations.
   * A single one will be formatted like this, with all of them being newline separated
   *
   * ```text
   * ? MULTILINE TSDOC: (Type) {friendlyName}
   * const {(room | person).name} = {
   * ? MULTILINE TSDOC: metadata.description
   *    [metadata.name]:metadata.value,
   * ? MULTILINE TSDOC: metadata.description
   *    [metadata.name]:metadata.value,
   * ? MULTILINE TSDOC: metadata.description
   *    [metadata.name]:metadata.value
   * }
   * ```
   */
  private async buildTypesFromMetadata(): Promise<string> {
    const exportTypes: string[] = [];
    const people = await this.personService.list({});
    const rooms = await this.roomService.list({});
    (
      [...people.map(i => ['Person', i]), ...rooms.map(i => ['Room', i])] as [
        string,
        PersonDTO | RoomDTO,
      ][]
    )
      .filter(([, { name }]) => !is.empty(name))
      .forEach(([type, item]) => {
        const { name, friendlyName, metadata } = item;
        const statement = addSyntheticLeadingComment(
          factory.createVariableStatement(
            [],
            factory.createVariableDeclarationList(
              [
                factory.createVariableDeclaration(
                  factory.createIdentifier(name),
                  undefined,
                  undefined,
                  factory.createObjectLiteralExpression(
                    metadata.map(data => this.createMetadataElement(data)),
                    true,
                  ),
                ),
              ],
              NodeFlags.Const | NodeFlags.ContextFlags,
            ),
          ),
          SyntaxKind.MultiLineCommentTrivia,
          `*\n * ## **${type}**: ${friendlyName}\n `,
          true,
        );
        exportTypes.push(
          printer.printNode(EmitHint.Unspecified, statement, resultFile),
        );
      });
    return exportTypes.join(`\n`);
  }

  /**
   * Easier to just write out the data here right now.
   * There isn't a way to provide comments on individual data properties, so top level is it
   */
  private buildTypesFromSecrets(): string {
    const { secrets } = this.secretsService.buildMetadata();
    const tsdoc = `/**\n${[
      `## Secrets`,
      ``,
      `Data that was provided via configuration when the controller started.`,
    ]
      .map(i => ` * ${i}`)
      .join(`\n`)}\n */\n`;
    return `${tsdoc}declare const secrets: ${JSON.stringify(
      secrets,
      undefined,
      '  ',
    )};`;
  }

  /**
   * { property: "value" }
   *  --------------^ Create the data that goes there.
   *
   * If there is a relevant description, prepend a tsdoc comment also
   */
  private createMetadataElement(
    data: RoomMetadataDTO,
  ): ObjectLiteralElementLike {
    let value: Expression;
    switch (data.type) {
      case 'string':
      case 'enum':
        value = factory.createStringLiteral((data.value as string) || '');
        break;
      case 'boolean':
        value = data.value ? factory.createTrue() : factory.createFalse();
        break;
      case 'number':
        value = factory.createNumericLiteral(String(data.value));
        break;
      case 'date':
        value = factory.createNewExpression(
          factory.createIdentifier('Date'),
          undefined,
          [
            factory.createStringLiteral(
              is.date(data.value)
                ? data.value.toISOString()
                : (data.value as string) || '',
            ),
          ],
        );
        break;
      default:
        return undefined;
    }
    const property = factory.createPropertyAssignment(
      factory.createIdentifier(data.name),
      value,
    );
    if (is.empty(data.description)) {
      return property;
    }
    return addSyntheticLeadingComment(
      property,
      SyntaxKind.MultiLineCommentTrivia,
      `*\n${data.description
        .trim()
        .split(`\n`)
        .map(i => ` * ${i}`)
        .join(`\n`)}\n `,
      true,
    );
  }
}
