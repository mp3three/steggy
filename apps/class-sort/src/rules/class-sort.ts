import { ESLintUtils } from '@typescript-eslint/experimental-utils';
import {
  RuleContext,
  SourceCode,
} from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import JSON from 'comment-json';
import { readFileSync } from 'fs';
import { join } from 'path';

import { PluginOptions, Slot } from '../typings';
import { SCHEMA } from '../typings/schema';

const createESLintRule = ESLintUtils.RuleCreator(() => ``);

function getClassMemberInfos(
  classDeclaration,
  sourceCode: SourceCode,
  orderedSlots,
) {
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

function getAcceptableSlots(memberInfo, orderedSlots) {
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

function isAccessor({ kind }) {
  return ['get', 'set'].includes(kind);
}

function forEachPair(list, callback) {
  list.forEach((first, firstIndex) => {
    list.slice(firstIndex + 1).forEach((second, secondIndex) => {
      callback(first, second, firstIndex, firstIndex + secondIndex + 1);
    });
  });
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

function getMemberInfo(node, sourceCode) {
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

function getNameComparer(name) {
  if (name[0] === '/') {
    let namePattern = name.slice(1, -2);

    if (namePattern[0] !== '^') {
      namePattern = `^${namePattern}`;
    }

    if (namePattern[namePattern.length - 1] !== '$') {
      namePattern += '$';
    }

    return (n) => {
      // eslint-disable-next-line security/detect-non-literal-regexp
      return new RegExp(namePattern).test(n);
    };
  }
  return (n) => n === name;
}

function expandSlot(input, groups) {
  if (Array.isArray(input)) {
    return input.map((x) => expandSlot(x, groups));
  }

  let slot: Slot;
  if (typeof input === 'string') {
    slot =
      input[0] === '[' // check for [groupName] shorthand
        ? { group: input.slice(1, -2) }
        : { name: input };
  } else {
    slot = { ...input };
  }

  if (slot.group) {
    if (typeof groups[slot.group] !== 'undefined') {
      return expandSlot(groups[slot.group], groups);
    }
    // ignore undefined groups
    return [];
  }

  const testName = slot.name && getNameComparer(slot.name);
  if (testName) {
    slot.testName = testName;
  }

  return [slot];
}

function flatten<T>(collection: (T | T[])[]): T[] {
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

function getExpectedOrder(order, groups) {
  return flatten(order.map((s) => expandSlot(s, groups)));
}

function findAccessorPairProblems(members, positioning) {
  const problems = [];
  if (positioning === 'any') {
    return problems;
  }
  forEachPair(members, (first, second, firstIndex, secondIndex) => {
    if (first.matchingAccessor === second.id) {
      const outOfOrder =
        (positioning === 'getThenSet' && first.kind !== 'get') ||
        (positioning === 'setThenGet' && first.kind !== 'set');
      const outOfPosition = secondIndex - firstIndex !== 1;
      if (outOfOrder || outOfPosition) {
        const expected = outOfOrder ? 'before' : 'after';
        problems.push({ expected, source: second, target: first });
      }
    }
  });
  return problems;
}

function areSlotsAlphabeticallySorted(a, b) {
  return a.sort === 'alphabetical' && b.sort === 'alphabetical';
}

function areMembersInCorrectOrder(first, second, collator) {
  return first.acceptableSlots.some((a) =>
    second.acceptableSlots.some((b) =>
      a.index === b.index && areSlotsAlphabeticallySorted(a, b)
        ? collator.compare(first.name, second.name) <= 0
        : a.index <= b.index,
    ),
  );
}

function findProblems(members, locale) {
  const problems = [];
  const collator = new Intl.Collator(locale);

  forEachPair(members, (first, second) => {
    if (!areMembersInCorrectOrder(first, second, collator)) {
      problems.push({ expected: 'before', source: second, target: first });
    }
  });

  return problems;
}

export default createESLintRule({
  create(context, options: PluginOptions[]) {
    const defaults: PluginOptions = {};
    const config = options[0];
    // context.

    const stopAfterFirst = !!config.stopAfterFirstProblem;
    const accessorPairPositioning =
      config.accessorPairPositioning || 'getThenSet';
    const order = config.order || defaults.order || [];
    const groups = { ...builtInGroups, ...defaults.groups, ...config.groups };
    const orderedSlots = getExpectedOrder(order, groups);
    const groupAccessors = accessorPairPositioning !== 'any';
    const locale = config.locale || 'en-US';

    // const order = [];
    // const groups = {};
    // const orderedSlots = getExpectedOrder(order, groups);

    return {
      ClassDeclaration(node) {
        const sourceCode = context.getSourceCode();

        const classMemberNodes = node.body.body;
        let members = classMemberNodes
          .map((member, i) => ({
            ...getMemberInfo(member, sourceCode),
            id: String(i),
          }))
          .map((memberInfo, i, memberInfos) => {
            matchAccessorPairs(memberInfos);
            const acceptableSlots = getAcceptableSlots(
              memberInfo,
              orderedSlots,
            );
            return { ...memberInfo, acceptableSlots };
          });
        const accessorPairProblems = findAccessorPairProblems(
          members,
          accessorPairPositioning,
        );
        accessorPairProblems.every((problem) => {
          const message =
            'Expected {{ source }} to come immediately {{ expected }} {{ target }}.';

          // reportProblem({
          //   context,
          //   message,
          //   problem,
          //   problemCount,
          //   stopAfterFirst,
          // });
          if (stopAfterFirst) {
            return false;
          }
          return true;
        });

        //
        members = members.filter(
          (m) => !(m.matchingAccessor && !m.isFirstAccessor),
        );

        // ignore members that don't match any slots
        members = members.filter((member) => member.acceptableSlots.length);

        const problems = findProblems(members, locale);
        const problemCount = problems.length;
        problems.forEach((problem) => {
          const message =
            'Expected {{ source }} to come {{ expected }} {{ target }}.';
          // reportProblem({
          //   context,
          //   groupAccessors,
          //   message,
          //   problem,
          //   problemCount,
          //   stopAfterFirst,
          // });

          if (stopAfterFirst) {
            return false;
          }
          return true;
        });
      },
    };
  },
  defaultOptions: [],
  meta: {
    docs: {
      category: 'Stylistic Issues',
      description:
        'Ensure standard class members are consistently sorted and grouped',
      recommended: 'error',
    },
    fixable: 'code',
    messages: {
      // noRelativeOrAbsoluteImportsAcrossLibraries: `Libraries cannot be imported by a relative or absolute path, and must begin with a npm scope`,
      // noCircularDependencies: `Circular dependency between "{{sourceProjectName}}" and "{{targetProjectName}}" detected: {{path}}`,
      // noSelfCircularDependencies: `Projects should use relative imports to import from other files within the same project. Use "./path/to/file" instead of import from "{{imp}}"`,
      // noImportsOfApps: 'Imports of apps are forbidden',
      // noImportsOfE2e: 'Imports of e2e projects are forbidden',
      // noImportOfNonBuildableLibraries:
      //   'Buildable libraries cannot import or export from non-buildable libraries',
      // noImportsOfLazyLoadedLibraries: `Imports of lazy-loaded libraries are forbidden`,
      // projectWithoutTagsCannotHaveDependencies: `A project without tags cannot depend on any libraries`,
      // tagConstraintViolation: `A project tagged with "{{sourceTag}}" can only depend on libs tagged with {{allowedTags}}`,
    },
    schema: SCHEMA,
    type: 'suggestion',
  },
  name: 'class-sort',
});
