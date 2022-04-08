import { StateChangeActivateDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import {
  Checkbox,
  Divider,
  Form,
  InputNumber,
  Select,
  Skeleton,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import React from 'react';

import { sendRequest } from '../../../types';
import { FilterValue, FuzzySelect } from '../../misc';

type tState = {
  entityList?: string[];
};

export class RoutineActivateStateChange extends React.Component<
  {
    activate: StateChangeActivateDTO;
    onUpdate: (activate: Partial<StateChangeActivateDTO>) => void;
  },
  tState
> {
  override state = { entityList: [] } as tState;

  override async componentDidMount(): Promise<void> {
    await this.refresh();
  }

  override render() {
    const value = this.props.activate?.value;
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Form.Item label="Entity">
          <FuzzySelect
            onChange={entity => this.props.onUpdate({ entity })}
            value={this.props.activate?.entity}
            data={this.state.entityList.map(id => ({ text: id, value: id }))}
          />
        </Form.Item>
        <Form.Item label="Operation">
          <Select
            value={this.props.activate?.operation}
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
          {is.empty(this.props.activate?.operation) ? (
            <Skeleton />
          ) : (
            <FilterValue
              operation={this.props.activate?.operation}
              value={value as string | string[]}
              onChange={value => this.props.onUpdate({ value })}
            />
          )}
        </Form.Item>
        <Divider orientation="left">Modifiers</Divider>
        <Form.Item
          label={
            <Tooltip
              title={
                <Typography>
                  <Typography.Paragraph>
                    When not checked, every state change reported by Home
                    Assistant is eligable to trigger routines.
                  </Typography.Paragraph>
                  <Divider />
                  <Typography.Paragraph>
                    Some entities will repeatedly report the same state value
                    (ex:
                    <Typography.Text code>on, on, on, off, on</Typography.Text>
                    ). Latching allows for filtering out of the repeat values.
                  </Typography.Paragraph>
                </Typography>
              }
            >
              Latch
            </Tooltip>
          }
        >
          <Checkbox
            checked={this.props.activate?.latch}
            onChange={({ target }) =>
              this.props.onUpdate({ latch: target.checked })
            }
          />
        </Form.Item>
        <Form.Item label="Debouce">
          <InputNumber
            value={this.props.activate?.debounce ?? -1}
            min={-1}
            onChange={debounce => this.props.onUpdate({ debounce })}
            addonAfter={'ms'}
          />
        </Form.Item>
      </Space>
    );
  }

  private async refresh(): Promise<void> {
    const entityList = await sendRequest<string[]>({ url: `/entity/list` });
    this.setState({ entityList });
  }
}
