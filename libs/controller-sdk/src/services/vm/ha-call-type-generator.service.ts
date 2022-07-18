import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AutoLogService, Cron, InjectConfig } from '@steggy/boilerplate';
import {
  HASocketAPIService,
  HomeAssistantFetchAPIService,
} from '@steggy/home-assistant';
import {
  HASSIO_WS_COMMAND,
  ServiceListFieldDescription,
  ServiceListItemDTO,
  ServiceListServiceTarget,
} from '@steggy/home-assistant-shared';
import { CronExpression, is, TitleCase } from '@steggy/utilities';
import { dump } from 'js-yaml';
import {
  addSyntheticLeadingComment,
  createPrinter,
  createSourceFile,
  EmitHint,
  factory,
  NewLineKind,
  ScriptKind,
  ScriptTarget,
  SyntaxKind,
  TypeNode,
} from 'typescript';

import { CALL_PROXY_DEBUG } from '../../config';

const printer = createPrinter({ newLine: NewLineKind.LineFeed });
const resultFile = createSourceFile(
  '',
  '',
  ScriptTarget.Latest,
  false,
  ScriptKind.TS,
);

@Injectable()
export class HACallTypeGenerator {
  constructor(
    private readonly logger: AutoLogService,
    private readonly fetchApi: HomeAssistantFetchAPIService,
    private readonly socketApi: HASocketAPIService,
    @InjectConfig(CALL_PROXY_DEBUG) private readonly debugLog: boolean,
  ) {}

  private lastBuild: string;
  private lastServices: string;
  private services: ServiceListItemDTO[];

  /**
   * This proxy is intended to be assigned to a constant, then injected into the VM.
   * The type definitions for the proxy object not making sense is alright, since separate definitions are provided to monaco
   *
   * This returns a proxy object, which contains functions for all the callable services.
   * Sanity checking isn't performed here on the service_data, if the user wants to bypass type checking,
   * they are more than welcome to do it.
   */
  public buildProxy(): Record<
    string,
    Record<string, (...arguments_) => Promise<void>>
  > {
    return new Proxy(
      {},
      {
        get: (t, domain: string) => {
          const domainItem: ServiceListItemDTO = this.services.find(
            i => i.domain === domain,
          );
          if (!domainItem) {
            throw new InternalServerErrorException(
              `Cannot access call_service#${domain}. Home Assistant doesn't list it as a real domain.`,
            );
          }
          const callback = async (
            service: string,
            service_data: Record<string, unknown>,
          ) => {
            if (this.debugLog) {
              this.logger.debug(
                { service_data },
                `Call service ${domain}#${service}`,
              );
            }
            // User can just not await this call if they don't care about the "waitForChange"
            await this.socketApi.sendMessage(
              {
                domain,
                service,
                service_data,
                type: HASSIO_WS_COMMAND.call_service,
              },
              true,
            );
          };
          const out = Object.fromEntries(
            Object.entries(domainItem.services).map(([key]) => [
              key,
              (parameters: Record<string, unknown>) =>
                callback(key, parameters),
            ]),
          );
          return out;
        },
        set: (t, property: string) => {
          throw new InternalServerErrorException(
            `Cannot modify call_service#${property}. Why do you want to do that?! 😕`,
          );
        },
      },
    );
  }

  public async buildTypes(): Promise<string> {
    const domains = await this.fetchApi.listServices();
    const stringified = JSON.stringify(domains);
    if (stringified === this.lastServices) {
      return this.lastBuild;
    }
    this.logger.info(`Services updated`);
    this.lastServices = stringified;
    this.lastBuild = printer.printNode(
      EmitHint.Unspecified,
      // Wrap all this into a top level `interface iCallService`
      factory.createTypeAliasDeclaration(
        undefined,
        undefined,
        // 😉
        factory.createIdentifier('iCallService'),
        undefined,
        // Create categories based off domain name
        // { domain: {...services} }
        factory.createTypeLiteralNode(
          domains.map(({ domain, services }) =>
            factory.createPropertySignature(
              undefined,
              factory.createIdentifier(domain),
              undefined,
              factory.createTypeLiteralNode(
                // Create functions based on provided services
                // { [...service_name](service_data): Promise<void> }
                Object.entries(services).map(([key, value]) =>
                  addSyntheticLeadingComment(
                    factory.createMethodSignature(
                      undefined,
                      factory.createIdentifier(key),
                      undefined,
                      undefined,
                      [
                        // f( service_data: { ...definition } )
                        //    Provide this        ^^^^^^
                        factory.createParameterDeclaration(
                          undefined,
                          undefined,
                          undefined,
                          factory.createIdentifier('service_data'),
                          undefined,
                          factory.createTypeLiteralNode(
                            [
                              ...Object.entries(value.fields).map(
                                ([service, details]) =>
                                  this.fieldPropertySignature(service, details),
                              ),
                              this.createTarget(value.target),
                            ].filter(i => !is.undefined(i)),
                          ),
                        ),
                      ],
                      factory.createTypeReferenceNode(
                        factory.createIdentifier('Promise'),
                        [factory.createKeywordTypeNode(SyntaxKind.VoidKeyword)],
                      ),
                    ),
                    SyntaxKind.MultiLineCommentTrivia,
                    `*\n` +
                      [
                        `## ${value.name || TitleCase(key)}`,
                        '',
                        value.description,
                      ]
                        .map(i => ` * ${i}`)
                        .join(`\n`),
                    true,
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
      resultFile,
    );
    return this.lastBuild;
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  protected async onModuleInit() {
    this.services = await this.fetchApi.listServices();
  }

  private createTarget(target: ServiceListServiceTarget) {
    if (is.empty(target)) {
      return undefined;
    }
    if (target.entity) {
      const property = factory.createPropertySignature(
        undefined,
        factory.createIdentifier('entity_id'),
        undefined,
        factory.createUnionTypeNode([
          ...(is.empty(target.entity.domain)
            ? [
                factory.createUnionTypeNode([
                  factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
                  factory.createArrayTypeNode(
                    factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
                  ),
                ]),
              ]
            : [
                factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
                factory.createArrayTypeNode(
                  factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
                ),
                factory.createTemplateLiteralType(
                  factory.createTemplateHead(
                    `${target.entity.domain}.`,
                    `${target.entity.domain}.`,
                  ),
                  [
                    factory.createTemplateLiteralTypeSpan(
                      factory.createTypeOperatorNode(
                        SyntaxKind.KeyOfKeyword,
                        factory.createTypeQueryNode(
                          factory.createQualifiedName(
                            factory.createIdentifier('home_assistant'),
                            factory.createIdentifier(target.entity.domain),
                          ),
                        ),
                      ),
                      factory.createTemplateTail('', ''),
                    ),
                  ],
                ),
                factory.createParenthesizedType(
                  factory.createArrayTypeNode(
                    factory.createTemplateLiteralType(
                      factory.createTemplateHead(
                        `${target.entity.domain}.`,
                        `${target.entity.domain}.`,
                      ),
                      [
                        factory.createTemplateLiteralTypeSpan(
                          factory.createTypeOperatorNode(
                            SyntaxKind.KeyOfKeyword,
                            factory.createTypeQueryNode(
                              factory.createQualifiedName(
                                factory.createIdentifier('home_assistant'),
                                factory.createIdentifier(target.entity.domain),
                              ),
                            ),
                          ),
                          factory.createTemplateTail('', ''),
                        ),
                      ],
                    ),
                  ),
                ),
              ]),
        ]),
      );
      return addSyntheticLeadingComment(
        property,
        SyntaxKind.MultiLineCommentTrivia,
        'Assisted definition',
        true,
      );
    }
    if (target.integration) {
      return undefined;
    }
    if (target.device) {
      return undefined;
    }
    this.logger.error(
      { target },
      `this#createTarget doesn't know what to do with target. Report as bug with this log line`,
    );
    return undefined;
  }

  // eslint-disable-next-line radar/cognitive-complexity
  private fieldPropertySignature(
    service: string,
    { selector, ...details }: ServiceListFieldDescription,
  ) {
    let node: TypeNode;
    const { domain } = selector?.entity ?? {};
    // : boolean
    if (!is.undefined(selector.boolean))
      node = factory.createKeywordTypeNode(SyntaxKind.BooleanKeyword);
    // : number
    else if (!is.undefined(selector.number))
      node = factory.createKeywordTypeNode(SyntaxKind.NumberKeyword);
    // : string
    else if (!is.undefined(selector.text) || !is.undefined(selector.time))
      node = factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
    // string | `domain.${keyof typeof home_assistant.domain}`
    else if (!is.undefined(selector.entity))
      node = is.empty(domain)
        ? factory.createKeywordTypeNode(SyntaxKind.StringKeyword)
        : factory.createUnionTypeNode([
            factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
            factory.createArrayTypeNode(
              factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
            ),
            factory.createArrayTypeNode(
              factory.createTemplateLiteralType(
                factory.createTemplateHead(`${domain}.`, `${domain}.`),
                [
                  factory.createTemplateLiteralTypeSpan(
                    factory.createTypeOperatorNode(
                      SyntaxKind.KeyOfKeyword,
                      factory.createTypeQueryNode(
                        factory.createQualifiedName(
                          factory.createIdentifier('home_assistant'),
                          factory.createIdentifier(domain),
                        ),
                      ),
                    ),
                    factory.createTemplateTail('', ''),
                  ),
                ],
              ),
            ),
          ]);
    // : "option" | "option" | "option" | "option"
    else if (!is.undefined(selector.select))
      node = factory.createUnionTypeNode(
        selector.select.options.map(
          (i: string | Record<'label' | 'value', string>) =>
            factory.createLiteralTypeNode(
              factory.createStringLiteral(is.string(i) ? i : i.value),
            ),
        ),
      );
    // : Record<string, unknown> | (unknown[]);
    else if (!is.undefined(selector.object))
      node = factory.createUnionTypeNode([
        factory.createTypeReferenceNode(factory.createIdentifier('Record'), [
          factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
          factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword),
        ]),
        factory.createParenthesizedType(
          factory.createArrayTypeNode(
            factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword),
          ),
        ),
      ]);
    // else if (!is.undefined(selector.))
    // : unknown
    else node = factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword);

    const property = factory.createPropertySignature(
      undefined,
      factory.createIdentifier(service),
      details.required
        ? undefined
        : factory.createToken(SyntaxKind.QuestionToken),
      node,
    );
    const example = String(details.example);
    return addSyntheticLeadingComment(
      property,
      SyntaxKind.MultiLineCommentTrivia,
      `*\n` +
        [
          '## ' + (is.empty(details.name) ? TitleCase(service) : details.name),
          ...(is.empty(details.description) ? [] : ['', details.description]),
          ...(is.empty(example) ? [] : ['', `@example ${example}`]),
          ...(is.undefined(details.default)
            ? []
            : ['', `@default ${JSON.stringify(details.default)}`]),
          '',
          '## Selector',
          '',
          '```yaml',
          dump(selector),
          '```',
        ]
          .map(i => ` * ${i}`)
          .join(`\n`),
      true,
    );
  }
}
