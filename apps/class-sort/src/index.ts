import { sortClassMembers } from './sort-class-members';

// use commonjs default export so ESLint can find the rule
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
    'sort-class-members': sortClassMembers.getRule(),
  },
};
