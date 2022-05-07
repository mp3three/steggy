import { is } from '@steggy/utilities';
import { Node, NodeAPI, NodeDef } from 'node-red';

import { ControllerConfiguration, sendRequest } from './types';

type tServer = Node & ControllerConfiguration;
type TriggerOptions = {
  property: string;
  source?: string;
  value?: unknown;
};
type Payload = {
  property: string;
  source?: string;
  value?: unknown;
};

module.exports = function (RED: NodeAPI) {
  RED.nodes.registerType(
    'set-metadata',
    function TriggerRoutineNode(
      this: Node & TriggerOptions,
      config: NodeDef & TriggerOptions & { server: string },
    ) {
      RED.nodes.createNode(this, config);

      const server = RED.nodes.getNode(config.server) as tServer;
      const send = async (target: string, property: string, value: unknown) => {
        const [base, source] = target.split(':');
        await sendRequest({
          adminKey: server.admin_key,
          baseUrl: server.host,
          body: { value },
          method: 'put',
          url: `/${base}/${source}/metadata-name/${property}`,
        });
      };

      this.on('input', async message => {
        const payload = message.payload as Payload;
        const source = payload.source || config.source;
        const property = payload.property || config.property;
        const value = payload.value ?? config.value;
        if (is.empty(source)) {
          this.error('No target provided to set metadata on');
          return;
        }
        if (is.empty(property)) {
          this.error('Cannot identify property to modify');
          return;
        }
        await send(source, property, value);
      });
    },
  );
};
