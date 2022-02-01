import {
  ROOM_ENTITY_EXTRAS,
  RoomEntitySaveStateDTO,
} from '@text-based/controller-shared';
import { is } from '@text-based/utilities';
import { Divider, Empty, Form, Select, Skeleton, Space } from 'antd';
import React from 'react';

import { domain, sendRequest } from '../../../types';
import { LightEntityCard, SwitchEntityCard } from '../../entities';

type tState = {
  entities: string[];
  entity_id?: string;
  extra: ROOM_ENTITY_EXTRAS;
  state?: string;
};

export class EntityStateCommand extends React.Component<
  { command?: RoomEntitySaveStateDTO },
  tState
> {
  override state = {
    entities: [],
  } as tState;

  override async componentDidMount(): Promise<void> {
    await this.listEntities();
    const { command } = this.props;
    this.setState({
      entity_id: command.ref,
      extra: command.extra,
      state: command.state,
    });
  }

  public getValue(): RoomEntitySaveStateDTO {
    return {
      extra: this.state.extra,
      ref: this.state.entity_id,
      state: this.state.state,
    };
  }

  override render() {
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Form.Item>
          <Select
            value={this.state.entity_id}
            onChange={this.entityChange.bind(this)}
            showSearch
            style={{ width: '100%' }}
          >
            {this.state.entities.map(entity => (
              <Select.Option key={entity} value={entity}>
                {entity}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Divider />
        {this.renderPicker()}
      </Space>
    );
  }

  private entityChange(entity_id: string): void {
    this.setState({ entity_id });
  }

  private async listEntities(): Promise<void> {
    const entities = await sendRequest<string[]>(`/entity/list`);
    this.setState({
      entities: entities.filter(i =>
        ['light', 'switch', 'fan', 'media', 'lock'].includes(domain(i)),
      ),
    });
  }

  private renderPicker() {
    if (is.empty(this.state.entity_id)) {
      return <Empty />;
    }
    switch (domain(this.state.entity_id)) {
      case 'light':
        return (
          <LightEntityCard
            onUpdate={({ state, extra }) => this.setState({ extra, state })}
            state={this.getValue()}
          />
        );
      case 'switch':
        return (
          <SwitchEntityCard
            onUpdate={({ state, extra }) => this.setState({ extra, state })}
            state={this.getValue()}
          />
        );
    }
    return <Skeleton />;
  }
}
