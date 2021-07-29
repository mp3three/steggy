import { EnumDeclaration, Identifier, SourceFile } from 'typescript';

import { ElementNode } from './element-node';

export class EnumNode extends ElementNode {
  // #region Constructors

  constructor(sourceFile: SourceFile, enumDeclaration: EnumDeclaration) {
    super(enumDeclaration);

    this.name = (<Identifier>enumDeclaration.name).escapedText.toString();

    this.fullStart = enumDeclaration.getFullStart();
    this.end = enumDeclaration.getEnd();
    this.start = enumDeclaration.getStart(sourceFile, false);
    this.decorators = this.getDecorators(enumDeclaration, sourceFile);
  }

  // #endregion Constructors
}
