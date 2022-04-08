import { Node, NodeAPI, NodeDef } from 'node-red';

type TriggerOptions = { name: string; target: string };

module.exports = function (RED: NodeAPI) {
  RED.httpNode.post(
    `/steggy/routine-command/:command`,
    function ({ params, body }, response) {
      response.send({ success: true });
      const { command } = params;
      const item = commands.get(command);
      if (!item) {
        return;
      }
      item(body);
    },
  );
  const commands = new Map();
  RED.nodes.registerType(
    'receive-command',
    function TriggerRoutineNode(this: Node, config: NodeDef & TriggerOptions) {
      RED.nodes.createNode(this, config);
      commands.set(config.target, payload => this.send({ payload }));
      this.on('close', () => commands.delete(config.name));
    },
  );
};
