import {
  Identifier,
  PropertyDeclaration,
  SourceFile,
  SyntaxKind,
} from 'typescript';

import { WriteModifier } from '../typings';
import { ElementNode } from './element-node';

export class PropertyNode extends ElementNode {
  // #region Object Properties

  public isAbstract: boolean;
  public isArrowFunction: boolean;
  public isStatic: boolean;
  public writeMode: WriteModifier = WriteModifier.writable;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    sourceFile: SourceFile,
    propertyDeclaration: PropertyDeclaration,
  ) {
    super(propertyDeclaration);

    this.name = (<Identifier>propertyDeclaration.name).escapedText.toString();

    this.fullStart = propertyDeclaration.getFullStart();
    this.end = propertyDeclaration.getEnd();
    this.start = propertyDeclaration.getStart(sourceFile, false);

    this.accessModifier = this.getAccessModifier(propertyDeclaration);
    this.isAbstract = this.getIsAbstract(propertyDeclaration);
    this.isStatic = this.getIsStatic(propertyDeclaration);
    this.writeMode = this.getWriteMode(propertyDeclaration);
    this.decorators = this.getDecorators(propertyDeclaration, sourceFile);

    this.isArrowFunction = this.getIsArrowFunction(propertyDeclaration);
  }

  // #endregion Constructors

  // #region Private Methods

  private getIsArrowFunction(propertyDeclaration: PropertyDeclaration) {
    return (
      typeof propertyDeclaration.initializer !== 'undefined' &&
      propertyDeclaration.initializer.kind === SyntaxKind.ArrowFunction
    );
  }

  // #endregion Private Methods
}
