import {
  ClassNode,
  ElementNode,
  EnumNode,
  FunctionNode,
  ImportNode,
  InterfaceNode,
  TypeAliasNode,
} from '../typescript';

export function compare<T extends string | number = string>(
  a: T,
  b: T,
): 0 | 1 | -1 {
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  return 0;
}

export function getTypeAliases(
  nodes: ElementNode[],
  groupWithDecorators: boolean,
): ElementNode[] {
  return nodes
    .filter((x) => x instanceof TypeAliasNode)
    .sort((a, b) => sort(a, b, groupWithDecorators));
}

export function getInterfaces(
  nodes: ElementNode[],
  groupWithDecorators: boolean,
): ElementNode[] {
  return nodes
    .filter((x) => x instanceof InterfaceNode)
    .sort((a, b) => sort(a, b, groupWithDecorators));
}

export function getClasses(
  nodes: ElementNode[],
  groupWithDecorators: boolean,
): ElementNode[] {
  return nodes
    .filter((x) => x instanceof ClassNode)
    .sort((a, b) => sort(a, b, groupWithDecorators));
}

export function getEnums(
  nodes: ElementNode[],
  groupWithDecorators: boolean,
): ElementNode[] {
  return nodes
    .filter((x) => x instanceof EnumNode)
    .sort((a, b) => sort(a, b, groupWithDecorators));
}

export function getImports(
  nodes: ElementNode[],
  groupWithDecorators: boolean,
): ElementNode[] {
  return nodes
    .filter((x) => x instanceof ImportNode)
    .sort((a, b) => sort(a, b, groupWithDecorators));
}

export function getFunctions(
  nodes: ElementNode[],
  groupWithDecorators: boolean,
): ElementNode[] {
  return nodes
    .filter((x) => x instanceof FunctionNode)
    .sort((a, b) => sort(a, b, groupWithDecorators));
}

export function getName(
  node: ElementNode,
  groupWithDecorators: boolean,
): string {
  if (groupWithDecorators && node.decorators.length > 0) {
    return node.decorators.join(', ') + ' ' + node.name;
  }

  return node.name;
}

export function sort<T extends ElementNode>(
  a: T,
  b: T,
  groupWithDecorators: boolean,
): 0 | 1 | -1 {
  return compare(
    getName(a, groupWithDecorators),
    getName(b, groupWithDecorators),
  );
}
