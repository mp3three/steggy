import { HassStateDTO } from '@steggy/home-assistant-shared';
import { is } from '@steggy/utilities';
import {
  Card,
  Checkbox,
  Divider,
  Empty,
  Space,
  Tabs,
  Tooltip,
  Typography,
} from 'antd';
import { dump } from 'js-yaml';
import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { domain, sendRequest } from '../../types';
import { RelatedRoutines } from '../routines';
import { FanEntityCard } from './FanEntityCard';
import { LightEntityCard } from './LightEntityCard';
import { SwitchEntityCard } from './SwitchEntityCard';

export class EntityInspect extends React.Component<{
  entity: HassStateDTO;
  flags: string[];
  onFlagsUpdate?: (flags: string[]) => void;
}> {
  override render() {
    return is.undefined(this.props?.entity) ? (
      <Card>
        <Empty description="Select an entity" />
      </Card>
    ) : (
      <Card
        title={
          <>
            {this.props.entity.attributes.friendly_name}
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
            <RelatedRoutines entity={this.props?.entity?.entity_id} />
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
    switch (domain(entity.entity_id)) {
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

  private flags() {
    const { entity, flags } = this.props;

    return (
      <>
        <Divider orientation="left">Flags</Divider>
        <Space direction="vertical"></Space>
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
        {this.renderFlag(domain(entity))}
      </>
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
}
