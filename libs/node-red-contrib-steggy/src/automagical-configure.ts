import { Node, NodeAPI, NodeDef } from 'node-red';

import { ControllerConfiguration } from './types';

module.exports = function (RED: NodeAPI) {
  RED.nodes.registerType(
    'steggy-configure',
    function SteggyConfigure(
      this: Node & ControllerConfiguration,
      node: NodeDef & ControllerConfiguration,
    ) {
      RED.nodes.createNode(this, node);
      this.host = node.host;
      this.admin_key = node.admin_key;
    },
  );
};
