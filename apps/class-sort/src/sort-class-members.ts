import { ClassDeclaration } from 'estree';
import { readFileSync } from 'fs';

import { Rule, SourceCode } from './eslint';
import {
  DefaultsDTO,
  PluginOptions,
  Problems,
  ReportData,
  ReportProblemParameters,
  Slot,
} from './typings';

export const sortClassMembers = {
  getRule(defaults: DefaultsDTO = {}): unknown | void {
    function sortClassMembersRule(context: Rule.RuleContext<PluginOptions>) {
      const options: PluginOptions = context.options[0] || {};
      const stopAfterFirst = !!options.stopAfterFirstProblem;
      const accessorPairPositioning =
        options.accessorPairPositioning || 'getThenSet';
      const order = options.order || defaults.order || [];
      const groups = {
        ...builtInGroups,
        ...defaults.groups,
        ...options.groups,
      };
      const orderedSlots = getExpectedOrder(order, groups);
      const groupAccessors = accessorPairPositioning !== 'any';
      const locale = options.locale || 'en-US';

      const rules: Record<string, unknown> = {
        ClassDeclaration(node) {
          let members = getClassMemberInfos(
            node,
            context.getSourceCode(),
            orderedSlots,
          );

          // check for out-of-order and separated get/set pairs
          const accessorPairProblems = findAccessorPairProblems(
            members,
            accessorPairPositioning,
          );
          accessorPairProblems.every((problem) => {
            const message =
              'Expected {{ source }} to come immediately {{ expected }} {{ target }}.';

            reportProblem({
              context,
              message,
              problem,
              problemCount,
              stopAfterFirst,
            });
            if (stopAfterFirst) {
              return false;
            }
            return true;
          });

          // filter out the second accessor in each pair so we only detect one problem
          // for out-of-order	accessor pairs
          members = members.filter(
            (m) => !(m.matchingAccessor && !m.isFirstAccessor),
          );

          // ignore members that don't match any slots
          members = members.filter((member) => member.acceptableSlots.length);

          // check member positions against rule order
          const problems = findProblems(members, locale);
          const problemCount = problems.length;
          problems.forEach((problem) => {
            const message =
              'Expected {{ source }} to come {{ expected }} {{ target }}.';
            reportProblem({
              context,
              groupAccessors,
              message,
              problem,
              problemCount,
              stopAfterFirst,
            });

            if (stopAfterFirst) {
              return false;
            }
            return true;
          });
        },
      };

      rules.ClassExpression = rules.ClassDeclaration;

      return rules;
    }

    sortClassMembersRule.schema = JSON.parse(
      readFileSync(`schemas/json/sort-class-members.schema.json`, 'utf-8'),
    );
    sortClassMembersRule.fixable = 'code';
    return sortClassMembersRule;
  },
};

function reportProblem({
  problem,
  message,
  context,
  stopAfterFirst,
  problemCount,
  groupAccessors,
}: ReportProblemParameters) {
  const { source, target, expected } = problem as Problems;
  const reportData: ReportData = {
    expected,
    source: getMemberDescription(source, { groupAccessors }),
    target: getMemberDescription(target, { groupAccessors }),
  };

  if (stopAfterFirst && problemCount > 1) {
    message += ' ({{ more }} similar {{ problem }} in this class)';
    reportData.more = problemCount - 1;
    reportData.problem = problemCount === 2 ? 'problem' : 'problems';
  }

  context.report({
    data: reportData,
    fix(fixer) {
      const fixes = [];
      if (expected !== 'before') {
        return fixes; // after almost never occurs, and when it does it causes conflicts
      }
      const sourceCode = context.getSourceCode();
      const sourceAfterToken = sourceCode.getTokenAfter(source.node);

      // const sourceJSDocument: ESTree.Node = sourceCode
      //   .getCommentsBefore(source.node)
      //   .slice(-1)
      //   .pop();
      const targetJSDocument = sourceCode
        .getCommentsBefore(target.node)
        .slice(-1)
        .pop();
      const decorators = target.node.decorators || [];
      const targetDecorator = decorators.slice(-1).pop() || {};
      const insertTargetNode =
        targetJSDocument || targetDecorator.node || target.node;
      const sourceText = [];

      // if (sourceJSDocument) {
      //   fixes.push(fixer.remove(sourceJSDocument));
      //   sourceText.push(
      //     `${sourceCode.getText(sourceJSDocument)}${determineNodeSeperator(
      //       sourceJSDocument,
      //       source.node,
      //     )}`,
      //   );
      // }

      fixes.push(fixer.remove(source.node));
      sourceText.push(
        `${sourceCode.getText(source.node)}${determineNodeSeperator(
          source.node,
          sourceAfterToken,
        )}`,
      );
      fixes.push(fixer.insertTextBefore(insertTargetNode, sourceText.join('')));
      return fixes;
    },
    message,
    node: source.node,
  });
}

function determineNodeSeperator(first, second) {
  return isTokenOnSameLine(first, second) ? ' ' : '\n';
}

function isTokenOnSameLine(left, right) {
  return left.loc.end.line === right.loc.start.line;
}

function getMemberDescription(member, { groupAccessors }) {
  if (member.kind === 'constructor') {
    return 'constructor';
  }

  let typeName;
  if (member.matchingAccessor && groupAccessors) {
    typeName = 'accessor pair';
  } else if (isAccessor(member)) {
    typeName = `${member.kind}ter`;
  } else {
    typeName = member.type;
  }

  return `${member.static ? 'static ' : ''}${typeName} ${member.name}`;
}

function getClassMemberInfos(
  classDeclaration: ClassDeclaration,
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

function forEachPair(list, callback) {
  list.forEach((first, firstIndex) => {
    list.slice(firstIndex + 1).forEach((second, secondIndex) => {
      callback(first, second, firstIndex, firstIndex + secondIndex + 1);
    });
  });
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

function areSlotsAlphabeticallySorted(a, b) {
  return a.sort === 'alphabetical' && b.sort === 'alphabetical';
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

function getExpectedOrder(order, groups) {
  return flatten(order.map((s) => expandSlot(s, groups)));
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

function isAccessor({ kind }) {
  return ['get', 'set'].includes(kind);
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
