import { EditOutlined } from '@ant-design/icons';
import {
  GeneralSaveStateDTO,
  GroupDTO,
  GroupSaveStateDTO,
} from '@steggy/controller-shared';
import {
  ColorModes,
  FanAttributesDTO,
  LightAttributesDTO,
  LockAttributesDTO,
} from '@steggy/home-assistant-shared';
import {
  Button,
  Divider,
  Drawer,
  Layout,
  notification,
  Skeleton,
  Space,
  Spin,
  Typography,
} from 'antd';
import React, { useState } from 'react';

import { sendRequest } from '../../../types';
import {
  FanEntityCard,
  LightEntityCard,
  LockEntityCard,
  SwitchEntityCard,
} from '../../entities';

// eslint-disable-next-line radar/cognitive-complexity
export function GroupStateEdit(props: {
  group: GroupDTO;
  onUpdate: (group: GroupDTO) => void;
  state: GroupSaveStateDTO;
}) {
  const [dirty, setDirty] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [friendlyName, setFriendlyName] = useState(props.state.friendlyName);
  const cards: (
    | LightEntityCard
    | SwitchEntityCard
    | LockEntityCard
    | FanEntityCard
  )[] = [];
  const group = props.group;

  const entities = props.group.entities;

  function bulkEdit() {
    switch (group.type) {
      case 'light':
        return (
          <LightEntityCard
            title="Bulk change"
            onUpdate={(state, type) => onStateChange(state, type)}
          />
        );
      case 'switch':
        return (
          <SwitchEntityCard
            title="Bulk change"
            onUpdate={state => onStateChange(state)}
          />
        );
      case 'fan':
        return (
          <FanEntityCard
            title="Bulk change"
            onUpdate={state => onStateChange(state)}
          />
        );
      case 'lock':
        return (
          <LockEntityCard
            title="Bulk change"
            onUpdate={state => onStateChange(state)}
          />
        );
    }
    return <Skeleton />;
  }

  function entityRender(entity: string) {
    const state = props?.state?.states?.find(({ ref }) => ref === entity) || {
      extra: {},
      ref: entity,
      state: undefined,
    };
    switch (group.type) {
      case 'light':
        return (
          <LightEntityCard
            ref={i => cards.push(i)}
            key={entity}
            state={state}
            onUpdate={() => setDirty(true)}
          />
        );
      case 'switch':
        return (
          <SwitchEntityCard
            ref={i => cards.push(i)}
            key={entity}
            state={state}
            onUpdate={() => setDirty(true)}
          />
        );
      case 'fan':
        return (
          <FanEntityCard
            ref={i => cards.push(i)}
            key={entity}
            state={state}
            onUpdate={() => setDirty(true)}
          />
        );
      case 'lock':
        return (
          <LockEntityCard
            ref={i => cards.push(i)}
            key={entity}
            state={state}
            onUpdate={() => setDirty(true)}
          />
        );
    }
    return <Skeleton key={entity} />;
  }

  function onClose(warn: boolean): void {
    if (dirty && warn) {
      notification.warn({
        description: `Changes to ${props.state.friendlyName} were not saved`,
        message: 'Unsaved changes',
      });
    }
    setDrawer(false);
  }

  function onFanChange(state: GeneralSaveStateDTO<FanAttributesDTO>): void {
    cards.forEach(card =>
      (card as FanEntityCard)?.setState({
        percentage: state.extra.percentage,
      }),
    );
  }

  function onLightStateChange(
    state: GeneralSaveStateDTO<LightAttributesDTO>,
    type: string,
  ): void {
    setDirty(dirty);
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
    cards.forEach(i =>
      (i as LightEntityCard)?.setState(set as GeneralSaveStateDTO),
    );
  }

  function onLockChange(state: GeneralSaveStateDTO<LockAttributesDTO>): void {
    cards.forEach(card => {
      (card as LockEntityCard)?.setState({
        state: state.state,
      });
    });
  }

  async function onSave(): Promise<void> {
    const id = props.state.id;
    const states = cards.filter(i => !!i).map(i => i.getSaveState());
    const item = await sendRequest<GroupDTO>({
      body: { friendlyName, id, states } as GroupSaveStateDTO,
      method: 'put',
      url: `/group/${group._id}/state/${id}`,
    });
    setDirty(false);
    setDrawer(false);
    props.onUpdate(item);
  }

  function onStateChange(state: GeneralSaveStateDTO, type?: string): void {
    setDirty(true);
    switch (group.type) {
      case 'light':
        onLightStateChange(state, type);
        return;
      case 'switch':
        onSwitchStateChanged(state);
        return;
      case 'fan':
        onFanChange(state);
        return;
      case 'lock':
        onLockChange(state);
        return;
    }
  }

  function onSwitchStateChanged(state: GeneralSaveStateDTO): void {
    cards.forEach(i =>
      (i as SwitchEntityCard)?.setState({
        state: state.state,
      }),
    );
  }

  return props.group ? (
    <>
      <Button size="small" type="text" onClick={() => setDrawer(true)}>
        <EditOutlined /> {props.state.friendlyName}
      </Button>
      <Drawer
        title={
          <Typography.Text
            editable={{
              onChange: friendlyName => setFriendlyName(friendlyName),
            }}
          >
            {friendlyName}
          </Typography.Text>
        }
        size="large"
        visible={drawer}
        onClose={() => onClose(true)}
        extra={
          <Space>
            <Button type="primary" onClick={() => onSave()}>
              Save
            </Button>
            <Button onClick={() => onClose(false)}>Cancel</Button>
          </Space>
        }
      >
        <Space direction="vertical">
          {bulkEdit()}
          <Divider orientation="left">Edit State</Divider>
          <Space wrap>{entities.map(entity => entityRender(entity))}</Space>
        </Space>
        <Divider orientation="left">
          <Typography.Title level={4}>Identifiers</Typography.Title>
        </Divider>
        <Typography.Title level={5}>Group ID</Typography.Title>
        <Typography.Text code>{props.group._id}</Typography.Text>
        <Typography.Title level={5}>State ID</Typography.Title>
        <Typography.Text code>{props.state.id}</Typography.Text>
      </Drawer>
    </>
  ) : (
    <Layout.Content>
      <Spin size="large" tip="Loading..." />
    </Layout.Content>
  );
}
