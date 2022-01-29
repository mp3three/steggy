import { EditOutlined } from '@ant-design/icons';
import {
  GroupSaveStateDTO,
  RoomDTO,
  RoomEntitySaveStateDTO,
  RoomStateDTO,
} from '@text-based/controller-shared';
import {
  ColorModes,
  LightAttributesDTO,
} from '@text-based/home-assistant-shared';
import { is } from '@text-based/utilities';
import {
  Button,
  Drawer,
  Layout,
  notification,
  Space,
  Spin,
  Typography,
} from 'antd';
import React from 'react';

import { domain, sendRequest } from '../../../types';
import { LightEntityCard, SwitchEntityCard } from '../../entities';

export class RoomStateEdit extends React.Component<
  {
    onUpdate: (group: RoomDTO) => void;
    room: RoomDTO;
    state: RoomStateDTO;
  },
  { dirty: boolean; drawer: boolean; friendlyName: string }
> {
  private cards: (LightEntityCard | SwitchEntityCard)[];
  private get room() {
    return this.props.room;
  }

  private get entities(): string[] {
    return this.props.room.entities
      .map(({ entity_id }) => entity_id)
      .filter(i => ['switch', 'light'].includes(domain(i)));
  }

  override componentDidMount(): void {
    this.setState({ friendlyName: this.props.state.friendlyName });
  }

  override render() {
    this.cards = [];
    return this.props.room ? (
      <>
        <Button
          size="small"
          type="text"
          onClick={() => this.setState({ drawer: true })}
        >
          <EditOutlined />
        </Button>
        <Drawer
          title={
            <Typography.Text
              editable={{
                onChange: friendlyName => this.setState({ friendlyName }),
              }}
            >
              {this.state?.friendlyName}
            </Typography.Text>
          }
          size="large"
          visible={this.state?.drawer}
          onClose={() => this.onClose(true)}
          extra={
            <Space>
              <Button type="primary" onClick={this.onSave.bind(this)}>
                Save
              </Button>
              <Button onClick={() => this.onClose(false)}>Cancel</Button>
            </Space>
          }
        >
          <Space direction="vertical">
            <Space wrap>
              {this.entities.map(entity => this.entityRender(entity))}
            </Space>
          </Space>
        </Drawer>
      </>
    ) : (
      <Layout.Content>
        <Spin size="large" tip="Loading..." />
      </Layout.Content>
    );
  }

  private entityRender(entity: string) {
    const state = this.props?.state?.states?.find(
      ({ ref }) => ref === entity,
    ) || {
      extra: {},
      ref: entity,
      state: undefined,
    };
    switch (domain(entity)) {
      case 'switch':
        return (
          <SwitchEntityCard
            ref={i => this.cards.push(i)}
            key={entity}
            state={state}
            stateOnly
            optional
            onUpdate={this.entityUpdate.bind(this)}
          />
        );
      case 'light':
        return (
          <LightEntityCard
            ref={i => this.cards.push(i)}
            key={entity}
            state={state}
            onUpdate={this.entityUpdate.bind(this)}
          />
        );
    }
    return undefined;
  }

  private entityUpdate(): void {
    this.setState({ dirty: true });
  }

  private onClose(warn: boolean): void {
    if (this.state.dirty && warn) {
      notification.warn({
        description: `Changes to ${this.props.state.friendlyName} were not saved`,
        message: 'Unsaved changes',
      });
    }
    this.setState({ drawer: false });
  }

  private onLightStateChange(
    state: RoomEntitySaveStateDTO<LightAttributesDTO>,
    type: string,
  ): void {
    this.setState({ dirty: true });
    const set: LightAttributesDTO & { state?: string } = {};
    switch (type) {
      case 'state':
        set.state = state.state;
        if (state.extra.color_mode === 'color_temp') {
          set.color_mode = 'color_temp' as ColorModes;
        } else {
          set.rgb_color = state.extra.rgb_color;
          set.color_mode = 'hs' as ColorModes;
        }
        break;
      case 'brightness':
        set.brightness = state.extra.brightness;
        break;
      case 'color':
        set.state = 'on';
        set.rgb_color = state.extra.rgb_color;
        set.color_mode = 'hs' as ColorModes;
        break;
    }
    console.log(set);
    this.cards.forEach(i =>
      (i as LightEntityCard)?.setState(set as RoomEntitySaveStateDTO),
    );
  }

  private async onSave(): Promise<void> {
    const id = this.props.state.id;
    const room = await sendRequest<RoomDTO>(
      `/room/${this.room._id}/state/${id}`,
      {
        body: JSON.stringify({
          friendlyName: this.state.friendlyName,
          id,
          states: this.cards
            .filter(i => !!i)
            .map(i => {
              const state = i.getSaveState();
              if (!state) {
                return undefined;
              }
              return { ...state, type: 'entity' };
            })
            .filter(i => !is.undefined(i)),
        } as RoomStateDTO),
        method: 'put',
      },
    );
    this.setState({ dirty: false, drawer: false });
    this.props.onUpdate(room);
  }

  private onSwitchStateChanged(state: RoomEntitySaveStateDTO): void {
    this.cards.forEach(i =>
      (i as SwitchEntityCard)?.setState({
        state: state.state,
      }),
    );
  }
}
