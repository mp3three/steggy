import {
  apply,
  chain,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  Tree,
  url,
  externalSchematic,
} from '@angular-devkit/schematics';
import { getProjectConfig } from '@nrwl/workspace';

// WIP
function generateLibrary(schema: any): Rule {
  return externalSchematic('@nrwl/workspace', 'lib', {
    name: schema.name,
  });
}

function generateFiles(schema: any): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('adding main.ts to lib');

    const templateSource = apply(url('./files'), [
      move(getProjectConfig(tree, schema.name).root),
    ]);

    return chain([mergeWith(templateSource)])(tree, context);
  };
}

export default function (schema: any): Rule {
  return (tree: Tree, context: SchematicContext) => {
    return chain([generateLibrary(schema), generateFiles(schema)])(
      tree,
      context,
    );
  };
}
