# Changelog

## 22.29.1

- FIX: Menu component includes help text while fuzzy searching
- TextRedering#typePrinter provides colored nesting levels
- `--help` command processing moved to the `rewire` lifecycle event (from `onPreInit`)

## 0.12.0

- Fixed rendering errors that happen with modifier + key combos for keymaps
- Added clear keybind to string editor
- Removed all prompts based on `inquirer` due to incompatibilities with internal rendering
- Added new editor: Date
  - Can be put into formats
    - date
    - time
    - datetime
    - range (date a - date b)
  - Supports direct manipulation of numbers for ymdhms
  - Supports conversion from expressions using `chrono-node`
- Terminal `--help`: Improved description rendering
- Added a quick function to pipe through stdout from `execa`, while waiting on the result

## 0.11.16

- Added extra qol keybinds to editors
- Date editor overhaul
  - modes: range, date, time, datetime
- Removed methods from `PromptService` that were only there for `home-cli`
  - canned questions and such

## 0.11.7

- Sync logger can now take in a timestamp to present instead of only showing now
- Date editor can now show date ranges

## 0.11.5

- Pulled non-generic code out of TTY into `home-cli`
  - `PinnedItemService`
  - `MainCLI`
  - Emoji icon maps
- Added new editor type: `date`

## 0.11.4

> **NOTE:** As of this tag, all `Inquirer` based prompts are considered deprecated, and will be replaced. `PromptService` methods that aren't general in scope (such as `brightness`) are set to be removed without replacements

- Added a final render to cleanup the UI on menu prompt
- Menu prompt will now properly render icons as a prefix to individual menu items
- Added more flags to menu prompt to limit list of keybinds to (up/down/enter) for reduced ui clutter in super condensed widgets
- `PromptService` uses internal editors for the following edit types:
  - string
  - enum
  - boolean
  - number
- Dropped **Config Builder** (moved core concepts to separate app)
- Added `TerminalHelpService`
  - When TTYModule is imported, this provider will watch for `--help` to be provided, and output a list of command line switches that can bind to injected configs

## 0.10.28

- TTY: Introduced `SyncLoggerService`. API compatible with `AutoLog`, but plays nice terminal apps
- TTY: List build component hides keyboard shortcut help on final rendering (no longer active)
