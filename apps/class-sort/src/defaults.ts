const builtInGroups = {
  constructor: { name: 'constructor', type: 'method' },
  'private-abstract-methods': [
    { abstract: true, modfier: 'private', type: 'method' },
  ],
  'private-accessor-pairs': { accessorPair: true, modifier: 'private' },
  'private-getters': { kind: 'get', modifier: 'private' },
  'private-methods': [{ modfier: 'private', type: 'method' }],
  'private-properties': [{ modfier: 'private', type: 'property' }],
  'private-readonly-properties': [
    { modfier: 'private', readonly: true, type: 'property' },
  ],
  'private-setters': { kind: 'set', modifier: 'private' },
  'private-static-methods': [
    { modfier: 'private', static: true, type: 'method' },
  ],
  'private-static-properties': [
    { modfier: 'private', static: true, type: 'property' },
  ],
  'private-static-readonly-properties': [
    { modfier: 'private', readonly: true, static: true, type: 'property' },
  ],
  'protected-abstract-methods': [
    { abstract: true, modfier: 'protected', type: 'method' },
  ],
  'protected-accessor-pairs': { accessorPair: true, modifier: 'protected' },
  'protected-getters': { kind: 'get', modifier: 'protected' },
  'protected-methods': [{ modfier: 'protected', type: 'method' }],
  'protected-properties': [{ modfier: 'protected', type: 'property' }],
  'protected-readonly-properties': [
    { modfier: 'protected', readonly: true, type: 'property' },
  ],
  'protected-setters': { kind: 'set', modifier: 'protected' },
  'protected-static-methods': [
    { modfier: 'protected', static: true, type: 'method' },
  ],
  'protected-static-properties': [
    { modfier: 'protected', static: true, type: 'property' },
  ],
  'protected-static-readonly-properties': [
    { modfier: 'protected', readonly: true, static: true, type: 'property' },
  ],
  'public-abstract-methods': [
    { abstract: true, modfier: 'public', type: 'method' },
  ],
  'public-accessor-pairs': { accessorPair: true, modifier: 'public' },
  'public-getters': { kind: 'get', modifier: 'public' },
  'public-methods': [{ modfier: 'public', type: 'method' }],
  'public-properties': [{ modfier: 'public', type: 'property' }],
  'public-readonly-properties': [
    { modfier: 'public', readonly: true, type: 'property' },
  ],
  'public-setters': { kind: 'set', modifier: 'public' },
  'public-static-methods': [
    { modfier: 'public', static: true, type: 'method' },
  ],
  'public-static-properties': [
    { modfier: 'public', static: true, type: 'property' },
  ],
  'public-static-readonly-properties': [
    { modfier: 'public', readonly: true, static: true, type: 'property' },
  ],
};

const comparers = [
  { property: 'name', test: (m, s) => s.testName(m.name), value: 100 },
  { property: 'type', test: (m, s) => s.type === m.type, value: 10 },
  { property: 'static', test: (m, s) => s.static === m.static, value: 10 },
  { property: 'async', test: (m, s) => s.async === m.async, value: 10 },
  { property: 'kind', test: (m, s) => s.kind === m.kind, value: 10 },
  { property: 'private', test: (m, s) => s.private === m.private, value: 10 },
  {
    property: 'groupByDecorator',
    test: (m, s) => m.decorators.includes(s.groupByDecorator),
    value: 10,
  },
  {
    property: 'accessorPair',
    test: (m, s) =>
      (s.accessorPair && m.matchingAccessor) ||
      (s.accessorPair === false && !m.matchingAccessor),
    value: 20,
  },
  {
    property: 'propertyType',
    test: (m, s) => m.type === 'property' && s.propertyType === m.propertyType,
    value: 11,
  },
];
