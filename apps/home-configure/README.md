# Home Configuration

Note: This project is **NOT** inteded to be a dashboard. There is no persistent connection open from the UI to the backend, nor to Home Assistant. The UI may not always match actual entity state.

## Grouping

### [Groups](docs/groups.md)

Groups take a collection of entitites, and provides tools to allow them to act in a coordinated fashion. All group types have the ability to create save states, which contain state / attribute information to set. Some groups, such as *light groups* also expose specialized actions such as dimming.

Entities may be shared in multiple groups.

### [Rooms](docs/room.md)

Rooms are collections of groups and entities.

## Routines

Routines takes a list of activation events, and trigger actions.

### [Activation Events](docs/routines-activate.md)

All routines can be activated via POST request to `/api/routine/{routine._id}`.

Current activation events:

- Entity State Sequence
- Cron
- Solar State
- Entity State Comparison

WIP:

- Calendar Based

### [Commands](docs/routine-command.md)

Commands can be processed in either in series, or parallel.

- While processing in series, commands can be sorted, processed in order, and flow control tools such as stop processing can be used.
  - When setting entity states, confirmation must be received from Home Assistant prior to continuing.
- While processing in parallel, all commands are executed simultaniously.
  - Entity state changes are processed in a "fire and forget" method.

Current activation events:

- Set entity state
- Activate group state
- Run group action
- Activate room state
- Send notification via home assistant
- Trigger routine
- Webhook
- Set room metadata
- Stop processing
  - Series only
- Sleep
  - Series only
