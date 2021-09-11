import { CLASS_SORT_RULE } from './rules/class-sort';

const LINT_RULES = {
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
    'sort-class-members': CLASS_SORT_RULE,
  },
};

export default LINT_RULES;
