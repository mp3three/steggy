import { TSESTree } from '@typescript-eslint/experimental-utils';

type element = TSESTree.ClassElement;
export const comparers = [
  {
    property: 'name',
    test(m: element, s: element): boolean {
      return s.testName(m.name);
    },
    value: 100,
  },
  {
    property: 'type',
    test(m: element, s: element): boolean {
      return s.type === m.type;
    },
    value: 10,
  },
  {
    property: 'static',
    test(m: element, s: element): boolean {
      return s.static === m.static;
    },
    value: 10,
  },
  {
    property: 'async',
    test(m: element, s: element): boolean {
      return s.async === m.async;
    },
    value: 10,
  },
  {
    property: 'kind',
    test(m: element, s: element): boolean {
      return s.kind === m.kind;
    },
    value: 10,
  },
  {
    property: 'private',
    test(m: element, s: element): boolean {
      return s.private === m.private;
    },
    value: 10,
  },
  {
    property: 'groupByDecorator',
    test: (m, s) => m.decorators.includes(s.groupByDecorator),
    value: 10,
  },
  {
    property: 'accessorPair',
    test: (m, s) =>
      (s.accessorPair && m.matchingAccessor) ||
      (s.accessorPair === false && !m.matchingAccessor),
    value: 20,
  },
  {
    property: 'propertyType',
    test: (m, s) => m.type === 'property' && s.propertyType === m.propertyType,
    value: 11,
  },
];
