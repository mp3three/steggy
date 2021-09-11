import { JSONSchema4 } from '@typescript-eslint/experimental-utils/dist/json-schema';

export const CLASS_SORT_SCHEMA: JSONSchema4 = {
  additionalProperties: false,
  properties: {
    accessorPairPositioning: {
      enum: ['getThenSet', 'setThenGet', 'together', 'any'],
    },
    groups: {
      additionalProperties: false,
      patternProperties: {
        '^.+$': {
          additionalProperties: false,
          properties: {
            abstract: {
              type: 'boolean',
            },
            accessorPair: {
              type: 'boolean',
            },
            async: {
              type: 'boolean',
            },
            kind: {
              enum: ['get', 'set'],
            },
            modifier: {
              enum: ['private', 'protected', 'public'],
            },
            name: {
              type: 'string',
            },
            readonly: {
              type: 'boolean',
            },
            requireAccessibility: {
              type: 'boolean',
            },
            sort: {
              enum: ['alphabetical', 'none'],
            },
            static: {
              type: 'boolean',
            },
            type: {
              enum: ['method', 'property'],
            },
          },
          type: 'object',
        },
      },
    },
    locale: {
      type: 'string',
    },
    order: {
      items: {
        type: 'string',
      },
    },
    stopAfterFirstProblem: {
      type: 'boolean',
    },
  },
  type: 'object',
};
