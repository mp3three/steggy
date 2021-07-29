import { IndexSignatureDeclaration, SourceFile } from 'typescript';

import { WriteModifier } from '../typings';
import { ElementNode } from './element-node';

export class IndexSignatureNode extends ElementNode {
  // #region Object Properties

  public writeMode: WriteModifier = WriteModifier.writable;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    sourceFile: SourceFile,
    indexSignatureDeclaration: IndexSignatureDeclaration,
  ) {
    super(indexSignatureDeclaration);

    this.name = 'index';

    this.fullStart = indexSignatureDeclaration.getFullStart();
    this.end = indexSignatureDeclaration.getEnd();
    this.start = indexSignatureDeclaration.getStart(sourceFile, false);

    this.accessModifier = this.getAccessModifier(indexSignatureDeclaration);
    this.writeMode = this.getWriteMode(indexSignatureDeclaration);
    this.decorators = this.getDecorators(indexSignatureDeclaration, sourceFile);
  }

  // #endregion Constructors
}
