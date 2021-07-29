import { Identifier, InterfaceDeclaration, SourceFile } from 'typescript';

import { sort } from '../include';
import { ElementNode } from './element-node';
import { IndexSignatureNode } from './index-signature-node';
import { MethodSignatureNode } from './method-signature-node';
import { PropertySignatureNode } from './property-signature-node';

export class InterfaceNode extends ElementNode {
  // #region Object Properties

  public indexes: IndexSignatureNode[] = [];
  public membersEnd = 0;
  public membersStart = 0;
  public methods: MethodSignatureNode[] = [];
  public properties: PropertySignatureNode[] = [];

  // #endregion Object Properties

  // #region Constructors

  constructor(
    sourceFile: SourceFile,
    interfaceDeclaration: InterfaceDeclaration,
  ) {
    super(interfaceDeclaration);

    this.name = (<Identifier>interfaceDeclaration.name).escapedText.toString();

    this.fullStart = interfaceDeclaration.getFullStart();
    this.end = interfaceDeclaration.getEnd();
    this.start = interfaceDeclaration.getStart(sourceFile, false);

    if (
      interfaceDeclaration.members &&
      interfaceDeclaration.members.length > 0
    ) {
      this.membersStart = interfaceDeclaration.members[0].getFullStart();
      this.membersEnd =
        interfaceDeclaration.members[
          interfaceDeclaration.members.length - 1
        ].getEnd();
    }
  }

  // #endregion Constructors

  // #region Public Methods

  public getConstProperties(
    groupWithDecorators: boolean,
  ): PropertySignatureNode[] {
    return this.properties
      .filter((x) => this.isConstant(x))
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getIndexes(groupWithDecorators: boolean): IndexSignatureNode[] {
    return this.indexes.sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getMethods(groupWithDecorators: boolean): MethodSignatureNode[] {
    return this.methods.sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getProperties(groupWithDecorators: boolean): PropertySignatureNode[] {
    return this.properties
      .filter((x) => this.isWritable(x))
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getReadOnlyProperties(
    groupWithDecorators: boolean,
  ): PropertySignatureNode[] {
    return this.properties
      .filter((x) => this.isReadOnly(x))
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  // #endregion Public Methods
}
