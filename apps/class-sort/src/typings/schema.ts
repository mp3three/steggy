import { JSONSchema4 } from 'json-schema';

export interface SortClassMemberOptionsSchema {
  order?: string[];
  groups?: Record<string, OrderItem>;
  locale?: string;
  stopAfterFirstProblem?: boolean;
  accessorPairPositioning?: 'getThenSet' | 'setThenGet' | 'together' | 'any';
}
export interface OrderItem {
  accessorPair?: boolean;
  async?: boolean;
  kind?: 'get' | 'set';
  readonly?: boolean;
  modifier?: 'private' | 'protected' | 'public';
  name?: string;
  propertyType?: string;
  requireAccessibility?: boolean;
  sort?: 'alphabetical' | 'none';
  static?: boolean;
  abstract?: boolean;
  type?: 'method' | 'boolean';
}
export const SCHEMA: JSONSchema4 = {
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
