import {
  ROOM_ENTITY_EXTRAS,
  RoomEntitySaveStateDTO,
} from '@automagical/controller-shared';
import { is } from '@automagical/utilities';
import { Divider, Empty, Form, Select, Skeleton, Space } from 'antd';
import React from 'react';

import { domain, sendRequest } from '../../../types';
import {
  FanEntityCard,
  LightEntityCard,
  SwitchEntityCard,
} from '../../entities';
import { FuzzySelect } from '../../misc';

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
    if (command) {
      this.load(command);
    }
  }

  public getValue(): RoomEntitySaveStateDTO {
    return {
      extra: this.state.extra,
      ref: this.state.entity_id,
      state: this.state.state,
    };
  }

  public load(command: Partial<RoomEntitySaveStateDTO> = {}): void {
    this.setState({
      entity_id: command.ref,
      extra: command.extra,
      state: command.state,
    });
  }

  override render() {
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Form.Item label="Entity">
          <FuzzySelect
            value={this.state.entity_id}
            onChange={this.entityChange.bind(this)}
            style={{ width: '100%' }}
            data={this.state.entities.map(i => ({ text: i, value: i }))}
          />
        </Form.Item>
        <Divider orientation="left">State</Divider>
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
      case 'fan':
        return (
          <FanEntityCard
            relative
            onUpdate={({ state, extra }) => this.setState({ extra, state })}
            state={this.getValue()}
          />
        );
    }
    return <Skeleton />;
  }
}
