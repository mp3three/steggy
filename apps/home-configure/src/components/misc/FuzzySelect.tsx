import { INCREMENT, INVERT_VALUE, is, START } from '@steggy/utilities';
import { Select } from 'antd';
import fuzzy from 'fuzzysort';
import parse from 'html-react-parser';
import React from 'react';
const TEMP_TEMPLATE_SIZE = 3;
type tState = {
  data: { text: string; value: string }[];
  searchText?: string;
};

export class FuzzySelect extends React.Component<
  {
    data: { text: string; value: string }[];
    disabled?: boolean;
    onChange: (value) => void;
    style?: React.CSSProperties;
    value: string;
  },
  tState
> {
  override state = { data: [] } as tState;

  private get options() {
    if (!is.empty(this.state.data)) {
      return this.state.data;
    }
    return is.empty(this.state.data) && !is.empty(this.state.searchText)
      ? []
      : this.props.data;
  }

  override render() {
    const options = this.options.map(d => (
      <Select.Option key={d.value} value={d.value}>
        {parse(d.text)}
      </Select.Option>
    ));
    return (
      <Select
        onChange={value => this.onChange(value)}
        value={this.props.value}
        showSearch
        style={this.props.style}
        filterOption={false}
        showArrow={false}
        disabled={this.props.disabled}
        defaultActiveFirstOption={false}
        onSearch={search => this.updateSearch(search)}
      >
        {options}
      </Select>
    );
  }

  private highlight(result) {
    const open = '{'.repeat(TEMP_TEMPLATE_SIZE);
    const close = '}'.repeat(TEMP_TEMPLATE_SIZE);
    let highlighted = '';
    let matchesIndex = 0;
    let opened = false;
    const { target, indexes } = result;
    for (let i = START; i < target.length; i++) {
      const char = target[i];
      if (indexes[matchesIndex] === i) {
        matchesIndex++;
        if (!opened) {
          opened = true;
          highlighted += open;
        }
        if (matchesIndex === indexes.length) {
          highlighted += char + close + target.slice(i + INCREMENT);
          break;
        }
        highlighted += char;
        continue;
      }
      if (opened) {
        opened = false;
        highlighted += close;
      }
      highlighted += char;
    }
    return highlighted.replace(
      new RegExp(`${open}(.*?)${close}`, 'g'),
      i =>
        `<span style="color:#F66">${i.slice(
          TEMP_TEMPLATE_SIZE,
          TEMP_TEMPLATE_SIZE * INVERT_VALUE,
        )}</span>`,
    );
  }

  private onChange(value: string): void {
    this.props.onChange(value);
    // Reset the data mostly to remove highlighting
    // It's oddly uncomfortable as a user, even if it's only visual
    this.setState({ data: this.props.data });
  }

  private updateSearch(searchText: string): void {
    if (is.empty(searchText)) {
      return this.setState({ data: this.props.data });
    }
    const available = this.props.data;
    const fuzzyResult = fuzzy.go(searchText, available, {
      key: 'text',
    });
    const data = fuzzyResult.map(result => {
      const { target } = result;
      const item = available.find(option => {
        return is.string(option) ? option === target : option.value === target;
      });
      return {
        text: this.highlight(result),
        value: item.value,
      };
    });
    this.setState({ data });
  }
}
