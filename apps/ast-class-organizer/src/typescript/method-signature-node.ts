import { Identifier, MethodSignature, SourceFile } from 'typescript';

import { ElementNode } from './element-node';

export class MethodSignatureNode extends ElementNode {
  // #region Constructors

  constructor(
    sourceFile: SourceFile,
    methodSignatureDeclaration: MethodSignature,
  ) {
    super(methodSignatureDeclaration);

    this.name = (<Identifier>(
      methodSignatureDeclaration.name
    )).escapedText.toString();

    this.fullStart = methodSignatureDeclaration.getFullStart();
    this.end = methodSignatureDeclaration.getEnd();
    this.start = methodSignatureDeclaration.getStart(sourceFile, false);
    this.decorators = this.getDecorators(
      methodSignatureDeclaration,
      sourceFile,
    );
  }

  // #endregion Constructors
}
