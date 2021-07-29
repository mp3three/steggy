import { FunctionDeclaration, Identifier, SourceFile } from 'typescript';

import { ElementNode } from './element-node';

export class FunctionNode extends ElementNode {
  // #region Object Properties

  public isExport: boolean;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    sourceFile: SourceFile,
    functionDeclaration: FunctionDeclaration,
  ) {
    super(functionDeclaration);

    this.name = (<Identifier>functionDeclaration.name).escapedText.toString();

    this.fullStart = functionDeclaration.getFullStart();
    this.end = functionDeclaration.getEnd();
    this.start = functionDeclaration.getStart(sourceFile, false);

    this.isExport = this.getIsExport(functionDeclaration);
    this.decorators = this.getDecorators(functionDeclaration, sourceFile);
  }

  // #endregion Constructors
}
