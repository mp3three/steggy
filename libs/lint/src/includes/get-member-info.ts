import { TSESTree } from '@typescript-eslint/experimental-utils';
import { SourceCode } from '@typescript-eslint/experimental-utils/dist/ts-eslint';

import { Slot } from '../typings';
import { comparers } from './class-sort-comparers';

type ClassDeclaration = TSESTree.ClassDeclaration;
type ClassElement = TSESTree.MethodDefinition | TSESTree.ClassProperty;

export function getClassMemberInfos(
  classDeclaration: ClassDeclaration,
  sourceCode: SourceCode,
  orderedSlots: Slot[],
): (ClassElement & { id: string; acceptableSlots: unknown })[] {
  const classMemberNodes = classDeclaration.body.body;

  const members = classMemberNodes
    .map((member, i) => ({
      ...getMemberInfo(member, sourceCode),
      id: String(i),
    }))
    .map((memberInfo, i, memberInfos) => {
      matchAccessorPairs(memberInfos);
      const acceptableSlots = getAcceptableSlots(memberInfo, orderedSlots);
      return { ...memberInfo, acceptableSlots };
    });

  return members;
}

function getMemberInfo(node: ClassElement, sourceCode: SourceCode) {
  const decorators =
    (!!node.decorators &&
      node.decorators.map((n) =>
        n.expression.type === 'CallExpression'
          ? n.expression.callee.name
          : n.expression.name,
      )) ||
    [];

  if (node.type === 'ClassProperty') {
    const [first, second] = sourceCode.getFirstTokens(node.key, 2);

    return {
      accessibility: node.accessibility || 'public',
      async: false,
      decorators,
      kind: node.kind,
      name: second && second.type === 'Identifier' ? second.value : first.value,
      node,
      propertyType: node.value ? node.value.type : node.value,
      static: node.static,
      type: 'property',
    };
  }
  let name: string;
  if (node.computed) {
    const keyBeforeToken = sourceCode.getTokenBefore(node.key);
    const keyAfterToken = sourceCode.getTokenAfter(node.key);
    name = sourceCode
      .getText()
      .slice(keyBeforeToken.range[0], keyAfterToken.range[1]);
  } else {
    name = node.key.name;
  }

  return {
    accessibility: node.accessibility || 'public',
    async: node.value && node.value.async,
    decorators,
    kind: node.kind,
    name,
    node,
    propertyType: undefined,
    static: node.static,
    type: 'method',
  };
}
function matchAccessorPairs(members) {
  forEachPair(members, (first, second) => {
    const isMatch =
      first.name === second.name && first.static === second.static;
    if (isAccessor(first) && isAccessor(second) && isMatch) {
      first.isFirstAccessor = true;
      first.matchingAccessor = second.id;
      second.matchingAccessor = first.id;
    }
  });
}

function forEachPair(list, callback) {
  list.forEach((first, firstIndex) => {
    list.slice(firstIndex + 1).forEach((second, secondIndex) => {
      callback(first, second, firstIndex, firstIndex + secondIndex + 1);
    });
  });
}

function isAccessor({ kind }) {
  return ['get', 'set'].includes(kind);
}

function getAcceptableSlots(memberInfo, orderedSlots: Slot[]) {
  return orderedSlots
    .map((slot, index) => ({
      index,
      score: scoreMember(memberInfo, slot),
      sort: slot.sort,
    })) // check member against each slot
    .filter(({ score }) => score > 0) // discard slots that don't match
    .sort((a, b) => b.score - a.score) // sort best matching slots first
    .filter(({ score }, i, array) => score === array[0].score) // take top scoring slots
    .sort((a, b) => b.index - a.index);
}

function scoreMember(memberInfo, slot) {
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
