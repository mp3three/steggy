import { ImportDeclaration, SourceFile } from 'typescript';

import { ElementNode } from './element-node';

export class ImportNode extends ElementNode {
  // #region Constructors

  constructor(sourceFile: SourceFile, importDeclaration: ImportDeclaration) {
    super(importDeclaration);

    this.name = 'import';

    this.fullStart = importDeclaration.getFullStart();
    this.end = importDeclaration.getEnd();
    this.start = importDeclaration.getStart(sourceFile, false);
  }

  // #endregion Constructors
}
