import { ChartingService, PromptService, Repl } from '@text-based/tty';
import { PEAT } from '@text-based/utilities';

const LENGTH = 200;
@Repl({
  category: 'Alpaca',
  keybind: 'a',
  name: 'Alpaca Testing',
})
export class AlpacaTestSerivce {
  constructor(
    private readonly promptService: PromptService,
    private readonly charting: ChartingService,
  ) {}
  public async exec(): Promise<void> {
    console.log(
      this.charting.plot(
        [
          PEAT(LENGTH).map(
            (row, i, array) =>
              15 * Math.sin(i * ((Math.PI * 4) / array.length)),
          ),
          PEAT(LENGTH).map(
            (row, i, array) =>
              15 * Math.cos(i * ((Math.PI * 4) / array.length)),
          ),
        ],
        { colors: ['blue.bold', 'yellow.bold'] },
      ),
    );
    await this.promptService.acknowledge();
  }
  //
}
