import { FILTER_OPERATIONS, is } from '@steggy/utilities';
import { Form, Select, Skeleton } from 'antd';
import React from 'react';

import { FilterValue } from './FilterValue';

export const ALL_OPERATIONS = new Map<`${FILTER_OPERATIONS}`, string>([
  ['eq', 'Equals'],
  ['ne', 'Not Equals'],
  ['in', 'In List'],
  ['nin', 'Not In List'],
  ['lt', 'Less Than'],
  ['lte', 'Less Than / Equals'],
  ['gt', 'Greater Than'],
  ['gte', 'Greater Than / Equals'],
  ['regex', 'Regular Expression'],
  ['elem', 'List Element'],
]);
export class CompareValue extends React.Component<{
  availableOperations?: `${FILTER_OPERATIONS}`[];
  onUpdate: (
    value: Partial<{
      operation: `${FILTER_OPERATIONS}`;
      value: string | string[];
    }>,
  ) => void;
  operation: `${FILTER_OPERATIONS}`;
  value: string | string[];
  valueOptions?: string[];
}> {
  override render() {
    return (
      <>
        <Form.Item label="Operation">
          <Select
            value={this.props.operation}
            onChange={operation => this.props.onUpdate({ operation })}
          >
            {[...ALL_OPERATIONS.entries()]
              .filter(
                ([type]) =>
                  is.empty(this.props.availableOperations) ||
                  this.props.availableOperations.includes(type),
              )
              .map(([type, label]) => (
                <Select.Option key={type} value={type}>
                  {label}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>
        <Form.Item label="Value">
          {is.empty(this.props.operation) ? (
            <Skeleton />
          ) : (
            <FilterValue
              options={this.props.valueOptions}
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
