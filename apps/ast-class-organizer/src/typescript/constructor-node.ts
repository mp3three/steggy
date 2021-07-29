import { ConstructorDeclaration, SourceFile } from 'typescript';

import { ElementNode } from './element-node';

export class ConstructorNode extends ElementNode {
  // #region Constructors

  constructor(
    sourceFile: SourceFile,
    constructorDeclaration: ConstructorDeclaration,
  ) {
    super(constructorDeclaration);

    this.name = 'constructor';

    this.fullStart = constructorDeclaration.getFullStart();
    this.end = constructorDeclaration.getEnd();
    this.start = constructorDeclaration.getStart(sourceFile, false);
    this.decorators = this.getDecorators(constructorDeclaration, sourceFile);
  }

  // #endregion Constructors
}
