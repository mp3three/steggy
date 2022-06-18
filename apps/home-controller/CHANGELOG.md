# Changelog

## 0.12.0

- Added Routine Command: Call Service
  - Pulls a list of available domains, and the services they support, and all the available options
  - Will present a form, which will allow for selection of:
    - entity_id
    - service
    - properties to send with request
  - Sends request via socket api
- Dropped Routine Command: Entity State
  - UI widgets remain currently, but will be refactored to a more standardized form based off the call service command

## 0.11.25

- Added popover to person avatar in top/right of screen
  - Directly change a piece of metadata
  - Activate a person state
- Squished annoying bug that resulted in date range enabled routines to only work for 1 day
  - Server either needed to be reloaded, or the routine modified in order to reload
- Reworked config scanner to work without external dependencies being required (like mongo)
- Added "circadian quick set" functionality for lights
  - Watches for entities in the `light` domain that have gone from an offline to "on" state
  - Intended for use with temperature adjustable lights attached to dumb switches
  - If the next circadian update would result in a temperature update, one is performed immediately
    - There can still be a lag time between "light on", and when it connects to wifi/whatever

## 0.11.13

- Added endpoint to `people`, `groups`, & `rooms` to activate save states by id
  - Without providing the item that id is stored on
- Working on the routine activations by schedule
  - Schedules occasionally got "stuck".
  - Now works via rechecking on 30 sec interval
    - If the next update is <30 seconds, a special delay for +100ms after that point is performed before performing an additional recheck
- `config.json` now properly povided in docker images
- Added ability for routine trigger commands to trigger all direct descendant routines

### 0.11.4

- Added config `CIRCADIAN_ENABLED` to `controller-sdk`
  - Default: `true`, setting to false will disable the automatic light temperature management

### 0.11.3

- Bugfixes to determining the initial enabled state with routines when relative date comparisons are in use
- Updated item create prompts with validation errors for empty required inputs
- UI will now request date text resolution from the server, instead of trying to work it out inside the browser
  - Will now resolve items like "sunset" properly, and other server defined custom resolvers
- Added annotation: `@ActivationEvent`
  - Use with `iActivationEvent` interface to form custom activation sources
- Added annotation: `@RoutineCommand`
  - Use with `iRoutineCommand` interface to form custom command executor
- Refactored all activation events + commands to utilize the new annotations + interfaces
- Controller now takes in secrets directly from the config, instead of a secondary file
- `VMService` now also imports metadata from people and secrets, in addition to rooms

### 0.10.29

- Everything that supports `switch` domains now supports `input_boolean` also

### 0.10.28

- Settings UI now shows boot time + server version
- (Bugfix) Fixed bug where if a routine was moved to the root level through the UI, it would not enable at boot until it was manually interacted with

### 0.10.22

- Readability improvements to recent activations list
  - Node Red & Manual activations have special colored tags
  - Added dashed border around editable activations to differentiate between plain text entries

### 0.10.21

- Updated routine disable to block along all code paths, unless an explicit force is passed

### 0.10.20

- Added relatively consistent counts of things to tab / card headers

### 0.10.19

- Updated UI to always perform filtered searches against the controller
  - No full collection dumps. Should load minimum information for lists, and full documents by id
- Added group types for references:
  - Room group
  - Person group
  - Group group
- Added additional lookups to "used in" for group states

### 0.10.17

- Many (many) minor UI bugs resolved after smoke test
- Added the ability to pin metadata. Value at time of initial rendering is displayed
- Added a description box to routines for note to self type descriptions
  - Description is used on routine inspect button tooltips
- New tab added to routines: history
  - Pulls from the list of recent activations

### 0.10.13

- (tech debt) Deleted some old code that hasn't been used since prior to 0.5.x
- Added attribute history to entity history (popover)
- Misc updates to styling
- Added person renaming to entity rename logic

### 0.10.12

- Added history tab to entity inspect
- Added the ability to pin:
  - rooms
  - groups
  - people
  - entities
  - routines
  - room states
  - group states
  - people states
- Can be activated states / routines from pin

### 0.10.9

- Updated favicon from default nx icon
- Added tracking for recent routine activations
- Flagged some projects with minimum node versions
- UI refactor from class components to functional

### 0.10.5

- New microservice added: `pico-relay`
  - Standalone docker container for connecting to a lutron hub, and mapping pico remote events to a home assistant entity
  - New entity's state will reflect the current button press state as updates are reported from hub
- Opened up internal events (via `event-emitter3`) as activation events for routines
- Experimental activation event: device trigger
  - Attempts to use the home assistant device trigger api as an activation event
- UI tweaks for text inputs

### 0.10.2

- Webhook actions can optionally assign results to metadata
- Webhooks can replace header values with tokens from secrets file

### 0.10.1

- Internal refactoring of controller
- Introduced "People" concept to the controller
  - Can have groups, rooms, and entities associated with a person
  - Save states utilizing multiple rooms can be created
  - Has metadata support, just like rooms. Existing routines have been updated to support

### 0.9.15

- Added filter option to entities to show manually hidden
- Added ability to clone groups, rooms, and routines
  - Routines can be cloned recursively

### 0.9.14

- Trigger routine commands can conditionally respect the enabled state of the target routine
- Added entity friendly name changer
- (Bugfix) Bugfix to startup process lockup race condition
- Deleting rooms will now remove all routine commands that could activate it
- Deleting rooms will
  - Purge references to room states
  - *NOT* remove references to metadata (might make conditionally possible in future)
- Deleting groups will now
  - Detach group from rooms
  - Detach group save states from previously associated room save states
  - Purge group state / action routine command references
- Added a common "extra" menu to room / group / routine interfaces that contains delete buttons + other misc actions

### 0.9.12

Added new section to settings page which shows lists of currently broken routines / groups / rooms. The reason for inclusion in the list is currently only available in the warning logs of the server. Possible reasons include:

- reference to invalid room / room state / room metadata property
- reference to missing entity id
- reference to invalid routine
- reference to invalid group / group save state

Can be used to assist in the restoration of functionality if an a Home Assistant integration resets everything back to default entity ids (😢)

### 0.9.10

- Added error checks to all lookups by entity id
  - If an entity doesn't exist for the UI, a basic error notification is emitted
  - No updates for controller, it already seems to gracefully handles missing entities
- Added entity id renamer
  - Can optionally search out and rename the entity id in groups, rooms, save states, and routines
- Upgraded entity list page to better link to all direct consumers of the entity id
  - Combines all methods that routines use into a single list since there is a large variety of ways it can be used
- New flag `IGNORE_ENTITY` added
  - Prevents entity from appearing on entity lists by default. Option to restore entity pending
  - No additional effects
- (Tech Debt) `/entity/list` now respects ResultControl

### 0.9.8

- (Bugfix) Main menu properly shows all the options when an admin key is entered
- Updated / added lists that help identify where various elements are being consumed

### 0.9.7

- Added entity attribute tests as activation events
- (Tech debt) Added `eslint-plugin-spellcheck`
- (Tech debt) Fuzzy select now clears highlighting on select

### 0.9.6

- Added the ability to watch room metadata for updates as an activation event
  - Includes latch
- Exposed some solar events to date resolve logic
  - Can use "sunset" in date tests, for example
- Updated logic for receiving metadata updates via http calls to better coerce the value
  - Example: Date metadata will coerce numeric timestamps (`1649696206584`), [dateStrings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date), and chrono parsable date strings (`"tomorrow"`) prior to saving
  - Intended as quality of life improvements for node red integration

### 0.9.4

- Improved `@InjectConfig`'s ability to handle command line switches and environment variables for unknown app configs
- v1 of node red integration
  - Nodes can automatically perform controller lookups from the node red UI
  - Home Controller can perform node lookups in node red to directly select nodes to activate
- Build pipeline improvements

### 0.9.2

> Big refactors

- Changed npm scope from @automagical to @steggy (the stegosaurus)
- Active libraries have current versions published to npm under @steggy scope
- Initial version of node red integration `node-red-contrib-steggy`

### 0.8.9

- Many ui visual tweaks + code cleanup
- Added number, date, enum metadata types
- Added mathjs integration for calculating math values
- Added  (sandboxed javascript evaluation) integration for some value processing
- General improvements to workflows surrounding room metadata
- Added routine repeat run logic
  - Interrupt previous run, block routine while running, etc

### 0.8.5

- Reworked group & room interfaces to look more like routines
- Minor ui code cleanup

### 0.8.3

- Bugfixes to ensure initial enabled state at boot is correct for routines
- Trigger routine command displays as tree in UI instead of dropdown
- Persistence library now responsible for database connections instead of app
  - Updated controller config docs to match
- Added entity metadata flag to log state changes for particular entities
  - Logs are debug level, and appear in the controller. Development aid type of tool

### 0.7.5

- Fully removed routine detail page, bringing content into routine tree/list page
- Added red / yellow / green to indicate current enable / mount status of routines

### 0.7.3

- Added `SAFE_MODE` configuration variable. When enabled:
  - Routines will not mount
  - Circadian lighting updates will not be passed along to physical updates (but still tracked)
  - "Connection reset" notifications blocked
- Logging tweaks
- Reworked the routine list page
- (tech debt) dropped metadata.json files

### 0.7.1

- (tech debt) Dropped `controller-logic` lib, migrated code directly into `home-controller`
  - `controller-shared` unaffected
- Added parent/child relationship to routines
- Added ability to enable/disable routines
  - Can be dynamically set using the same rules as stop processing action
  - Rules that are more external in nature (ex: webhook / template tests) can be set up with a polling interval since there isn't anything to listen to
  - While disabled, all listeners are unloaded to reduce work
- Routines now enable after `ALL_ENTITIES_UPDATED` fires, instead of part of the bootstrap
- Added `SAFE_MODE` configuration. When set, routines will only activate if called manually through HTTP routes
- (tech debt) Implemented fix to home controller for composite tsconfig

### 0.7.0

- Repository reorganization to utilize github / npmjs / dockerhub instead of internal urls
- First public builds!
- First pass at app documentation
- New `@QuickScript` annotation for TTY lib
