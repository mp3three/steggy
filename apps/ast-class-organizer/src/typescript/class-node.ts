import { ClassDeclaration, Identifier, SourceFile } from 'typescript';

import { sort } from '../include';
import { ConstructorNode } from './constructor-node';
import { ElementNode } from './element-node';
import { GetterNode } from './getter-node';
import { IndexNode } from './index-node';
import { MethodNode } from './method-node';
import { PropertyNode } from './property-node';
import { SetterNode } from './setter-node';

export class ClassNode extends ElementNode {
  // #region Object Properties

  public constructors: ConstructorNode[] = [];
  public getters: GetterNode[] = [];
  public indexes: IndexNode[] = [];
  public isAbstract: boolean;
  public isStatic: boolean;
  public membersEnd = 0;
  public membersStart = 0;
  public methods: MethodNode[] = [];
  public properties: PropertyNode[] = [];
  public setters: SetterNode[] = [];

  // #endregion Object Properties

  // #region Constructors

  constructor(sourceFile: SourceFile, classDeclaration: ClassDeclaration) {
    super(classDeclaration);

    this.name = (<Identifier>classDeclaration.name).escapedText.toString();

    this.fullStart = classDeclaration.getFullStart();
    this.end = classDeclaration.getEnd();
    this.start = classDeclaration.getStart(sourceFile, false);

    if (classDeclaration.members && classDeclaration.members.length > 0) {
      this.membersStart = classDeclaration.members[0].getFullStart();
      this.membersEnd =
        classDeclaration.members[classDeclaration.members.length - 1].getEnd();
    }

    this.isAbstract = this.getIsAbstract(classDeclaration);
    this.isStatic = this.getIsStatic(classDeclaration);
    this.decorators = this.getDecorators(classDeclaration, sourceFile);
  }

  // #endregion Constructors

  // #region Private Accessors

  private get both(): (GetterNode | SetterNode)[] {
    return [...this.getters, ...this.setters];
  }

  // #endregion Private Accessors

  // #region Public Methods

  public getConstructors(groupWithDecorators: boolean): ConstructorNode[] {
    return this.constructors.sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPrivateAbstractGettersAndSetters(
    groupWithDecorators: boolean,
  ): GetterNode[] {
    return this.both
      .filter((x) => this.isPrivate(x) && !x.isStatic && x.isAbstract)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPrivateAbstractIndexes(groupWithDecorators: boolean): IndexNode[] {
    return this.indexes
      .filter((x) => this.isPrivate(x) && !x.isStatic && x.isAbstract)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPrivateAbstractMethods(groupWithDecorators: boolean): MethodNode[] {
    return this.methods
      .filter((x) => this.isPrivate(x) && !x.isStatic && x.isAbstract)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPrivateConstProperties(
    groupWithDecorators: boolean,
  ): PropertyNode[] {
    return this.properties
      .filter((x) => this.isPrivate(x) && this.isConstant(x) && !x.isStatic)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPrivateGettersAndSetters(
    groupWithDecorators: boolean,
  ): GetterNode[] {
    return this.both
      .filter((x) => this.isPrivate(x) && !x.isStatic && !x.isAbstract)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPrivateIndexes(groupWithDecorators: boolean): IndexNode[] {
    return this.indexes
      .filter((x) => this.isPrivate(x) && !x.isStatic && !x.isAbstract)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPrivateMethods(groupWithDecorators: boolean): MethodNode[] {
    return this.methods
      .filter((x) => this.isPrivate(x) && !x.isStatic && !x.isAbstract)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPrivateProperties(groupWithDecorators: boolean): PropertyNode[] {
    return this.properties
      .filter((x) => this.isPrivate(x) && this.isWritable(x) && !x.isStatic)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPrivateReadOnlyProperties(
    groupWithDecorators: boolean,
  ): PropertyNode[] {
    return this.properties
      .filter((x) => this.isPrivate(x) && this.isReadOnly(x) && !x.isStatic)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPrivateStaticConstProperties(
    groupWithDecorators: boolean,
  ): PropertyNode[] {
    return this.properties
      .filter((x) => this.isPrivate(x) && this.isConstant(x) && x.isStatic)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPrivateStaticGettersAndSetters(
    groupWithDecorators: boolean,
  ): (GetterNode | SetterNode)[] {
    return this.both
      .filter((x) => this.isPrivate(x) && x.isStatic && !x.isAbstract)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPrivateStaticIndexes(groupWithDecorators: boolean): IndexNode[] {
    return this.indexes
      .filter((x) => this.isPrivate(x) && x.isStatic && !x.isAbstract)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPrivateStaticMethods(groupWithDecorators: boolean): MethodNode[] {
    return this.methods
      .filter((x) => this.isPrivate(x) && x.isStatic && !x.isAbstract)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPrivateStaticProperties(
    groupWithDecorators: boolean,
  ): PropertyNode[] {
    return this.properties
      .filter((x) => this.isPrivate(x) && this.isWritable(x) && x.isStatic)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPrivateStaticReadOnlyProperties(
    groupWithDecorators: boolean,
  ): PropertyNode[] {
    return this.properties
      .filter((x) => this.isPrivate(x) && this.isReadOnly(x) && x.isStatic)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getProtectedAbstractGettersAndSetters(
    groupWithDecorators: boolean,
  ): (GetterNode | SetterNode)[] {
    return this.both
      .filter((x) => this.isProtected(x) && !x.isStatic && x.isAbstract)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getProtectedAbstractIndexes(
    groupWithDecorators: boolean,
  ): IndexNode[] {
    return this.indexes
      .filter((x) => this.isProtected(x) && !x.isStatic && x.isAbstract)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getProtectedAbstractMethods(
    groupWithDecorators: boolean,
  ): MethodNode[] {
    return this.methods
      .filter((x) => this.isProtected(x) && !x.isStatic && x.isAbstract)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getProtectedConstProperties(
    groupWithDecorators: boolean,
  ): PropertyNode[] {
    return this.properties
      .filter((x) => this.isProtected(x) && this.isConstant(x) && !x.isStatic)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getProtectedGettersAndSetters(
    groupWithDecorators: boolean,
  ): (GetterNode | SetterNode)[] {
    return this.both
      .filter((x) => this.isProtected(x) && !x.isStatic && !x.isAbstract)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getProtectedIndexes(groupWithDecorators: boolean): IndexNode[] {
    return this.indexes
      .filter((x) => this.isProtected(x) && !x.isStatic && !x.isAbstract)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getProtectedMethods(groupWithDecorators: boolean): MethodNode[] {
    return this.methods
      .filter((x) => this.isProtected(x) && !x.isStatic && !x.isAbstract)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getProtectedProperties(groupWithDecorators: boolean): PropertyNode[] {
    return this.properties
      .filter((x) => this.isProtected(x) && this.isWritable(x) && !x.isStatic)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getProtectedReadOnlyProperties(
    groupWithDecorators: boolean,
  ): PropertyNode[] {
    return this.properties
      .filter((x) => this.isProtected(x) && this.isReadOnly(x) && !x.isStatic)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getProtectedStaticConstProperties(
    groupWithDecorators: boolean,
  ): PropertyNode[] {
    return this.properties
      .filter((x) => this.isProtected(x) && this.isConstant(x) && x.isStatic)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getProtectedStaticGettersAndSetters(
    groupWithDecorators: boolean,
  ): (GetterNode | SetterNode)[] {
    return this.both
      .filter((x) => this.isProtected(x) && x.isStatic && !x.isAbstract)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getProtectedStaticIndexes(groupWithDecorators: boolean): IndexNode[] {
    return this.indexes
      .filter((x) => this.isProtected(x) && x.isStatic && !x.isAbstract)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getProtectedStaticMethods(groupWithDecorators: boolean): MethodNode[] {
    return this.methods
      .filter((x) => this.isProtected(x) && x.isStatic && !x.isAbstract)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getProtectedStaticProperties(
    groupWithDecorators: boolean,
  ): PropertyNode[] {
    return this.properties
      .filter((x) => this.isProtected(x) && this.isWritable(x) && x.isStatic)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getProtectedStaticReadOnlyProperties(
    groupWithDecorators: boolean,
  ): PropertyNode[] {
    return this.properties
      .filter((x) => this.isProtected(x) && this.isReadOnly(x) && x.isStatic)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPublicAbstractGettersAndSetters(
    groupWithDecorators: boolean,
  ): (GetterNode | SetterNode)[] {
    return this.both
      .filter((x) => this.isPublic(x) && !x.isStatic && x.isAbstract)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPublicAbstractIndexes(groupWithDecorators: boolean): IndexNode[] {
    return this.indexes
      .filter((x) => this.isPublic(x) && !x.isStatic && x.isAbstract)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPublicAbstractMethods(groupWithDecorators: boolean): MethodNode[] {
    return this.methods
      .filter((x) => this.isPublic(x) && !x.isStatic && x.isAbstract)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPublicConstProperties(
    groupWithDecorators: boolean,
  ): PropertyNode[] {
    return this.properties
      .filter((x) => this.isPublic(x) && this.isConstant(x) && !x.isStatic)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPublicGettersAndSetters(
    groupWithDecorators: boolean,
  ): (GetterNode | SetterNode)[] {
    return this.both
      .filter((x) => this.isPublic(x) && !x.isStatic && !x.isAbstract)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPublicIndexes(groupWithDecorators: boolean): IndexNode[] {
    return this.indexes
      .filter((x) => this.isPublic(x) && !x.isStatic && !x.isAbstract)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPublicMethods(groupWithDecorators: boolean): MethodNode[] {
    return this.methods
      .filter((x) => this.isPublic(x) && !x.isStatic && !x.isAbstract)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPublicProperties(groupWithDecorators: boolean): PropertyNode[] {
    return this.properties
      .filter((x) => this.isPublic(x) && this.isWritable(x) && !x.isStatic)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPublicReadOnlyProperties(
    groupWithDecorators: boolean,
  ): PropertyNode[] {
    return this.properties
      .filter((x) => this.isPublic(x) && this.isReadOnly(x) && !x.isStatic)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPublicStaticConstProperties(
    groupWithDecorators: boolean,
  ): IndexNode[] {
    return this.indexes
      .filter((x) => this.isPublic(x) && this.isConstant(x) && x.isStatic)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPublicStaticGettersAndSetters(
    groupWithDecorators: boolean,
  ): (GetterNode | SetterNode)[] {
    return this.both
      .filter((x) => this.isPublic(x) && x.isStatic && !x.isAbstract)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPublicStaticIndexes(groupWithDecorators: boolean): IndexNode[] {
    return this.indexes
      .filter((x) => this.isPublic(x) && x.isStatic && !x.isAbstract)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPublicStaticMethods(groupWithDecorators: boolean): MethodNode[] {
    return this.methods
      .filter((x) => this.isPublic(x) && x.isStatic && !x.isAbstract)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPublicStaticProperties(
    groupWithDecorators: boolean,
  ): PropertyNode[] {
    return this.properties
      .filter((x) => this.isPublic(x) && this.isWritable(x) && x.isStatic)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  public getPublicStaticReadOnlyProperties(
    groupWithDecorators: boolean,
  ): PropertyNode[] {
    return this.properties
      .filter((x) => this.isPublic(x) && this.isReadOnly(x) && x.isStatic)
      .sort((a, b) => sort(a, b, groupWithDecorators));
  }

  // #endregion Public Methods
}
