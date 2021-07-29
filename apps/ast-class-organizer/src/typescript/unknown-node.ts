import { Node, SourceFile } from 'typescript';

import { ElementNode } from './element-node';

export class UnknownNode extends ElementNode {
  // #region Constructors

  constructor(sourceFile: SourceFile, unknownNode: Node) {
    super(unknownNode);

    this.name = 'unknown';

    this.fullStart = unknownNode.getFullStart();
    this.end = unknownNode.getEnd();
    this.start = unknownNode.getStart(sourceFile, false);
  }

  // #endregion Constructors
}
