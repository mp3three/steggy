import { Injectable } from '@nestjs/common';
import blessed from 'blessed';

@Injectable()
export class RecentUpdatesService {
  // #region Public Methods

  public appendTo(screen: blessed.Widgets.Screen): void {
    const box = blessed.box({
      border: {
        type: 'line',
      },
      content: 'Hello {bold}world{/bold}!',
      height: '100%',
      right: 0,
      scrollable: true,
      style: {
        bg: '#2222FF',
        border: {
          fg: '#f0f0f0',
        },
        fg: 'white',
      },
      tags: true,
      width: '20%',
    });

    // If our box is clicked, change the content.
    box.on('click', function (data) {
      box.setContent(
        Array.from({ length: 100 })
          .map(
            (_, i) => `{center}Some different {red-fg}${i}{/red-fg}.{/center}`,
          )
          .join(`\n`),
      );
      screen.render();
    });

    // // If box is focused, handle `enter`/`return` and give us some more content.
    // box.key('enter', function (ch, key) {
    //   box.setContent(
    //     '{right}Even different {black-fg}content{/black-fg}.{/right}\n',
    //   );
    //   box.setLine(1, 'bar');
    //   box.insertLine(1, 'foo');
    //   screen.render();
    // });

    // Focus our element.
    box.focus();

    // Append our box to the screen.
    screen.append(box);
    //
  }

  // #endregion Public Methods
}
