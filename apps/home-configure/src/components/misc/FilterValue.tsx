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
import React from 'react';

type tState = {
  inAdd: string;
};

export class FilterValue extends React.Component<
  {
    numberType?: string;
    onChange: (value) => void;
    operation: string;
    options?: string[];
    value: string | string[];
  },
  tState
> {
  override state = {} as tState;

  override render() {
    if (['eq', 'ne', 'elem'].includes(this.props.operation)) {
      return !is.undefined(this.props?.options)
        ? this.renderEnumSingle()
        : this.renderText();
    }
    if (['regex'].includes(this.props.operation)) {
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

  private addItem(value: string[]): void {
    this.props.onChange([...value, this.state.inAdd]);
    this.setState({ inAdd: '' });
  }

  private renderEnumSingle() {
    let value: string;
    const value_ = this.props.value;
    if (Array.isArray(value_)) {
      value = value_.join(`,`);
    } else {
      value = is.string(this.props.value)
        ? this.props.value
        : String(this.props.value ?? '');
    }
    return (
      <Select value={value} onChange={value => this.props.onChange(value)}>
        {(this.props.options ?? []).map(option => (
          <Select.Option key={option} value={option}>
            {option}
          </Select.Option>
        ))}
      </Select>
    );
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
        {!is.undefined(this.props.options) ? (
          <Space style={{ width: '100%' }}>
            <Select
              value={this.state.inAdd}
              style={{ width: '250px' }}
              onChange={inAdd => this.setState({ inAdd })}
            >
              {(this.props.options ?? [])
                .filter(i => !value.includes(i))
                .map(option => (
                  <Select.Option key={option} value={option}>
                    {option}
                  </Select.Option>
                ))}
            </Select>
            <Button type="primary" onClick={() => this.addItem(value)}>
              Add
            </Button>
          </Space>
        ) : (
          <Input
            value={this.state.inAdd}
            onChange={({ target }) => this.setState({ inAdd: target.value })}
            onPressEnter={() => this.addItem(value)}
            suffix={
              <Button type="primary" onClick={() => this.addItem(value)}>
                Add
              </Button>
            }
          />
        )}
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
                  this.props.onChange(
                    value.filter((i, index_) => index_ !== index),
                  )
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
    if (this.props.numberType === 'date') {
      return this.renderText();
    }
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
    const value_ = this.props.value;
    if (Array.isArray(value_)) {
      value = value_.join(`,`);
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
