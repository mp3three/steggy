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
import dayjs from 'dayjs';
import { dump } from 'js-yaml';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { domain, FD_ICONS, MenuItem, sendRequest } from '../../types';
import { ItemPin } from '../misc';
import { FanEntityCard, LightEntityCard, SwitchEntityCard } from './domains';
import { EntityHistory } from './EntityHistory';
import { EntityIdChange } from './EntityIdChange';
import { EntityRelated } from './EntityRelated';

const LOAD_TIME = dayjs();
// eslint-disable-next-line radar/cognitive-complexity
export function EntityInspect(props: {
  entity: HassStateDTO;
  flags: string[];
  nested?: boolean;
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
      case 'input_boolean':
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

  function renderTabs() {
    return (
      <Tabs>
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
          <EntityHistory nested entity={props?.entity?.entity_id} />
        </Tabs.TabPane>
        <Tabs.TabPane key="flags" tab="Flags">
          {flags()}
        </Tabs.TabPane>
      </Tabs>
    );
  }
  if (is.undefined(props?.entity)) {
    return (
      <Card>
        {dayjs().subtract(1, 'hour').isBefore(LOAD_TIME) ? (
          <Empty description="Select an entity" />
        ) : (
          <Empty
            description={
              <Tooltip title={`Hurry up! ???? Steggy is getting bored `}>
                Select an entity
              </Tooltip>
            }
          />
        )}
      </Card>
    );
  }
  if (props.nested) {
    return renderTabs();
  }

  return (
    <Card
      extra={
        <Dropdown
          placement="bottomRight"
          overlay={
            <Menu
              items={
                [
                  {
                    label: (
                      <EntityIdChange
                        entity={props.entity?.entity_id}
                        onRename={name => props.onRename(name)}
                      />
                    ),
                  },
                  {
                    label: (
                      <ItemPin
                        type="entity"
                        target={props.entity.entity_id}
                        menuItem
                      />
                    ),
                  },
                ] as MenuItem[]
              }
            />
          }
        >
          <Button type="text" size="small">
            {FD_ICONS.get('menu')}
          </Button>
        </Dropdown>
      }
      title={
        <Typography.Text
          editable={{
            onChange: friendlyName => updateName(friendlyName),
          }}
        >
          {props.entity?.attributes?.friendly_name}
        </Typography.Text>
      }
    >
      {renderTabs()}
    </Card>
  );
}
