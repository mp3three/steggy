import { Node, NodeAPI, NodeDef } from 'node-red';

import { AutomagicalConfiguration } from './types';

module.exports = function (RED: NodeAPI) {
  RED.nodes.registerType(
    'automagical-configure',
    function AutomagicalConfigure(
      this: Node & AutomagicalConfiguration,
      node: NodeDef & AutomagicalConfiguration,
    ) {
      RED.nodes.createNode(this, node);
      this.host = node.host;
      this.admin_key = node.admin_key;
    },
  );
};
