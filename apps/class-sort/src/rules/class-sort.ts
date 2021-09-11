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

export default createESLintRule({
  create(context, options: PluginOptions[]) {
    return {
      ClassDeclaration(node) {
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
    schema: SCHEMA,
    type: 'suggestion',
  },
  name: 'class-sort',
});
