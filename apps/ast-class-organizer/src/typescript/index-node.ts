import { IndexedAccessTypeNode, SourceFile } from 'typescript';

import { WriteModifier } from '../typings';
import { ElementNode } from './element-node';

export class IndexNode extends ElementNode {
  // #region Object Properties

  public isAbstract: boolean;
  public isStatic: boolean;
  public writeMode: WriteModifier = WriteModifier.writable;

  // #endregion Object Properties

  // #region Constructors

  constructor(sourceFile: SourceFile, indexDeclaration: IndexedAccessTypeNode) {
    super(indexDeclaration);

    this.name = 'index';

    this.fullStart = indexDeclaration.getFullStart();
    this.end = indexDeclaration.getEnd();
    this.start = indexDeclaration.getStart(sourceFile, false);

    this.accessModifier = this.getAccessModifier(indexDeclaration);
    this.isAbstract = this.getIsAbstract(indexDeclaration);
    this.isStatic = this.getIsStatic(indexDeclaration);
    this.writeMode = this.getWriteMode(indexDeclaration);
    this.decorators = this.getDecorators(indexDeclaration, sourceFile);
  }

  // #endregion Constructors
}
