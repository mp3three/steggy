import { HassStateDTO } from '@steggy/home-assistant-shared';
import { is } from '@steggy/utilities';
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Dropdown,
  Empty,
  Menu,
  Space,
  Tabs,
  Tooltip,
  Typography,
} from 'antd';
import { dump } from 'js-yaml';
import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { domain, FD_ICONS, sendRequest } from '../../types';
import { ItemPin } from '../misc';
import { EntityHistory } from './EntityHistory';
import { EntityIdChange } from './EntityIdChange';
import { EntityRelated } from './EntityRelated';
import { FanEntityCard } from './FanEntityCard';
import { LightEntityCard } from './LightEntityCard';
import { SwitchEntityCard } from './SwitchEntityCard';

// eslint-disable-next-line radar/cognitive-complexity
export function EntityInspect(props: {
  entity: HassStateDTO;
  flags: string[];
  onFlagsUpdate?: (flags: string[]) => void;
  onRename?: (name: string) => void;
  onUpdate?: (entity: HassStateDTO) => void;
}) {
  function editor() {
    const { entity } = props;
    if (!entity?.entity_id) {
      return undefined;
    }
    switch (domain(entity?.entity_id)) {
      case 'light':
        return (
          <>
            <Divider orientation="left">Control</Divider>
            <LightEntityCard selfContained state={{ ref: entity.entity_id }} />
          </>
        );
      case 'media_player':
      case 'switch':
        return (
          <>
            <Divider orientation="left">Control</Divider>
            <SwitchEntityCard selfContained state={{ ref: entity.entity_id }} />
          </>
        );
      case 'fan':
        return (
          <>
            <Divider orientation="left">Control</Divider>
            <FanEntityCard selfContained state={{ ref: entity.entity_id }} />
          </>
        );
    }
    return undefined;
  }

  async function updateName(name: string): Promise<void> {
    const entity = await sendRequest<HassStateDTO>({
      body: { name },
      method: 'put',
      url: `/entity/rename/${props.entity.entity_id}`,
    });
    if (props.onUpdate) {
      props.onUpdate(entity);
    }
  }

  function renderFlag(type: string) {
    if (type === 'light') {
      return (
        <Tooltip
          title={
            <Typography.Text>
              Fix for lights that do not include
              <Typography.Text code>color_temp</Typography.Text> in
              <Typography.Text code>supported_color_modes</Typography.Text>
            </Typography.Text>
          }
        >
          <Checkbox
            onChange={({ target }) =>
              toggleFlag('LIGHT_FORCE_CIRCADIAN', target.checked)
            }
            checked={props.flags?.includes('LIGHT_FORCE_CIRCADIAN')}
          >
            Circadian Compatibility
          </Checkbox>
        </Tooltip>
      );
    }
    return undefined;
  }

  async function toggleFlag(flag: string, state: boolean) {
    let flags: string[];
    if (state) {
      flags = await sendRequest<string[]>({
        body: { flag },
        method: 'post',
        url: `/entity/flags/${props.entity.entity_id}`,
      });
      if (props.onFlagsUpdate) {
        props.onFlagsUpdate(flags);
      }
      return;
    }
    flags = await sendRequest<string[]>({
      method: 'delete',
      url: `/entity/flags/${props.entity.entity_id}/${flag}`,
    });
    if (props.onFlagsUpdate) {
      props.onFlagsUpdate(flags);
    }
  }

  function flags() {
    const { entity, flags } = props;

    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Divider orientation="left">Flags</Divider>
        <Tooltip title="Add state / attribute changes to controller debug log">
          <Checkbox
            onChange={({ target }) => toggleFlag('DEBUG_LOG', target.checked)}
            checked={flags?.includes('DEBUG_LOG')}
          >
            Log Changes
          </Checkbox>
        </Tooltip>
        <Tooltip
          title={
            <Typography>
              Don't include this entity on any entity lists by default. Does not
              affect the processing of any logic, and entity will still appear
              inside any rooms/groups/routines it is already part of.
            </Typography>
          }
        >
          <Checkbox
            onChange={({ target }) =>
              toggleFlag('IGNORE_ENTITY', target.checked)
            }
            checked={flags?.includes('IGNORE_ENTITY')}
          >
            Ignore Entity
          </Checkbox>
        </Tooltip>
        {renderFlag(domain(entity))}
      </Space>
    );
  }

  return is.undefined(props?.entity) ? (
    <Card>
      <Empty description="Select an entity" />
    </Card>
  ) : (
    <Card
      extra={
        <Dropdown
          placement="bottomRight"
          overlay={
            <Menu>
              <Menu.Item>
                <EntityIdChange
                  entity={props.entity?.entity_id}
                  onRename={name => props.onRename(name)}
                />
              </Menu.Item>
              <ItemPin type="entity" target={props.entity.entity_id} menuItem />
            </Menu>
          }
        >
          <Button type="text" size="small">
            {FD_ICONS.get('menu')}
          </Button>
        </Dropdown>
      }
      title={
        <>
          <Typography.Text
            editable={{
              onChange: friendlyName => updateName(friendlyName),
            }}
          >
            {props.entity?.attributes?.friendly_name}
          </Typography.Text>
          <Typography.Text code style={{ marginLeft: '8px' }}>
            {props.entity.entity_id}
          </Typography.Text>
        </>
      }
    >
      <Tabs type="card">
        <Tabs.TabPane key="description" tab="Description">
          <SyntaxHighlighter language="yaml" style={atomDark}>
            {dump(props.entity).trimEnd()}
          </SyntaxHighlighter>
          {editor()}
        </Tabs.TabPane>
        <Tabs.TabPane key="used_in" tab="Used In">
          <EntityRelated entity={props?.entity?.entity_id} />
        </Tabs.TabPane>
        <Tabs.TabPane key="history" tab="History">
          <EntityHistory entity={props?.entity?.entity_id} />
        </Tabs.TabPane>
        <Tabs.TabPane key="flags" tab="Flags">
          {flags()}
        </Tabs.TabPane>
      </Tabs>
    </Card>
  );
}
