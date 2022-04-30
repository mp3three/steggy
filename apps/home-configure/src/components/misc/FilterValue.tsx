import { is } from '@steggy/utilities';
import {
  Button,
  Divider,
  Input,
  InputNumber,
  List,
  Select,
  Skeleton,
  Space,
  Typography,
} from 'antd';
import React, { useState } from 'react';

// eslint-disable-next-line radar/cognitive-complexity
export function FilterValue(props: {
  numberType?: string;
  onChange: (value) => void;
  operation: string;
  options?: string[];
  value: string | string[];
}) {
  const [inAdd, setInAdd] = useState('');

  function addItem(value: string[]): void {
    props.onChange([...value, inAdd]);
    setInAdd('');
  }

  function renderEnumSingle() {
    let value: string;
    const value_ = props.value;
    if (Array.isArray(value_)) {
      value = value_.join(`,`);
    } else {
      value = is.string(props.value) ? props.value : String(props.value ?? '');
    }
    return (
      <Select value={value} onChange={value => props.onChange(value)}>
        {(props.options ?? []).map(option => (
          <Select.Option key={option} value={option}>
            {option}
          </Select.Option>
        ))}
      </Select>
    );
  }

  function renderList() {
    let value: string[];
    if (Array.isArray(props.value)) {
      value = props.value;
    } else {
      value = is.undefined(props.value) ? [] : [props.value];
    }
    return (
      <>
        {!is.undefined(props.options) ? (
          <Space style={{ width: '100%' }}>
            <Select
              value={inAdd}
              style={{ width: '250px' }}
              onChange={inAdd => setInAdd(inAdd)}
            >
              {(props.options ?? [])
                .filter(i => !value.includes(i))
                .map(option => (
                  <Select.Option key={option} value={option}>
                    {option}
                  </Select.Option>
                ))}
            </Select>
            <Button type="primary" onClick={() => addItem(value)}>
              Add
            </Button>
          </Space>
        ) : (
          <Input
            value={inAdd}
            onChange={({ target }) => setInAdd(target.value)}
            onPressEnter={() => addItem(value)}
            suffix={
              <Button type="primary" onClick={() => addItem(value)}>
                Add
              </Button>
            }
          />
        )}
        <Divider />
        <List
          pagination={{ size: 'small' }}
          dataSource={value.map((item, index) => [item, index])}
          renderItem={([item, index]) => (
            <List.Item>
              <List.Item.Meta
                title={<Typography.Text>{item}</Typography.Text>}
              />
              <Button
                danger
                type="text"
                onClick={() =>
                  props.onChange(value.filter((i, index_) => index_ !== index))
                }
              >
                X
              </Button>
            </List.Item>
          )}
        />
      </>
    );
  }

  function renderNumber() {
    if (props.numberType === 'date') {
      return renderText();
    }
    const value = is.number(props.value)
      ? props.value
      : Number(props.value ?? 0);
    return (
      <InputNumber value={value} onChange={value => props.onChange(value)} />
    );
  }

  function renderText() {
    let value: string;
    const value_ = props.value;
    if (Array.isArray(value_)) {
      value = value_.join(`,`);
    } else {
      value = is.string(props.value) ? props.value : String(props.value ?? '');
    }
    return (
      <Input
        value={value}
        onChange={({ target }) => props.onChange(target.value)}
      />
    );
  }

  if (['eq', 'ne', 'elem'].includes(props.operation)) {
    return !is.undefined(props?.options) ? renderEnumSingle() : renderText();
  }
  if (['regex'].includes(props.operation)) {
    return renderText();
  }
  if (['lt', 'lte', 'gt', 'gte'].includes(props.operation)) {
    return renderNumber();
  }
  if (['in', 'nin'].includes(props.operation)) {
    return renderList();
  }
  return <Skeleton />;
}
