import { INCREMENT, INVERT_VALUE, is, START } from '@steggy/utilities';
import { Select } from 'antd';
import fuzzy from 'fuzzysort';
import parse from 'html-react-parser';
import React, { useEffect, useState } from 'react';
const TEMP_TEMPLATE_SIZE = 3;

function highlight(result) {
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

export function FuzzySelect(props: {
  data: { text: string; value: string }[];
  disabled?: boolean;
  onChange: (value) => void;
  style?: React.CSSProperties;
  value: string;
}) {
  const [data, setData] = useState<{ text: string; value: string }[]>();
  const [searchText, setSearchText] = useState<string>();

  useEffect(() => {
    setData(props.data);
  }, [props.data]);

  function options() {
    if (!is.empty(data)) {
      return data;
    }
    return is.empty(data) && !is.empty(searchText) ? [] : props.data;
  }

  function onChange(value: string): void {
    props.onChange(value);
    // Reset the data mostly to remove highlighting
    // It's oddly uncomfortable as a user, even if it's only visual
    setData(props.data);
  }

  function updateSearch(searchText: string): void {
    setSearchText(searchText);
    if (is.empty(searchText)) {
      setData(props.data);
      return;
    }
    const available = props.data;
    const fuzzyResult = fuzzy.go(searchText, available, {
      key: 'text',
    });
    const data = fuzzyResult.map(result => {
      const { target } = result;
      const item = available.find(option => {
        return is.string(option) ? option === target : option.value === target;
      });
      return {
        text: highlight(result),
        value: item.value,
      };
    });
    setData(data);
  }

  return (
    <Select
      onChange={value => onChange(value)}
      value={props.value}
      showSearch
      style={props.style}
      filterOption={false}
      showArrow={false}
      disabled={props.disabled}
      defaultActiveFirstOption={false}
      onSearch={search => updateSearch(search)}
    >
      {options().map(d => (
        <Select.Option key={d.value} value={d.value}>
          {parse(d.text)}
        </Select.Option>
      ))}
    </Select>
  );
}
