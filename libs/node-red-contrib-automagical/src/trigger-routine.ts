import { Node, NodeAPI, NodeDef } from 'node-red';

import { AutomagicalConfiguration } from './types';

type tServer = Node & AutomagicalConfiguration;
type TriggerOptions = { server: tServer };

module.exports = function (RED: NodeAPI) {
  RED.nodes.registerType(
    'trigger-routine',
    function TriggerRoutineNode(
      this: Node & TriggerOptions,
      config: NodeDef & { server: string },
    ) {
      RED.nodes.createNode(this, config);
      this.server = RED.nodes.getNode(config.server) as tServer;
      this.on('input', message => {
        message.payload = (message.payload as string).toLowerCase();
        // this.send(message);
      });
    },
  );
};
