import { CLIService } from '@automagical/contracts/terminal';
import { MainCLIREPL } from '@automagical/terminal';
import { Injectable } from '@nestjs/common';
import blessed from 'blessed';
import contrib from 'blessed-contrib';

@Injectable()
export class DashboardService implements CLIService {
  // #region Object Properties

  public description = [];
  public name = 'Dashboard';

  // #endregion Object Properties

  // #region Constructors

  constructor(readonly cli: MainCLIREPL) {
    cli.addScript(this);
  }

  // #endregion Constructors

  // #region Public Methods

  public async exec(): Promise<void> {
    const screen = blessed.screen({
      smartCSR: true,
    });
    screen.title = 'my window title';

    // Create a box perfectly centered horizontally and vertically.
    const box = blessed.box({
      border: {
        type: 'line',
      },
      content: 'Hello {bold}world{/bold}!',
      height: '50%',
      left: 'center',
      style: {
        bg: 'magenta',
        border: {
          fg: '#f0f0f0',
        },
        fg: 'white',
        hover: {
          bg: 'green',
        },
      },
      tags: true,
      top: 'center',
      width: '50%',
    });

    // Append our box to the screen.
    screen.append(box);
    // console.log(typeof blessed.image);

    // If our box is clicked, change the content.
    box.on('click', function (data) {
      box.setContent(
        '{center}Some different {red-fg}content{/red-fg}.{/center}',
      );
      screen.render();
    });

    // If box is focused, handle `enter`/`return` and give us some more content.
    box.key('enter', function (ch, key) {
      box.setContent(
        '{right}Even different {black-fg}content{/black-fg}.{/right}\n',
      );
      box.setLine(1, 'bar');
      box.insertLine(1, 'foo');
      screen.render();
    });

    // Quit on Escape, q, or Control-C.
    screen.key(['escape', 'q', 'C-c'], function (ch, key) {
      return process.exit(0);
    });

    // Focus our element.
    box.focus();

    // Render the screen.
    screen.render();
  }

  // #endregion Public Methods
}
