import {
  Identifier,
  MethodDeclaration,
  PropertyDeclaration,
  SourceFile,
} from 'typescript';

import { ElementNode } from './element-node';

export class MethodNode extends ElementNode {
  // #region Object Properties

  public isAbstract: boolean;
  public isStatic: boolean;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    sourceFile: SourceFile,
    methodDeclaration: MethodDeclaration | PropertyDeclaration,
  ) {
    super(methodDeclaration);

    this.name = (<Identifier>methodDeclaration.name).escapedText.toString();

    this.fullStart = methodDeclaration.getFullStart();
    this.end = methodDeclaration.getEnd();
    this.start = methodDeclaration.getStart(sourceFile, false);

    this.accessModifier = this.getAccessModifier(methodDeclaration);
    this.isAbstract = this.getIsAbstract(methodDeclaration);
    this.isStatic = this.getIsStatic(methodDeclaration);
    this.decorators = this.getDecorators(methodDeclaration, sourceFile);
  }

  // #endregion Constructors
}
