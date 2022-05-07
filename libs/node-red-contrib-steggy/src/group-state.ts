import { Node, NodeAPI, NodeDef } from 'node-red';

import { ControllerConfiguration, sendRequest } from './types';

type tServer = Node & ControllerConfiguration;
type TriggerOptions = { group?: string; state?: string };
type Payload = { group?: string; state?: string };

module.exports = function (RED: NodeAPI) {
  RED.nodes.registerType(
    'group-state',
    function TriggerRoutineNode(
      this: Node & TriggerOptions,
      config: NodeDef & { server: string } & Payload,
    ) {
      RED.nodes.createNode(this, config);

      const server = RED.nodes.getNode(config.server) as tServer;
      const activate = async (group: string, state: string) => {
        await sendRequest({
          adminKey: server.admin_key,
          baseUrl: server.host,
          method: 'post',
          url: `/group/${group}/state/${state}`,
        });
      };

      this.on('input', async message => {
        const payload = message.payload as Payload;
        const group = payload.group || config.group;
        const state = payload.state || config.state;

        await activate(group, state);
      });
    },
  );
};
