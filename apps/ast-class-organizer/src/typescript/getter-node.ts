import { GetAccessorDeclaration, Identifier, SourceFile } from 'typescript';

import { ElementNode } from './element-node';

export class GetterNode extends ElementNode {
  // #region Object Properties

  public isAbstract: boolean;
  public isStatic: boolean;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    sourceFile: SourceFile,
    getterDeclaration: GetAccessorDeclaration,
  ) {
    super(getterDeclaration);

    this.name = (<Identifier>getterDeclaration.name).escapedText.toString();

    this.fullStart = getterDeclaration.getFullStart();
    this.end = getterDeclaration.getEnd();
    this.start = getterDeclaration.getStart(sourceFile, false);

    this.accessModifier = this.getAccessModifier(getterDeclaration);
    this.isAbstract = this.getIsAbstract(getterDeclaration);
    this.isStatic = this.getIsStatic(getterDeclaration);
    this.decorators = this.getDecorators(getterDeclaration, sourceFile);
  }

  // #endregion Constructors
}
