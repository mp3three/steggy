import { Identifier, PropertySignature, SourceFile } from 'typescript';

import { WriteModifier } from '../typings';
import { ElementNode } from './element-node';

export class PropertySignatureNode extends ElementNode {
  // #region Object Properties

  public writeMode: WriteModifier = WriteModifier.writable;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    sourceFile: SourceFile,
    propertySignatureDeclaration: PropertySignature,
  ) {
    super(propertySignatureDeclaration);

    this.name = (<Identifier>(
      propertySignatureDeclaration.name
    )).escapedText.toString();

    this.fullStart = propertySignatureDeclaration.getFullStart();
    this.end = propertySignatureDeclaration.getEnd();
    this.start = propertySignatureDeclaration.getStart(sourceFile, false);

    this.accessModifier = this.getAccessModifier(propertySignatureDeclaration);
    this.writeMode = this.getWriteMode(propertySignatureDeclaration);
    this.decorators = this.getDecorators(
      propertySignatureDeclaration,
      sourceFile,
    );
  }

  // #endregion Constructors
}
