import { HassStateDTO } from '@steggy/home-assistant-shared';
import {
  DOWN,
  INCREMENT,
  INVERT_VALUE,
  is,
  START,
  UP,
} from '@steggy/utilities';
import {
  Button,
  Card,
  Col,
  Dropdown,
  Input,
  Layout,
  List,
  Menu,
  notification,
  Row,
  Typography,
} from 'antd';
import fuzzy from 'fuzzysort';
import parse from 'html-react-parser';
import { useEffect, useState } from 'react';

import { FD_ICONS, sendRequest } from '../../types';
import { EntityInspect } from './EntityInspect';

type showTypes = 'default' | 'all';

const TEMP_TEMPLATE_SIZE = 3;

function highlight(result) {
  const open = '{'.repeat(TEMP_TEMPLATE_SIZE);
  const close = '}'.repeat(TEMP_TEMPLATE_SIZE);
  let highlighted = '';
  let matchesIndex = 0;
  let opened = false;
  const { target, indexes } = result;
  for (let i = START; i < target.length; i++) {
    const char = target[i];
    if (indexes[matchesIndex] === i) {
      matchesIndex++;
      if (!opened) {
        opened = true;
        highlighted += open;
      }
      if (matchesIndex === indexes.length) {
        highlighted += char + close + target.slice(i + INCREMENT);
        break;
      }
      highlighted += char;
      continue;
    }
    if (opened) {
      opened = false;
      highlighted += close;
    }
    highlighted += char;
  }
  return highlighted.replace(
    new RegExp(`${open}(.*?)${close}`, 'g'),
    i =>
      `<span style="color:#F66">${i.slice(
        TEMP_TEMPLATE_SIZE,
        TEMP_TEMPLATE_SIZE * INVERT_VALUE,
      )}</span>`,
  );
}

// eslint-disable-next-line radar/cognitive-complexity
export function EntityPage() {
  const [entities, setEntities] = useState<string[]>([]);
  const [entity, setEntity] = useState<HassStateDTO>(undefined);
  const [entity_id, setEntityId] = useState('');
  const [flags, setFlags] = useState([]);
  const [search, setSearch] = useState<{ text: string; value: string }[]>([]);
  const [searchText, setSearchText] = useState('');
  const [showType, setShowType] = useState<showTypes>('default');

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showType]);

  function updateSearch(searchText: string): void {
    if (is.empty(searchText)) {
      return setSearch(entities.map(i => ({ text: i, value: i })));
    }
    const available = entities.map(text => ({ text }));
    const fuzzyResult = fuzzy.go(searchText, available, {
      key: 'text',
    });
    const search = fuzzyResult.map(result => {
      const { target } = result;
      const value = available.find(option => option.text === target);
      return {
        text: highlight(result),
        value: value.text,
      };
    });
    setSearch(search);
    setSearchText(searchText);
  }

  async function focus(entity_id: string) {
    setEntityId(entity_id);
    await load(entity_id);
  }

  async function load(entity_id: string): Promise<void> {
    setEntityId(entity_id);
    await Promise.all(
      [
        async () => {
          const entity = await sendRequest<HassStateDTO>({
            url: `/entity/id/${entity_id}`,
          });
          if (is.undefined(entity.attributes)) {
            notification.open({
              description: (
                <Typography>
                  {`Server returned bad response. Verify that `}
                  <Typography.Text code>{entity_id}</Typography.Text> still
                  exists?
                </Typography>
              ),
              message: 'Entity not found',
              type: 'error',
            });
            return;
          }
          setEntity(entity);
        },
        async () => {
          const flags = await sendRequest<string[]>({
            url: `/entity/flags/${entity_id}`,
          });
          setFlags(flags);
        },
      ].map(async f => await f()),
    );
  }

  async function refresh(type = showType): Promise<void> {
    const entities = (
      await sendRequest<string[]>({
        url: type === 'default' ? `/entity/list` : '/entity/list-all',
      })
    ).sort((a, b) => (a > b ? UP : DOWN));
    setEntities(entities);
    setSearch(entities.map(i => ({ text: i, value: i })));
  }

  async function onRename(name: string): Promise<void> {
    await refresh();
    await load(name);
    if (!is.empty(searchText)) {
      setSearchText(searchText);
    }
  }

  return (
    <Layout>
      <Layout.Content style={{ padding: '16px' }}>
        <Row style={{ width: '100%' }} gutter={8}>
          <Col span={12}>
            <Card
              title={
                <Row gutter={8}>
                  <Col span={22}>
                    <Input
                      placeholder="Filter"
                      style={{ width: '100%' }}
                      size="small"
                      onChange={({ target }) => updateSearch(target.value)}
                    />
                  </Col>
                  <Col span={2}>
                    <Dropdown
                      overlay={
                        <Menu>
                          <Menu.Item>
                            <Button
                              style={{ width: '100%' }}
                              onClick={() => setShowType('default')}
                              type={
                                showType === 'default' ? 'primary' : 'default'
                              }
                            >
                              Default List
                            </Button>
                          </Menu.Item>
                          <Menu.Item>
                            <Button
                              style={{ width: '100%' }}
                              onClick={() => setShowType('all')}
                              type={showType === 'all' ? 'primary' : 'default'}
                            >
                              Include Hidden
                            </Button>
                          </Menu.Item>
                        </Menu>
                      }
                    >
                      <Button
                        type="text"
                        style={{ width: '100%' }}
                        size="small"
                      >
                        {FD_ICONS.get('filter')}
                      </Button>
                    </Dropdown>
                  </Col>
                </Row>
              }
            >
              <List
                pagination={{ size: 'small' }}
                dataSource={search}
                renderItem={item => (
                  <List.Item>
                    <Button
                      size="small"
                      type={item.value !== entity_id ? 'text' : 'primary'}
                      onClick={() => focus(item.value)}
                    >
                      {parse(item.text)}
                    </Button>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col span={12}>
            <EntityInspect
              onUpdate={entity => setEntity(entity)}
              entity={entity}
              flags={flags}
              onRename={name => onRename(name)}
              onFlagsUpdate={flags => setFlags(flags)}
            />
          </Col>
        </Row>
      </Layout.Content>
    </Layout>
  );
}
