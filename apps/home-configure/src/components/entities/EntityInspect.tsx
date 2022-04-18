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
import { EntityCardFan } from './EntityCardFan';
import { EntityCardLight } from './EntityCardLight';
import { EntityCardSwitch } from './EntityCardSwitch';
import { EntityIdChange } from './EntityIdChange';
import { EntityRelated } from './EntityRelated';

export class EntityInspect extends React.Component<{
  entity: HassStateDTO;
  flags: string[];
  onFlagsUpdate?: (flags: string[]) => void;
  onRename?: (name: string) => void;
  onUpdate?: (entity: HassStateDTO) => void;
}> {
  override render() {
    return is.undefined(this.props?.entity) ? (
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
                    entity={this.props.entity?.entity_id}
                    onRename={name => this.props.onRename(name)}
                  />
                </Menu.Item>
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
                onChange: friendlyName => this.updateName(friendlyName),
              }}
            >
              {this.props.entity?.attributes?.friendly_name}
            </Typography.Text>
            <Typography.Text code style={{ marginLeft: '8px' }}>
              {this.props.entity.entity_id}
            </Typography.Text>
          </>
        }
      >
        <Tabs type="card">
          <Tabs.TabPane key="description" tab="Description">
            <SyntaxHighlighter language="yaml" style={atomDark}>
              {dump(this.props.entity).trimEnd()}
            </SyntaxHighlighter>
            {this.editor()}
          </Tabs.TabPane>
          <Tabs.TabPane key="used_in" tab="Used In">
            <EntityRelated entity={this.props?.entity?.entity_id} />
          </Tabs.TabPane>
          <Tabs.TabPane key="flags" tab="Flags">
            {this.flags()}
          </Tabs.TabPane>
        </Tabs>
      </Card>
    );
  }

  private editor() {
    const { entity } = this.props;
    if (!entity?.entity_id) {
      return undefined;
    }
    switch (domain(entity?.entity_id)) {
      case 'light':
        return (
          <>
            <Divider orientation="left">Control</Divider>
            <EntityCardLight selfContained state={{ ref: entity.entity_id }} />
          </>
        );
      case 'media_player':
      case 'switch':
        return (
          <>
            <Divider orientation="left">Control</Divider>
            <EntityCardSwitch selfContained state={{ ref: entity.entity_id }} />
          </>
        );
      case 'fan':
        return (
          <>
            <Divider orientation="left">Control</Divider>
            <EntityCardFan selfContained state={{ ref: entity.entity_id }} />
          </>
        );
    }
    return undefined;
  }

  private flags() {
    const { entity, flags } = this.props;

    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Divider orientation="left">Flags</Divider>
        <Tooltip title="Add state / attribute changes to controller debug log">
          <Checkbox
            onChange={({ target }) =>
              this.toggleFlag('DEBUG_LOG', target.checked)
            }
            checked={flags.includes('DEBUG_LOG')}
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
              this.toggleFlag('IGNORE_ENTITY', target.checked)
            }
            checked={flags.includes('IGNORE_ENTITY')}
          >
            Ignore Entity
          </Checkbox>
        </Tooltip>
        {this.renderFlag(domain(entity))}
      </Space>
    );
  }

  private renderFlag(type: string) {
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
              this.toggleFlag('LIGHT_FORCE_CIRCADIAN', target.checked)
            }
            checked={this.props.flags.includes('LIGHT_FORCE_CIRCADIAN')}
          >
            Circadian Compatibility
          </Checkbox>
        </Tooltip>
      );
    }
    return undefined;
  }

  private async toggleFlag(flag: string, state: boolean) {
    let flags: string[];
    if (state) {
      flags = await sendRequest<string[]>({
        body: { flag },
        method: 'post',
        url: `/entity/flags/${this.props.entity.entity_id}`,
      });
      if (this.props.onFlagsUpdate) {
        this.props.onFlagsUpdate(flags);
      }
      return;
    }
    flags = await sendRequest<string[]>({
      method: 'delete',
      url: `/entity/flags/${this.props.entity.entity_id}/${flag}`,
    });
    if (this.props.onFlagsUpdate) {
      this.props.onFlagsUpdate(flags);
    }
  }

  private async updateName(name: string): Promise<void> {
    const entity = await sendRequest<HassStateDTO>({
      body: { name },
      method: 'put',
      url: `/entity/rename/${this.props.entity.entity_id}`,
    });
    if (this.props.onUpdate) {
      this.props.onUpdate(entity);
    }
  }
}
