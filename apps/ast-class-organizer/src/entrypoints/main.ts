import eslint from 'eslint';
import { createSourceFile, ScriptKind, ScriptTarget } from 'typescript';
import {
  commands,
  ExtensionContext,
  Position,
  Range,
  TextEditor,
  window,
  workspace,
  WorkspaceEdit,
} from 'vscode';

import {
  compare,
  Configuration,
  ElementNodeGroup,
  ElementNodeGroupConfiguration,
  formatLines,
  getClasses,
  getEnums,
  getFunctions,
  getImports,
  getInterfaces,
  getTypeAliases,
  removeRegions,
  Transformer,
} from '../include';
import {
  ClassNode,
  ElementNode,
  GetterNode,
  InterfaceNode,
  MethodNode,
  PropertyNode,
  SetterNode,
  UnknownNode,
} from '../typescript';
import { MemberType } from '../typings';

let configuration = getConfiguration();

export function activate(context: ExtensionContext): void {
  context.subscriptions.push(
    commands.registerCommand('ast-class-organizer.organize', () => {
      organize(window.activeTextEditor, configuration);
    }),
    commands.registerCommand('ast-class-organizer.organizeAll', () =>
      organizeAll(configuration),
    ),
  );
  workspace.onDidChangeConfiguration(
    () => (configuration = getConfiguration()),
  );
  workspace.onWillSaveTextDocument((e) => {
    if (
      window.activeTextEditor &&
      window.activeTextEditor.document.fileName == e.document.fileName &&
      configuration.organizeOnSave
    ) {
      organize(window.activeTextEditor, getConfiguration());
    }
  });
}

function getConfiguration() {
  const configuration = workspace.getConfiguration('ast-class-organizer');

  return new Configuration(
    configuration.get<boolean>('useRegions') === true,
    configuration.get<boolean>('addPublicModifierIfMissing') === true,
    configuration.get<boolean>('accessorsBeforeCtor') === true,
    configuration.get<boolean>('addRowNumberInRegionName') === true,
    configuration.get<boolean>('addRegionIndentation') === true,
    configuration.get<boolean>('addRegionCaptionToRegionEnd') === true,
    configuration.get<boolean>('groupPropertiesWithDecorators') === true,
    configuration.get<boolean>('treatArrowFunctionPropertiesAsMethods') ===
      true,
    configuration.get<boolean>('organizeOnSave') === true,
    getMemberOrderConfig(),
  );
}

function getMemberOrderConfig(): ElementNodeGroupConfiguration[] {
  const memberTypeOrderConfiguration =
    workspace
      .getConfiguration('ast-class-organizer')
      .get<ElementNodeGroupConfiguration[]>('memberOrder') || [];
  const memberTypeOrder: ElementNodeGroupConfiguration[] = [];
  const defaultMemberTypeOrder = Object.values(MemberType); // same order as in the enum

  // map member type order from configuration
  memberTypeOrderConfiguration.forEach((x: ElementNodeGroupConfiguration) =>
    memberTypeOrder.push(parseElementNodeGroupConfiguration(x)),
  );

  // add missing member types (prevent duplicates)
  defaultMemberTypeOrder
    .filter(
      (x) =>
        !memberTypeOrder.some(
          (y) =>
            y.memberTypes &&
            y.memberTypes.length > 0 &&
            y.memberTypes.includes(x),
        ),
    )
    .forEach((x) => {
      const defaultElementNodeGroupConfiguration =
        new ElementNodeGroupConfiguration();

      defaultElementNodeGroupConfiguration.caption =
        convertPascalCaseToTitleCase(MemberType[x]);
      defaultElementNodeGroupConfiguration.memberTypes = [x];

      memberTypeOrder.push(defaultElementNodeGroupConfiguration);
    });

  return memberTypeOrder;
}

function convertPascalCaseToTitleCase(value: string) {
  if (value && value.length > 1) {
    value = value.replace(/(?:^|\.?)([A-Z])/g, (x, y) => ' ' + y);
  }

  return value;
}

function parseElementNodeGroupConfiguration(
  configuration: ElementNodeGroupConfiguration,
) {
  const elementNodeGroupConfiguration = new ElementNodeGroupConfiguration();

  elementNodeGroupConfiguration.caption = configuration.caption;
  elementNodeGroupConfiguration.memberTypes = configuration.memberTypes.map(
    // TODO: Seriously.. wtf is this shit
    (y) => MemberType[y] as unknown as MemberType,
  );

  return elementNodeGroupConfiguration;
}

function getIndentation(sourceCode: string): string {
  const tab = '\t';
  const twoSpaces = '  ';
  const fourSpaces = '    ';

  // eslint-disable-next-line no-loops/no-loops
  for (const sourceCodeLine of sourceCode.split('\n')) {
    if (sourceCodeLine.startsWith(tab)) {
      return tab;
    }
    if (sourceCodeLine.startsWith(fourSpaces)) {
      return fourSpaces;
    }
    if (sourceCodeLine.startsWith(twoSpaces)) {
      return twoSpaces;
    }
  }

  return twoSpaces;
}

function organizeAll(configuration: Configuration) {
  workspace
    .findFiles('**/*.ts', '**/node_modules/**')
    .then((typescriptFiles) =>
      typescriptFiles.forEach((typescriptFile) =>
        workspace
          .openTextDocument(typescriptFile)
          .then((document) =>
            window
              .showTextDocument(document)
              .then((editor) => organize(editor, configuration) !== undefined),
          ),
      ),
    );
}

function organize(
  editor: TextEditor | undefined,
  configuration: Configuration,
) {
  let edit: WorkspaceEdit;
  let start: Position;
  let end: Position;
  let range: Range;

  if (editor) {
    let sourceCode = editor.document.getText();
    const fileName = editor.document.fileName;

    sourceCode = organizeTypes(sourceCode, fileName, configuration);

    start = new Position(0, 0);
    end = new Position(
      editor.document.lineCount,
      editor.document.lineAt(editor.document.lineCount - 1).text.length,
    );
    range = new Range(start, end);

    edit = new WorkspaceEdit();
    edit.replace(editor.document.uri, range, sourceCode);

    return workspace.applyEdit(edit);
  }
}

// eslint-disable-next-line radar/cognitive-complexity
function print(
  groups: ElementNodeGroup[],
  sourceCode: string,
  start: number,
  end: number,
  IndentationLevel: number,
  addRowNumberInRegionName: boolean,
  addPublicModifierIfMissing: boolean,
  addRegionIndentation: boolean,
  Indentation: string,
  addRegionCaptionToRegionEnd: boolean,
  groupElementsWithDecorators: boolean,
): string {
  let sourceCode2: string;
  let count = 0;
  let members = '';
  const newLine = '\r\n';
  let nodeGroups: ElementNode[][] = [];

  groups.forEach((group) => {
    if (group.nodes && group.nodes.length > 0) {
      count = group.nodes.length;
      nodeGroups = [group.nodes];
    } else if (group.nodeSubGroups && group.nodeSubGroups.length > 0) {
      // eslint-disable-next-line unicorn/no-array-reduce
      count = group.nodeSubGroups.reduce((sum, x) => sum + x.nodes.length, 0);
      nodeGroups = group.nodeSubGroups
        .map((x) => x.nodes)
        .filter((x) => x.length > 0);
    } else {
      count = 0;
      nodeGroups = [];
    }

    if (count > 0) {
      if (group.isRegion) {
        members += newLine;
        members += `${addRegionIndentation ? Indentation : ''}// #region`;
        members += group.caption ? ` ${group.caption}` : '';
        members += addRowNumberInRegionName ? ` (${count})` : '';
        members += newLine;
      }

      members += newLine;
      nodeGroups.forEach((nodeGroup) => {
        // eslint-disable-next-line no-loops/no-loops
        for (let i = 0; i < nodeGroup.length; i++) {
          const node = nodeGroup[i];
          const comment = sourceCode.slice(node.fullStart, node.start).trim();
          let code = sourceCode.slice(node.start, node.end).trim();

          if (addPublicModifierIfMissing && node.accessModifier === undefined) {
            if (node instanceof MethodNode) {
              if (code.startsWith('static')) {
                code = code.startsWith('static async')
                  ? code.replace(
                      new RegExp(`static\\s*async\\s*${node.name}\\s*\\(`),
                      `public static async ${node.name}(`,
                    )
                  : code.replace(
                      new RegExp(`static\\s*${node.name}\\s*\\(`),
                      `public static ${node.name}(`,
                    );
              } else {
                code = code.startsWith('async')
                  ? code.replace(
                      new RegExp(`async\\s*${node.name}\\s*\\(`),
                      `public async ${node.name}(`,
                    )
                  : code.replace(
                      new RegExp(`${node.name}\\s*\\(`),
                      `public ${node.name}(`,
                    );
              }
            } else if (node instanceof PropertyNode) {
              if (code.startsWith('static')) {
                code = code.replace(
                  new RegExp(`static\\s*${node.name}\\s*:`),
                  `public static ${node.name}:`,
                );
                code = code.replace(
                  new RegExp(`static\\s*${node.name}\\s*=`),
                  `public static ${node.name} =`,
                );
                code = code.replace(
                  new RegExp(`static\\s*${node.name}\\s*;`),
                  `public static ${node.name};`,
                );
              } else {
                code = code.replace(
                  new RegExp(`${node.name}\\s*:`),
                  `public ${node.name}:`,
                );
                code = code.replace(
                  new RegExp(`${node.name}\\s*=`),
                  `public ${node.name} =`,
                );
                code = code.replace(
                  new RegExp(`${node.name}\\s*;`),
                  `public ${node.name};`,
                );
              }
            } else if (node instanceof GetterNode) {
              code = code.startsWith('static')
                ? code.replace(
                    new RegExp(`static\\s*get\\s*${node.name}\\s*\\(`),
                    `public static get ${node.name}(`,
                  )
                : code.replace(
                    new RegExp(`get\\s*${node.name}\\s*\\(`),
                    `public get ${node.name}(`,
                  );
            } else if (node instanceof SetterNode) {
              code = code.startsWith('static')
                ? code.replace(
                    new RegExp(`static\\s*set\\s*${node.name}\\s*\\(`),
                    `public static set ${node.name}(`,
                  )
                : code.replace(
                    new RegExp(`set\\s*${node.name}\\s*\\(`),
                    `public set ${node.name}(`,
                  );
            }
          }

          if (
            groupElementsWithDecorators &&
            i > 0 &&
            nodeGroup[i - 1].decorators.length > 0 &&
            nodeGroup[i].decorators.length === 0
          ) {
            members += newLine;
          }

          if (comment !== '') {
            members += `${
              IndentationLevel === 1 ? Indentation : ''
            }${comment}${newLine}`;
          }

          members += `${IndentationLevel === 1 ? Indentation : ''}${code}`;
          members += newLine;

          if (
            code.endsWith('}') ||
            (node instanceof PropertyNode && node.isArrowFunction)
          ) {
            members += newLine;
          }
        }

        members += newLine;
      });

      if (group.isRegion) {
        members += newLine;
        members += `${addRegionIndentation ? Indentation : ''}// #endregion`;
        members += addRegionCaptionToRegionEnd ? ` ${group.caption}` : '';
        members += addRowNumberInRegionName ? ` (${count})` : '';
        members += newLine;
      }

      members += newLine;
    }
  });

  sourceCode2 = sourceCode.slice(0, Math.max(0, start)).trimEnd();
  sourceCode2 += newLine;
  sourceCode2 += (addRegionIndentation ? Indentation : '') + members.trim();
  sourceCode2 += newLine;
  sourceCode2 += sourceCode.slice(end, sourceCode.length).trimStart();

  return sourceCode2.trimStart();
}

function organizeTypes(
  sourceCode: string,
  fileName: string,
  configuration: Configuration,
) {
  sourceCode = removeRegions(sourceCode);

  const indentation = getIndentation(sourceCode);

  // organize type aliases, interfaces, classes, enums, functions and variables
  let sourceFile = createSourceFile(
    fileName,
    sourceCode,
    ScriptTarget.Latest,
    false,
    ScriptKind.TS,
  );

  let elements = new Transformer().analyzeSyntaxTree(
    sourceFile,
    configuration.treatArrowFunctionPropertiesAsMethods,
  );

  if (!elements.some((x) => !(x instanceof UnknownNode))) {
    const imports = getImports(
      elements,
      configuration.groupPropertiesWithDecorators,
    );
    const functions = getFunctions(
      elements,
      configuration.groupPropertiesWithDecorators,
    );
    const typeAliases = getTypeAliases(
      elements,
      configuration.groupPropertiesWithDecorators,
    );
    const interfaces = getInterfaces(
      elements,
      configuration.groupPropertiesWithDecorators,
    );
    const classes = getClasses(
      elements,
      configuration.groupPropertiesWithDecorators,
    );
    const enums = getEnums(
      elements,
      configuration.groupPropertiesWithDecorators,
    );

    const groups = [
      new ElementNodeGroup('Imports', [], imports, false),
      new ElementNodeGroup('Type aliases', [], typeAliases, true),
      new ElementNodeGroup('Interfaces', [], interfaces, true),
      new ElementNodeGroup('Classes', [], classes, true),
      new ElementNodeGroup('Enums', [], enums, true),
      new ElementNodeGroup('Functions', [], functions, true),
    ];

    if (
      functions.length +
        typeAliases.length +
        interfaces.length +
        classes.length +
        enums.length >
        1 ||
      functions.length > 0
    ) {
      sourceCode = print(
        groups,
        sourceCode,
        0,
        sourceCode.length,
        0,
        configuration.addRowNumberInRegionName,
        false,
        false,
        indentation,
        configuration.addRegionCaptionToRegionEnd,
        configuration.groupPropertiesWithDecorators,
      );
    }
  }

  // organize members of interfaces and classes
  sourceFile = createSourceFile(
    fileName,
    sourceCode,
    ScriptTarget.Latest,
    false,
    ScriptKind.TS,
  );
  elements = new Transformer()
    .analyzeSyntaxTree(
      sourceFile,
      configuration.treatArrowFunctionPropertiesAsMethods,
    )
    .sort((a, b) => compare(a.fullStart, b.fullStart) * -1);

  elements.forEach((element) => {
    if (element instanceof InterfaceNode) {
      const interfaceNode = <InterfaceNode>element;
      const groups = organizeInterfaceMembers(
        interfaceNode,
        configuration.memberOrder,
        configuration.groupPropertiesWithDecorators,
      );
      sourceCode = print(
        groups,
        sourceCode,
        interfaceNode.membersStart,
        interfaceNode.membersEnd,
        1,
        configuration.addRowNumberInRegionName,
        false,
        configuration.addRegionIndentation,
        indentation,
        configuration.addRegionCaptionToRegionEnd,
        configuration.groupPropertiesWithDecorators,
      );
      return;
    }
    if (element instanceof ClassNode) {
      const classNode = <ClassNode>element;
      const groups = organizeClassMembers(
        classNode,
        configuration.memberOrder,
        configuration.groupPropertiesWithDecorators,
      );
      sourceCode = print(
        groups,
        sourceCode,
        classNode.membersStart,
        classNode.membersEnd,
        1,
        configuration.addRowNumberInRegionName,
        configuration.addPublicModifierIfMissing,
        configuration.addRegionIndentation,
        indentation,
        configuration.addRegionCaptionToRegionEnd,
        configuration.groupPropertiesWithDecorators,
      );
    }
  });

  if (!configuration.useRegions) {
    sourceCode = removeRegions(sourceCode);
  }

  sourceCode = formatLines(sourceCode);
  return sourceCode;
}

function organizeInterfaceMembers(
  interfaceNode: InterfaceNode,
  memberTypeOrder: ElementNodeGroupConfiguration[],
  groupElementsWithDecorators: boolean,
) {
  const regions: ElementNodeGroup[] = [];
  let memberGroups: ElementNodeGroup[];

  memberTypeOrder.forEach((memberTypeGroup) => {
    memberGroups = [];

    memberTypeGroup.memberTypes.forEach((memberType) => {
      switch (memberType) {
        case MemberType.publicConstProperties: {
          // public const properties
          memberGroups.push(
            new ElementNodeGroup(
              undefined,
              [],
              interfaceNode.getConstProperties(groupElementsWithDecorators),
              false,
            ),
          );

          break;
        }
        case MemberType.publicReadOnlyProperties: {
          // public readonly methods
          memberGroups.push(
            new ElementNodeGroup(
              undefined,
              [],
              interfaceNode.getReadOnlyProperties(groupElementsWithDecorators),
              false,
            ),
          );

          break;
        }
        case MemberType.publicProperties: {
          // public methods
          memberGroups.push(
            new ElementNodeGroup(
              undefined,
              [],
              interfaceNode.getProperties(groupElementsWithDecorators),
              false,
            ),
          );

          break;
        }
        case MemberType.publicIndexes: {
          // public indexes
          memberGroups.push(
            new ElementNodeGroup(
              undefined,
              [],
              interfaceNode.getIndexes(groupElementsWithDecorators),
              false,
            ),
          );

          break;
        }
        case MemberType.publicMethods: {
          // public methods
          memberGroups.push(
            new ElementNodeGroup(
              undefined,
              [],
              interfaceNode.getMethods(groupElementsWithDecorators),
              false,
            ),
          );

          break;
        }
        // No default
      }
    });

    regions.push(
      new ElementNodeGroup(memberTypeGroup.caption, memberGroups, [], true),
    );
  });

  return regions;
}

function organizeClassMembers(
  classNode: ClassNode,
  memberTypeOrder: ElementNodeGroupConfiguration[],
  groupElementsWithDecorators: boolean,
): ElementNodeGroup[] {
  const regions: ElementNodeGroup[] = [];
  let memberGroups: ElementNodeGroup[];

  memberTypeOrder.forEach((memberTypeGroup) => {
    memberGroups = [];

    memberTypeGroup.memberTypes.forEach((memberType) => {
      const name = `get${memberType.charAt(0).toUpperCase()}${memberType.slice(
        1,
      )}` as keyof ClassNode;
      const method = classNode[name] as (
        groupWithDecorators: boolean,
      ) => PropertyNode[];
      memberGroups.push(
        new ElementNodeGroup(
          undefined,
          [],
          method.bind(classNode)(groupElementsWithDecorators),
          false,
        ),
      );
    });

    regions.push(
      new ElementNodeGroup(memberTypeGroup.caption, memberGroups, [], true),
    );
  });

  return regions;
}
