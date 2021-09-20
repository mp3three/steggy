# Room Feature Flags

> See: `RoomControllerFlags`

Room feature flags provide hinting to the controller logic as to how to a given controller relates to the rest of the setup.

## SECONDARY

Secondary controllers are for situations when a given room has more than 1 physical remote to control it.

Example setup:

- Primary next to door for normal lighting control
- Secondary remote on nightstand. Example features:
  - May provide access to toggling a light
  - Control fan speed via dimmer buttons

This remote should not have any automatically generated http / mqtt / event bindings.
Nor should it automatically have controller methods automatically inserted into it

## RELAY_EMIT

Is this controller allowed to emit home state change events?
This flag implies `RELAY_RECEIVE`

- Global "turn off all the lights" commands
- Auto log doors on certain commands

Where this might be a good feature:

- Living room / common areas
- Master bedroom?

Bad feature:

- Guest bedroom

## RELAY_RECEIVE

For when a controller is allowed to revieve home state change events, but not emit.
Not all rooms have physical controllers, and may need to be individually zoned to accomplish certain logic.

Examples:

- Dining room
- Kitchen
- Bathrooms

This flag can be used to have the area follow global commands.
Use case example: scene setting
