import {
  ClassDeclaration,
  ConstructorDeclaration,
  EnumDeclaration,
  FunctionDeclaration,
  GetAccessorDeclaration,
  IndexedAccessTypeNode,
  IndexSignatureDeclaration,
  MethodDeclaration,
  MethodSignature,
  Modifier,
  Node,
  PropertyDeclaration,
  PropertySignature,
  SetAccessorDeclaration,
  SourceFile,
  SyntaxKind,
  TypeAliasDeclaration,
  VariableStatement,
} from 'typescript';

import { AccessModifier, WriteModifier } from '../typings';
import { PropertyNode } from './property-node';
import { PropertySignatureNode } from './property-signature-node';

export abstract class ElementNode {
  // #region Object Properties

  public accessModifier: AccessModifier;
  public decorators: string[] = [];
  public end = 0;
  public fullStart = 0;
  public name = '';
  public start = 0;

  // #endregion Object Properties

  // #region Constructors

  constructor(public readonly node: Node) {}

  // #endregion Constructors

  // #region Public Methods

  public getDecorators(
    node:
      | ClassDeclaration
      | GetAccessorDeclaration
      | SetAccessorDeclaration
      | PropertyDeclaration
      | MethodDeclaration
      | IndexedAccessTypeNode
      | ConstructorDeclaration
      | EnumDeclaration
      | FunctionDeclaration
      | IndexSignatureDeclaration
      | MethodSignature
      | PropertySignature
      | TypeAliasDeclaration,
    sourceFile: SourceFile,
  ): string[] {
    const parametersRegex = /\(.*\)/;

    return node.decorators && node.decorators.length > 0
      ? node.decorators.map((x) =>
          x.getText(sourceFile).replace(parametersRegex, ''),
        )
      : [];
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected getAccessModifier(
    node:
      | PropertyDeclaration
      | GetAccessorDeclaration
      | SetAccessorDeclaration
      | MethodDeclaration
      | IndexedAccessTypeNode
      | PropertySignature
      | IndexSignatureDeclaration,
  ): AccessModifier {
    let accessModifier: AccessModifier;
    const accessModifiers = new Set([
      SyntaxKind.PrivateKeyword,
      SyntaxKind.ProtectedKeyword,
      SyntaxKind.PublicKeyword,
    ]);
    let nodeAccessModifier: Modifier;

    if (node.modifiers && node.modifiers.length > 0) {
      nodeAccessModifier = node.modifiers.find((x) =>
        accessModifiers.has(x.kind),
      );

      if (nodeAccessModifier) {
        switch (nodeAccessModifier.kind) {
          case SyntaxKind.PublicKeyword: {
            accessModifier = AccessModifier.public;

            break;
          }
          case SyntaxKind.ProtectedKeyword: {
            accessModifier = AccessModifier.protected;

            break;
          }
          case SyntaxKind.PrivateKeyword: {
            accessModifier = AccessModifier.private;

            break;
          }
          // No default
        }
      }
    }

    return accessModifier;
  }

  protected getIsAbstract(
    node:
      | ClassDeclaration
      | GetAccessorDeclaration
      | SetAccessorDeclaration
      | PropertyDeclaration
      | MethodDeclaration
      | IndexedAccessTypeNode,
  ): boolean {
    let isAbstract = false;

    if (node.modifiers && node.modifiers.length > 0) {
      isAbstract =
        node.modifiers.find((x) => x.kind === SyntaxKind.AbstractKeyword) !==
        undefined;
    }

    return isAbstract;
  }

  protected getIsExport(node: ClassDeclaration | FunctionDeclaration): boolean {
    let isExport = false;

    if (node.modifiers && node.modifiers.length > 0) {
      const temporary = node.modifiers.find(
        (modifier) => modifier.kind === SyntaxKind.ExportKeyword,
      );

      if (temporary && temporary.kind === SyntaxKind.ExportKeyword) {
        isExport = true;
      }
    }

    return isExport;
  }

  protected getIsStatic(
    node:
      | ClassDeclaration
      | GetAccessorDeclaration
      | SetAccessorDeclaration
      | PropertyDeclaration
      | MethodDeclaration
      | IndexedAccessTypeNode,
  ): boolean {
    let isStatic = false;

    if (node.modifiers && node.modifiers.length > 0) {
      isStatic =
        node.modifiers.find((x) => x.kind === SyntaxKind.StaticKeyword) !==
        undefined;
    }

    return isStatic;
  }

  protected getName(node: ElementNode, groupWithDecorators: boolean): string {
    if (groupWithDecorators && node.decorators.length > 0) {
      return node.decorators.join(', ') + ' ' + node.name;
    }

    return node.name;
  }

  protected getWriteMode(
    node:
      | PropertyDeclaration
      | VariableStatement
      | IndexedAccessTypeNode
      | PropertySignature
      | IndexSignatureDeclaration,
  ): WriteModifier {
    let writeMode: WriteModifier = WriteModifier.writable;
    const writeModifiers = new Set([
      SyntaxKind.ConstKeyword,
      SyntaxKind.ReadonlyKeyword,
    ]);
    let nodeWriteModifier: Modifier | undefined;

    if (node.modifiers && node.modifiers.length > 0) {
      nodeWriteModifier = node.modifiers.find((x) =>
        writeModifiers.has(x.kind),
      );

      if (nodeWriteModifier) {
        if (nodeWriteModifier.kind === SyntaxKind.ConstKeyword) {
          writeMode = WriteModifier.const;
        } else if (nodeWriteModifier.kind === SyntaxKind.ReadonlyKeyword) {
          writeMode = WriteModifier.readOnly;
        }
      }
    }

    return writeMode;
  }

  protected isConstant(x: PropertyNode | PropertySignatureNode): boolean {
    return x.writeMode === WriteModifier.const;
  }

  protected isPrivate(x: ElementNode): boolean {
    return x.accessModifier === AccessModifier.private;
  }

  protected isProtected(x: ElementNode): boolean {
    return x.accessModifier === AccessModifier.protected;
  }

  protected isPublic(x: ElementNode): boolean {
    return (
      x.accessModifier === AccessModifier.public || x.accessModifier === null
    );
  }

  protected isReadOnly(x: PropertyNode | PropertySignatureNode): boolean {
    return x.writeMode === WriteModifier.readOnly;
  }

  protected isWritable(x: PropertyNode | PropertySignatureNode): boolean {
    return x.writeMode === WriteModifier.writable;
  }

  // #endregion Protected Methods
}
