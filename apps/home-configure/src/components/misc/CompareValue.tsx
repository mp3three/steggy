import { FILTER_OPERATIONS, is } from '@automagical/utilities';
import { Form, Select, Skeleton } from 'antd';
import React from 'react';

import { FilterValue } from './FilterValue';

export class CompareValue extends React.Component<{
  onUpdate: (
    value: Partial<{
      operation: `${FILTER_OPERATIONS}`;
      value: string | string[];
    }>,
  ) => void;
  operation: `${FILTER_OPERATIONS}`;
  value: string | string[];
}> {
  override render() {
    return (
      <>
        <Form.Item label="Operation">
          <Select
            value={this.props.operation}
            onChange={operation => this.props.onUpdate({ operation })}
          >
            <Select.Option value="eq">Equals</Select.Option>
            <Select.Option value="ne">Not Equals</Select.Option>
            <Select.Option value="in">In List</Select.Option>
            <Select.Option value="nin">Not In List</Select.Option>
            <Select.Option value="lt">Less Than</Select.Option>
            <Select.Option value="lte">Less Than / Equals</Select.Option>
            <Select.Option value="gt">Greater Than</Select.Option>
            <Select.Option value="gte">Greater Than / Equals</Select.Option>
            <Select.Option value="regex">Regular Expression</Select.Option>
            <Select.Option value="elem">List Element</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Value">
          {is.empty(this.props.operation) ? (
            <Skeleton />
          ) : (
            <FilterValue
              operation={this.props.operation}
              value={this.props.value}
              onChange={value => this.props.onUpdate({ value })}
            />
          )}
        </Form.Item>
      </>
    );
  }
}
