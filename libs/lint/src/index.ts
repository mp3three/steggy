import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { RuleContext } from '@typescript-eslint/experimental-utils/dist/ts-eslint';

import { CLASS_SORT_SCHEMA } from './schemas';

type ClassDeclaration = TSESTree.ClassDeclaration;
type MethodDefinition = TSESTree.MethodDefinition;

const createESLintRule = ESLintUtils.RuleCreator(() => ``);

export default {
  configs: {
    recommended: {
      plugins: ['sort-class-members'],
      rules: {
        'sort-class-members/sort-class-members': [
          2,
          {
            accessorPairPositioning: 'getThenSet',
            order: [
              '[static-properties]',
              '[static-methods]',
              '[properties]',
              '[conventional-private-properties]',
              'constructor',
              '[methods]',
              '[conventional-private-methods]',
            ],
          },
        ],
      },
    },
  },
  rules: {
    'protected-init': createESLintRule({
      create(context: Readonly<RuleContext<never, unknown[]>>) {
        const source = context.getSourceCode();

        context;
        return {
          MethodDefinition(node: MethodDefinition) {
            // if( node.accessibility ===)
            console.log(node);
            // if (node.key === 'test') {
            //
            // }
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
      name: 'protected-init',
    }),
    'sort-class-members': createESLintRule({
      create(context: Readonly<RuleContext<never, unknown[]>>) {
        const source = context.getSourceCode();

        context;
        return {
          ClassDeclaration(node: ClassDeclaration) {
            const members = node.body.body;
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
    }),
  },
};
