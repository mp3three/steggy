import { HassStateDTO } from '@automagical/home-assistant-shared';
import { is } from '@automagical/utilities';
import {
  Card,
  Checkbox,
  Divider,
  Empty,
  Space,
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

type tState = {
  entity: HassStateDTO;
  entity_id: string;
  flags: string[];
};

export class EntityInspect extends React.Component<{ prop?: unknown }, tState> {
  override state = { flags: [] } as tState;

  public async load(entity_id: string): Promise<void> {
    this.setState({ entity_id });
    await Promise.all(
      [
        async () => {
          const entity = await sendRequest<HassStateDTO>({
            url: `/entity/id/${entity_id}`,
          });
          this.setState({ entity });
        },
        async () => {
          const flags = await sendRequest<string[]>({
            url: `/entity/flags/${entity_id}`,
          });
          this.setState({ flags });
        },
      ].map(async f => await f()),
    );
  }

  override render() {
    return is.undefined(this.state?.entity) ? (
      <Card>
        <Empty description="Select an entity" />
      </Card>
    ) : (
      <Card
        title={
          <>
            {this.state.entity.attributes.friendly_name}
            <Typography.Text code style={{ marginLeft: '8px' }}>
              {this.state.entity.entity_id}
            </Typography.Text>
          </>
        }
      >
        <SyntaxHighlighter language="yaml" style={atomDark}>
          {dump(this.state.entity).trimEnd()}
        </SyntaxHighlighter>
        <Divider orientation="left">Links</Divider>
        <Card
          type="inner"
          title="Related Routines"
          style={{ marginTop: '16px' }}
        >
          <RelatedRoutines entity={this.state?.entity_id} />
        </Card>
        {this.editor()}
        {this.flags()}
      </Card>
    );
  }

  private editor() {
    const { entity } = this.state;
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
    const { entity } = this.state;
    if (!['light', 'fan'].includes(domain(entity.entity_id))) {
      return undefined;
    }
    return (
      <>
        <Divider orientation="left">Flags</Divider>
        <Space direction="vertical"></Space>
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
            checked={this.state.flags.includes('LIGHT_FORCE_CIRCADIAN')}
          >
            Circadian Compatibility
          </Checkbox>
        </Tooltip>
      );
    }
    if (type === 'fan') {
      return (
        <Tooltip
          title={
            <Typography.Text>
              This fan should do relative speed changes using fan_speed instead
              of percentages. Use when{' '}
              <Typography.Text code>percentage_step</Typography.Text> is an
              incorrect value
            </Typography.Text>
          }
        >
          <Checkbox
            onChange={({ target }) =>
              this.toggleFlag('USE_FAN_SPEEDS', target.checked)
            }
            checked={this.state.flags.includes('USE_FAN_SPEEDS')}
          >
            Use Fan Speeds
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
        url: `/entity/flags/${this.state.entity.entity_id}`,
      });
      this.setState({ flags });
      return;
    }
    flags = await sendRequest<string[]>({
      method: 'delete',
      url: `/entity/flags/${this.state.entity.entity_id}/${flag}`,
    });
    this.setState({ flags });
  }
}
