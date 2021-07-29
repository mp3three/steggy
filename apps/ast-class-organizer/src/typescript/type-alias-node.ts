import { Identifier, SourceFile, TypeAliasDeclaration } from 'typescript';

import { ElementNode } from './element-node';

export class TypeAliasNode extends ElementNode {
  // #region Constructors

  constructor(
    sourceFile: SourceFile,
    typeAliasDeclaration: TypeAliasDeclaration,
  ) {
    super(typeAliasDeclaration);

    this.name = (<Identifier>typeAliasDeclaration.name).escapedText.toString();

    this.fullStart = typeAliasDeclaration.getFullStart();
    this.end = typeAliasDeclaration.getEnd();
    this.start = typeAliasDeclaration.getStart(sourceFile, false);
    this.decorators = this.getDecorators(typeAliasDeclaration, sourceFile);
  }

  // #endregion Constructors
}
