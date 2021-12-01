import inquirer from 'inquirer';
import autocompletePrompt from 'inquirer-autocomplete-prompt';
import datePrompt from 'inquirer-date-prompt';

// import { Prompt } from './select-line';
// import selectLine from 'inquirer-select-line';

// @ts-expect-error Probably related to missing ts defs or something
inquirer.registerPrompt('date', datePrompt);
inquirer.registerPrompt('autocomplete', autocompletePrompt);

// function Prompt(...args) {
//   Base.apply(this, args);
//   this.opt = {
//     ...args[0],
//     suffix: '',
//     prefix: chalk.green('?')
//   },
//   this.previousAnswers = args[2];
//   this.selected = 0;
//   this.paginator = new Paginator();
//   this.firstRender = true;
//   if (typeof this.opt.placeholder === 'function') {
//     this.getPlaceholder = this.opt.placeholder;
//   } else if (typeof this.opt.placeholder === 'string') {
//     this.getPlaceholder = () => this.opt.placeholder;
//   } else {
//     this.getPlaceholder = () => 'INSERT HERE';
//   }

//   const events = observe(args[1]);
//   const keyDowns = events.keypress.filter(function(e) {
//     return e.key.name === 'down';
//   }).share();
//   const keyUps = events.keypress.filter(function(e) {
//     return e.key.name === 'up';
//   }).share();
//   keyDowns.takeUntil(events.line).forEach(this.onDownKey.bind(this));
//   keyUps.takeUntil(events.line).forEach(this.onUpKey.bind(this));
//   events.line.forEach(this.onSubmit.bind(this));
//   return this;
// }

// console.log(selectLine.toString());
// process.exit();
// inquirer.registerPrompt('selectLine', Prompt);
