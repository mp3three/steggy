import { FILTER_OPERATIONS } from '@automagical/boilerplate';
import {
  ScheduleActivateDTO,
  StateChangeActivateDTO,
} from '@automagical/controller-shared';
import { CronExpression, is, TitleCase } from '@automagical/utilities';
import {
  Checkbox,
  Divider,
  Form,
  Input,
  InputNumber,
  Select,
  Skeleton,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import { sendRequest } from 'apps/automations/src/types';
import React from 'react';

import { EntityHistory } from '../../entities';
import { FilterValue, FuzzySelect } from '../../misc';

type tState = {
  debounce?: number;
  entity?: string;
  entityList?: string[];
  latch?: boolean;
  operation?: string;
  value: string | string[];
};

export class RoutineActivateStateChange extends React.Component<
  { activate?: StateChangeActivateDTO; entityUpdate: (entity: string) => void },
  tState
> {
  override state = { entityList: [] } as tState;

  override async componentDidMount(): Promise<void> {
    if (this.props.activate) {
      this.load(this.props.activate);
    }
    await this.refresh();
  }

  public getValue(): Omit<StateChangeActivateDTO, 'id'> {
    return {
      entity: this.state.entity,
      latch: this.state.latch,
      operation: this.state.operation as FILTER_OPERATIONS,
      value: this.state.value,
    };
  }

  public load(activate: StateChangeActivateDTO): void {
    this.setState({
      entity: activate.entity,
      latch: activate.latch,
      operation: activate.operation,
      value: activate.value as string | string[],
    });
  }

  override render() {
    const value = this.state.value;
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Form.Item label="Entity">
          <FuzzySelect
            onChange={entity => this.updateEntity(entity)}
            value={this.state.entity}
            data={this.state.entityList.map(id => ({ text: id, value: id }))}
          />
        </Form.Item>
        <Form.Item label="Operation">
          <Select
            value={this.state.operation}
            onChange={operation => this.setState({ operation })}
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
          {is.empty(this.state.operation) ? (
            <Skeleton />
          ) : (
            <FilterValue
              operation={this.state.operation}
              value={value}
              onChange={value => this.setState({ value })}
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
            checked={this.state.latch}
            onChange={({ target }) => this.setState({ latch: target.checked })}
          />
        </Form.Item>
        <Form.Item label="Debouce">
          <InputNumber
            value={this.state.debounce ?? -1}
            min={-1}
            onChange={debounce => this.setState({ debounce })}
            addonAfter={'ms'}
          />
        </Form.Item>
      </Space>
    );
  }

  private async refresh(): Promise<void> {
    const entityList = await sendRequest<string[]>(`/entity/list`);
    this.setState({ entityList });
  }

  private updateEntity(entity: string) {
    this.setState({ entity });
  }
}
