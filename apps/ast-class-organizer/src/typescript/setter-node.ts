import { Identifier, SetAccessorDeclaration, SourceFile } from 'typescript';

import { ElementNode } from './element-node';

export class SetterNode extends ElementNode {
  // #region Object Properties

  public isAbstract: boolean;
  public isStatic: boolean;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    sourceFile: SourceFile,
    setterDeclaration: SetAccessorDeclaration,
  ) {
    super(setterDeclaration);

    this.name = (<Identifier>setterDeclaration.name).escapedText.toString();

    this.fullStart = setterDeclaration.getFullStart();
    this.end = setterDeclaration.getEnd();
    this.start = setterDeclaration.getStart(sourceFile, false);

    this.accessModifier = this.getAccessModifier(setterDeclaration);
    this.isAbstract = this.getIsAbstract(setterDeclaration);
    this.isStatic = this.getIsStatic(setterDeclaration);
    this.decorators = this.getDecorators(setterDeclaration, sourceFile);
  }

  // #endregion Constructors
}
