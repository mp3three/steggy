import { is } from '@steggy/utilities';
import { Select } from 'antd';
import fuzzy from 'fuzzysort';
import parse from 'html-react-parser';
import { useEffect, useState } from 'react';

export function FuzzySelect(props: {
  data: { text: string; value: string }[];
  disabled?: boolean;
  onChange: (value) => void;
  style?: React.CSSProperties;
  value: string;
}) {
  const [data, setData] = useState<{ text: string; value: string }[]>([]);
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
    const available = props.data;
    const fuzzyResult = fuzzy.go(searchText, available, {
      all: true,
      key: 'text',
    });
    const data = fuzzyResult.map(result => {
      return {
        text: fuzzy.highlight(result, '<span style="color:#F66">', '</span>'),
        value: result.obj.value,
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
