// import { DOWN, UP } from '@ccontour/utilities';
// import chalk from 'chalk';
// import cliCursor from 'cli-cursor';
// import figures from 'figures';
// import { Question } from 'inquirer';
// import Base from 'inquirer/lib/prompts/base';
// import observe from 'inquirer/lib/utils/events';
// import Paginator from 'inquirer/lib/utils/paginator';
// const OFF = 0;

// export class DatePrompt extends Base<Question & { pageSize: number }> {
//   constructor(questions, rl, answers) {
//     super(questions, rl, answers);

//     (this.opt = {
//       ...questions,
//       prefix: chalk.green('?'),
//       suffix: '',
//     }),
//       (this.previousAnswers = answers);
//     this.selected = OFF;
//     this.paginator = new Paginator(this.screen, {
//       isInfinite: false,
//     });

//     const events = observe(rl);
//     const keyDowns = events.keypress
//       // @ts-expect-error everyone else is doing it this way
//       .filter((e) => e.key.name === 'down')
//       .share();
//     // @ts-expect-error everyone else is doing it this way
//     const keyUps = events.keypress.filter((e) => e.key.name === 'up').share();
//     keyDowns.takeUntil(events.line).forEach(this.onDownKey.bind(this));
//     keyUps.takeUntil(events.line).forEach(this.onUpKey.bind(this));
//     events.line.forEach(this.onSubmit.bind(this));
//   }

//   private done: (item: number) => unknown;
//   private firstRender = true;
//   private paginator: Paginator;
//   private previousAnswers: unknown;
//   private selected = 0;

//   public _run(callback) {
//     this.done = callback;
//     cliCursor.hide();
//     this.render();
//     return this;
//   }

//   private getChoices() {
//     return this.opt.choices;
//   }

//   private getPlaceholder(number): string {
//     return 'INSERT HERE';
//   }

//   private onDownKey() {
//     const length = this.getChoices().length;
//     this.selected = this.selected < length ? this.selected + UP : 0;
//     this.render();
//   }

//   private onSubmit() {
//     this.status = 'answered';
//     // Rerender prompt
//     this.render();
//     this.screen.done();
//     cliCursor.show();
//     this.done(this.selected);
//   }

//   private onUpKey() {
//     const length = this.getChoices().length;
//     this.selected = this.selected > OFF ? this.selected + DOWN : length;
//     this.render();
//   }
//   private render() {
//     let message = this.getQuestion();

//     if (this.firstRender) {
//       message += chalk.dim('(Use arrow keys)');
//     }

//     const choices = [
//       ...this.getChoices().slice(0, this.selected),
//       this.getPlaceholder(this.selected),
//       ...this.getChoices().slice(this.selected),
//     ];

//     const choicesString = listRender(choices, this.selected);
//     message +=
//       '\n' +
//       this.paginator.paginate(choicesString, this.selected, this.opt.pageSize);

//     this.firstRender = false;
//     this.screen.render(message, '');
//   }
// }

// /**
//  * Function for rendering list choices
//  * @param  {Array} choices array with choices
//  * @param  {Number} pointer Position of the pointer
//  * @return {String}         Rendered content
//  */
// function listRender(choices, pointer) {
//   let output = '';

//   choices.forEach(function (choice, i) {
//     if (choice.type === 'separator') {
//       output += '  ' + choice + '\n';
//       return;
//     }

//     const isSelected = i === pointer;
//     let line = (isSelected ? figures.pointer + ' ' : '  ') + choice;
//     if (isSelected) {
//       line = chalk.cyan(line);
//     }
//     output += line + ' \n';
//   });

//   return output.replace(/\n$/, '');
// }
