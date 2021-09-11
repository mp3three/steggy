import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { RuleContext } from '@typescript-eslint/experimental-utils/dist/ts-eslint';

import { CLASS_SORT_SCHEMA } from '../schemas';

const createESLintRule = ESLintUtils.RuleCreator(() => ``);

export const CLASS_SORT_RULE = createESLintRule({
  create(context: Readonly<RuleContext<never, unknown[]>>) {
    context;
    return {
      ClassDeclaration(node: TSESTree.ClassDeclaration) {
        node;
        //
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
    schema: CLASS_SORT_SCHEMA,
    type: 'suggestion',
  },
  name: 'class-sort',
});
