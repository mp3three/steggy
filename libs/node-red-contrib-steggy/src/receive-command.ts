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
      item.exec(body);
    },
  );

  RED.httpNode.get(`/steggy/routine-command`, function (request, response) {
    const list = [] as Record<'id' | 'name', string>[];
    commands.forEach(({ name }, id) => list.push({ id, name }));
    response.send({ list });
  });

  const commands = new Map();
  RED.nodes.registerType(
    'receive-command',
    function TriggerRoutineNode(this: Node, config: NodeDef & TriggerOptions) {
      RED.nodes.createNode(this, config);
      commands.set(config.id, {
        exec: payload => this.send({ payload }),
        name: config.name,
      });
      this.on('close', () => commands.delete(config.name));
    },
  );
};
