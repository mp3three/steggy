import { EditOutlined } from '@ant-design/icons';
import {
  GroupDTO,
  GroupSaveStateDTO,
  RoomEntitySaveStateDTO,
} from '@text-based/controller-shared';
import {
  ColorModes,
  LightAttributesDTO,
} from '@text-based/home-assistant-shared';
import {
  Button,
  Divider,
  Drawer,
  Layout,
  notification,
  Space,
  Spin,
  Typography,
} from 'antd';
import React from 'react';

import { sendRequest } from '../../../types';
import { LightGroupCard, SwitchEntityCard } from '../../entities';

export class GroupStateEdit extends React.Component<
  {
    group: GroupDTO;
    onUpdate: (group: GroupDTO) => void;
    state: GroupSaveStateDTO;
  },
  { dirty: boolean; drawer: boolean; friendlyName: string }
> {
  private cards: (LightGroupCard | SwitchEntityCard)[];
  private get group() {
    return this.props.group;
  }

  private get entities(): string[] {
    return this.props.group.entities;
  }

  override componentDidMount(): void {
    this.setState({ friendlyName: this.props.state.friendlyName });
  }

  override render() {
    this.cards = [];
    return this.props.group ? (
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
            {this.bulkEdit()}
            <Divider orientation="left">Edit State</Divider>
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

  private bulkEdit() {
    if (this.group.type === 'switch') {
      return (
        <SwitchEntityCard
          title="Bulk change"
          onUpdate={this.onStateChange.bind(this)}
        />
      );
    }
    return (
      <LightGroupCard
        title="Bulk change"
        onUpdate={this.onStateChange.bind(this)}
      />
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
    if (this.props.group.type === 'switch') {
      return (
        <SwitchEntityCard
          ref={i => this.cards.push(i)}
          key={entity}
          state={state}
          onUpdate={this.entityUpdate.bind(this)}
        />
      );
    }
    return (
      <LightGroupCard
        ref={i => this.cards.push(i)}
        key={entity}
        state={state}
        onUpdate={this.entityUpdate.bind(this)}
      />
    );
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
      (i as LightGroupCard)?.setState(set as RoomEntitySaveStateDTO),
    );
  }

  private async onSave(): Promise<void> {
    const id = this.props.state.id;
    const group = await sendRequest<GroupDTO>(
      `/group/${this.group._id}/state/${id}`,
      {
        body: JSON.stringify({
          friendlyName: this.state.friendlyName,
          id,
          states: this.cards.filter(i => !!i).map(i => i.getSaveState()),
        } as GroupSaveStateDTO),
        method: 'put',
      },
    );
    this.setState({ dirty: false, drawer: false });
    this.props.onUpdate(group);
  }

  private onStateChange(state: RoomEntitySaveStateDTO, type: string): void {
    this.setState({ dirty: true });
    if (this.group.type === 'light') {
      this.onLightStateChange(state, type);
      return;
    }
    this.onSwitchStateChanged(state);
  }

  private onSwitchStateChanged(state: RoomEntitySaveStateDTO): void {
    this.cards.forEach(i =>
      (i as SwitchEntityCard)?.setState({
        state: state.state,
      }),
    );
  }
}
