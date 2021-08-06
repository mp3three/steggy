# Lighting Controller

## Description

The lighting controller manages the light + switch states according to predefined rules.
The general theory to the service is that it is working with a 5 button controller with the following options:

- on
- off
- dim up
- dim down
- favorite

## Intended Usage

The general theory is a single press should do something sane for someone who isn't familiar with the system / just slapping at the wall.
More complex / power user / home owner functionality should still be easily accessible without comprimising the previous use case.

In general, more button presses = more complex functionality.
Combo logic (repeat press of the same button) should only target the 1-3 press range aside from

### On

- Single press: Turn on all local lights fully at a single press
- Double press: Turn on supplemental lights (hallway / stair lights immediately adjoining)
- Triple press: Relay the triple press request to other rooms for a "global on" call

### Off

Similar logic to on, but in in the off direction

### Dim up / down

Single press of the dimmer will move the current brightness level by 10%. Min brightness: 5%

## Favorite

Logic for the favorite button is provided by the service creating the sensor binding.
The default logic for the controller is to call the on button.
Logic is intended to be overridden via these methods:

### Combo codes

> Repeat press of the same button

- 1 press: set a good lighting scene for time of day
  - if available: put room into an automatically managed lighting mode
- 2 press: turn on room accessories
  - ex: television
- 3 press: provide global interactions
  - turn off other room lights
  - lock doors

### Konomi codes

Konami codes are all prefixed with the favorite button, then any sequence of other buttons can be pressed.
Every time a new button is pressed, the lighting controller checks to see if that particular sequence is a valid command.
Each button must be pressed within a configurable time window (2500ms by default) after the previous button to be valid.

> potential examples:
> >
> - `favorite > ⏬⏬⏬` delay then triple off
> - `favorite > ⏫ > ⏫ > ⏬ > ⏬ > 🔼 > 🔽 > favorite` activate robot apocalypse
