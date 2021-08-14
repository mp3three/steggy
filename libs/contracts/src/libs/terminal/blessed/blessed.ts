import blessed from 'blessed';
import contrib from 'blessed-contrib';

// Boxes
export const Box = blessed.box;
export const Screen = blessed.screen;
export const Text = blessed.text;
export const Line = blessed.line;
export const BigText = blessed.bigtext;

// Lists
export const List = blessed.list;
export const FileManager = blessed.filemanager;
export const ListTable = blessed.listtable;
export const Listbar = blessed.listbar;

// Forms
export const Form = blessed.form;
export const Input = blessed.input;
export const Textarea = blessed.textarea;
export const Textbox = blessed.textbox;
export const Button = blessed.button;
export const Checkbox = blessed.checkbox;
export const RadioSet = blessed.radioset;
export const RadioButton = blessed.button;

// Prompts
export const Prompt = blessed.prompt;
export const Question = blessed.question;
export const Message = blessed.message;
export const Loading = blessed.loading;

// Data Display
export const ProgressBar = blessed.progressbar;
export const Log = blessed.log;
export const Table = blessed.table;

// Special Elements
export const Terminal = blessed.terminal;

// Typescript doesn't export this properly
// export const Image = blessed.image;
export const Layout = blessed.layout;

// Contrib
export const LineChart = contrib.line;
export const BarChart = contrib.bar;
export const StackedBarChart = contrib.stackedBar;
export const Map = contrib.map;
export const Gauge = contrib.gauge;
export const Donus = contrib.donut;
export const LCDDisplay = contrib.lcd;
export const RollingLog = contrib.log;
export const Picture = contrib.picture;
export const ContribTable = contrib.table;
export const Tree = contrib.tree;
export const Markdown = contrib.markdown;
export const Grid = contrib.grid;
export type GridElement = contrib.Widgets.GridElement;
export type BoxElement = blessed.Widgets.BoxElement;
export type BoxOptions = blessed.Widgets.BoxOptions;
export type Screen = blessed.Widgets.Screen;

export type TreeOptions = contrib.Widgets.TreeOptions;
export type MarkdownElement = contrib.Widgets.MarkdownElement;
export type MarkdownOptions = contrib.Widgets.MarkdownOptions;
export type LineElement = contrib.Widgets.LineElement;
export type LineOptions = contrib.Widgets.LineOptions;

//
// WRONG DEFINITIONS CORRECTION AREA
// Need to use @ts-ignore otherwise
//

export type TreeElement = contrib.Widgets.TreeElement &
  Partial<{
    setData(data: TreeOptions): void;
  }>;
