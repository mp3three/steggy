import {
  ClassDeclaration,
  InterfaceDeclaration,
  isClassDeclaration,
  isConstructorDeclaration,
  isEnumDeclaration,
  isFunctionDeclaration,
  isGetAccessorDeclaration,
  isImportDeclaration,
  isIndexedAccessTypeNode,
  isIndexSignatureDeclaration,
  isInterfaceDeclaration,
  isMethodDeclaration,
  isMethodSignature,
  isPropertyDeclaration,
  isPropertySignature,
  isSetAccessorDeclaration,
  isTypeAliasDeclaration,
  Node,
  SourceFile,
  SyntaxKind,
} from 'typescript';

import {
  ClassNode,
  ConstructorNode,
  ElementNode,
  EnumNode,
  FunctionNode,
  GetterNode,
  ImportNode,
  IndexNode,
  IndexSignatureNode,
  InterfaceNode,
  MethodNode,
  MethodSignatureNode,
  PropertyNode,
  PropertySignatureNode,
  SetterNode,
  TypeAliasNode,
} from '../typescript';

export class Transformer {
  // #region Public Methods

  public analyzeSyntaxTree(
    sourceFile: SourceFile,
    treatArrowFunctionPropertiesAsMethods: boolean,
  ): ElementNode[] {
    const elements: ElementNode[] = [];
    const nodes = sourceFile.getChildren(sourceFile);
    nodes.forEach((node) =>
      this.visitSyntaxTree(
        elements,
        node,
        sourceFile,
        treatArrowFunctionPropertiesAsMethods,
      ),
    );
    return elements;
  }

  // #endregion Public Methods

  // #region Private Methods

  private mergeClassDeclaration(
    elements: ElementNode[],
    node: ClassDeclaration,
    sourceFile: SourceFile,
    treatArrowFunctionPropertiesAsMethods: boolean,
  ) {
    elements.push(new ClassNode(sourceFile, node));
    node.members.forEach((member) => {
      if (isConstructorDeclaration(member)) {
        (<ClassNode>elements[elements.length - 1]).constructors.push(
          new ConstructorNode(sourceFile, member),
        );
      } else if (isPropertyDeclaration(member)) {
        if (
          treatArrowFunctionPropertiesAsMethods &&
          member.initializer?.kind === SyntaxKind.ArrowFunction
        ) {
          (<ClassNode>elements[elements.length - 1]).methods.push(
            new PropertyNode(sourceFile, member),
          );
        } else {
          (<ClassNode>elements[elements.length - 1]).properties.push(
            new PropertyNode(sourceFile, member),
          );
        }
      } else if (isGetAccessorDeclaration(member)) {
        (<ClassNode>elements[elements.length - 1]).getters.push(
          new GetterNode(sourceFile, member),
        );
      } else if (isSetAccessorDeclaration(member)) {
        (<ClassNode>elements[elements.length - 1]).setters.push(
          new SetterNode(sourceFile, member),
        );
      } else if (isMethodDeclaration(member)) {
        (<ClassNode>elements[elements.length - 1]).methods.push(
          new MethodNode(sourceFile, member),
        );
      } else if (isIndexedAccessTypeNode(member)) {
        (<ClassNode>elements[elements.length - 1]).indexes.push(
          new IndexNode(sourceFile, member),
        );
      }
    });
    return elements;
  }

  private mergeInterfaceDeclarations(
    elements: ElementNode[],
    node: InterfaceDeclaration,
    sourceFile: SourceFile,
  ): ElementNode[] {
    elements.push(new InterfaceNode(sourceFile, node));
    node.members.forEach((member) => {
      if (isPropertySignature(member)) {
        (<InterfaceNode>elements[elements.length - 1]).properties.push(
          new PropertySignatureNode(sourceFile, member),
        );
      } else if (isIndexSignatureDeclaration(member)) {
        (<InterfaceNode>elements[elements.length - 1]).indexes.push(
          new IndexSignatureNode(sourceFile, member),
        );
      } else if (isMethodSignature(member)) {
        (<InterfaceNode>elements[elements.length - 1]).methods.push(
          new MethodSignatureNode(sourceFile, member),
        );
      }
    });
    return elements;
  }

  private visitSyntaxTree(
    elements: ElementNode[],
    node: Node,
    sourceFile: SourceFile,
    treatArrowFunctionPropertiesAsMethods: boolean,
  ): ElementNode[] {
    if (isImportDeclaration(node)) {
      elements.push(new ImportNode(sourceFile, node));
    }
    if (isTypeAliasDeclaration(node)) {
      elements.push(new TypeAliasNode(sourceFile, node));
      return elements;
    }
    if (isInterfaceDeclaration(node)) {
      return this.mergeInterfaceDeclarations(elements, node, sourceFile);
    }
    if (isClassDeclaration(node)) {
      return this.mergeClassDeclaration(
        elements,
        node,
        sourceFile,
        treatArrowFunctionPropertiesAsMethods,
      );
    }
    if (isEnumDeclaration(node)) {
      elements.push(new EnumNode(sourceFile, node));
      return elements;
    }
    if (isFunctionDeclaration(node)) {
      elements.push(new FunctionNode(sourceFile, node));
      return elements;
    }
    const children = node.getChildren(sourceFile);
    children.forEach((childNode) => {
      this.visitSyntaxTree(
        elements,
        childNode,
        sourceFile,
        treatArrowFunctionPropertiesAsMethods,
      );
    });
    return elements;
  }

  // #endregion Private Methods
}
