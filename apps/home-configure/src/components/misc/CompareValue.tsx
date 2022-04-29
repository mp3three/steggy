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
export function CompareValue(props: {
  availableOperations?: `${FILTER_OPERATIONS}`[];
  disabled?: boolean;
  numberType?: string;
  onUpdate: (
    value: Partial<{
      operation: `${FILTER_OPERATIONS}`;
      value: string | string[];
    }>,
  ) => void;
  operation: `${FILTER_OPERATIONS}`;
  value: string | string[];
  valueOptions?: string[];
}) {
  return (
    <>
      <Form.Item label="Operation">
        <Select
          disabled={props.disabled}
          value={props.operation}
          onChange={operation => props.onUpdate({ operation })}
        >
          {[...ALL_OPERATIONS.entries()]
            .filter(
              ([type]) =>
                is.empty(props.availableOperations) ||
                props.availableOperations.includes(type),
            )
            .map(([type, label]) => (
              <Select.Option key={type} value={type}>
                {label}
              </Select.Option>
            ))}
        </Select>
      </Form.Item>
      <Form.Item label="Value">
        {is.empty(props.operation) || props.disabled ? (
          <Skeleton />
        ) : (
          <FilterValue
            options={props.valueOptions}
            numberType={props.numberType}
            operation={props.operation}
            value={props.value}
            onChange={value => props.onUpdate({ value })}
          />
        )}
      </Form.Item>
    </>
  );
}
