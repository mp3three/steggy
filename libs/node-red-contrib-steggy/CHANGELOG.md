# Changelog

## 0.9.x

### 0.9.9

> Validated against `Home Controller`: 0.10.22

- added people state nodes
- set metadata nodes are now able to pick from people & rooms as a source
- added a `force` option to routine trigger nodes
- routine trigger nodes now pass their labels as an activation source
  - (home controller) added special highlighting in ui for node red activations
- added some request throttling from the node red dashboard to the controller to cut down on spammy requests
- 🐜 general smoke test & bug shakedown 🐛🐦

### 0.9.2

> Sprung into existence at this `Home Controller` tag

- Output node for commands
- Nodes for setting group / room states, and triggering routines
