module.exports = function(RED) {
  console.log('hit')
  function LowerCaseNode(config) {
      RED.nodes.createNode(this,config);
      var node = this;
      node.on('input', function(msg) {
          msg.payload = msg.payload.toLowerCase();
          node.send(msg);
      });
  }
  RED.nodes.registerType("lower-case",LowerCaseNode);
}
console.log('hit')
