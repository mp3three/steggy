import { Comparer, Slot } from '../typings';

const comparers: Comparer[] = [
  { property: 'name', test: (m, s) => s.testName(m.name), value: 100 },
  { property: 'type', test: (m, s) => s.type === m.type, value: 10 },
  { property: 'static', test: (m, s) => s.static === m.static, value: 10 },
  { property: 'async', test: (m, s) => s.async === m.async, value: 10 },
  { property: 'kind', test: (m, s) => s.kind === m.kind, value: 10 },
  { property: 'private', test: (m, s) => s.private === m.private, value: 10 },
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

export class ClassSortRule {
  private flatten<T>(collection: (T | T[])[]): T[] {
    const out = [];
    collection.forEach((item) => {
      if (Array.isArray(item)) {
        out.push(...item);
        return;
      }
      out.push(item);
    });
    return out;
  }

  private scoreMember(memberInfo, slot: Slot) {
    if (Object.keys(slot).length === 0) {
      return 1; // default/everything-else slot
    }

    const scores = comparers.map(({ property, value, test }) => {
      if (slot[property] !== undefined) {
        return test(memberInfo, slot) ? value : -1;
      }
      return 0;
    });

    if (scores.includes(-1)) {
      return -1;
    }

    // eslint-disable-next-line unicorn/no-array-reduce
    return scores.reduce((a, b) => a + b);
  }
}
