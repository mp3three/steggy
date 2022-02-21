import { is } from '@automagical/utilities';
import {
  Button,
  Card,
  Divider,
  Input,
  InputNumber,
  List,
  Skeleton,
  Typography,
} from 'antd';
import React from 'react';

type OPERATIONS =
  | 'elem'
  | 'regex'
  | 'in'
  | 'nin'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'ne'
  | 'eq';

export class FilterValue extends React.Component<{
  operation: string;
  onChange: (value) => void;
  value: string | string[];
}> {
  private addInput: Input;
  override state = { data: [] };

  override render() {
    if (['eq', 'ne', 'elem', 'regex'].includes(this.props.operation)) {
      return this.renderText();
    }
    if (['lt', 'lte', 'gt', 'gte'].includes(this.props.operation)) {
      return this.renderNumber();
    }
    if (['in', 'nin'].includes(this.props.operation)) {
      return this.renderList();
    }
    return <Skeleton />;
  }

  private renderList() {
    let value: string[];
    if (Array.isArray(this.props.value)) {
      value = this.props.value;
    } else {
      value = is.undefined(this.props.value) ? [] : [this.props.value];
    }
    return (
      <>
        <Input
          ref={input => (this.addInput = input)}
          onPressEnter={() => {
            this.props.onChange([...value, this.addInput.input.value]);
            this.addInput.setValue('');
          }}
          suffix={
            <Button
              type="primary"
              onClick={() => {
                this.props.onChange([...value, this.addInput.input.value]);
                this.addInput.setValue('');
              }}
            >
              Add
            </Button>
          }
        />
        <Divider />
        <List
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
                  this.props.onChange(value.filter((i, idx) => idx !== index))
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

  private renderNumber() {
    const value = is.number(this.props.value)
      ? this.props.value
      : Number(this.props.value ?? 0);
    return (
      <InputNumber
        value={value}
        onChange={value => this.props.onChange(value)}
      />
    );
  }

  private renderText() {
    let value: string;
    const val = this.props.value;
    if (Array.isArray(val)) {
      value = val.join(`,`);
    } else {
      value = is.string(this.props.value)
        ? this.props.value
        : String(this.props.value ?? '');
    }
    return (
      <Input
        value={value}
        onChange={({ target }) => this.props.onChange(target.value)}
      />
    );
  }
}
