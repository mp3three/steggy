# Changelog

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
