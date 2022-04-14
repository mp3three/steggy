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
  Input,
  Layout,
  List,
  notification,
  Row,
  Typography,
} from 'antd';
import fuzzy from 'fuzzysort';
import parse from 'html-react-parser';
import React from 'react';

import { sendRequest } from '../../types';
import { EntityInspect } from './EntityInspect';

type tState = {
  entities: string[];
  entity?: HassStateDTO;
  entity_id: string;
  flags?: string[];
  search: { text: string; value: string }[];
};
const TEMP_TEMPLATE_SIZE = 3;

export class EntityList extends React.Component {
  override state = { entities: [], flags: [], search: [] } as tState;

  override async componentDidMount(): Promise<void> {
    await this.refresh();
  }

  override render() {
    return (
      <Layout>
        <Layout.Content style={{ padding: '16px' }}>
          <Row style={{ width: '100%' }} gutter={8}>
            <Col span={12}>
              <Card
                title={
                  <Input
                    placeholder="Filter"
                    onChange={({ target }) => this.updateSearch(target.value)}
                  />
                }
              >
                <List
                  pagination={{ size: 'small' }}
                  dataSource={this.state.search}
                  renderItem={item => (
                    <List.Item>
                      <Button
                        type={
                          item.value !== this.state.entity_id
                            ? 'text'
                            : 'primary'
                        }
                        onClick={() => this.focus(item.value)}
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
                entity={this.state.entity}
                flags={this.state.flags}
                onRename={name => this.onRename(name)}
                onFlagsUpdate={flags => this.setState({ flags })}
              />
            </Col>
          </Row>
        </Layout.Content>
      </Layout>
    );
  }

  private async focus(entity_id: string) {
    this.setState({ entity_id });
    await this.load(entity_id);
  }

  private highlight(result) {
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

  private async load(entity_id: string): Promise<void> {
    this.setState({ entity_id });
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

  private async onRename(name: string): Promise<void> {
    await this.refresh();
    await this.load(name);
  }

  private async refresh(): Promise<void> {
    const entities = (
      await sendRequest<string[]>({ url: `/entity/list` })
    ).sort((a, b) => (a > b ? UP : DOWN));
    this.setState({
      entities,
      search: entities.map(i => ({ text: i, value: i })),
    });
  }

  private updateSearch(searchText: string): void {
    if (is.empty(searchText)) {
      return this.setState({
        search: this.state.entities.map(i => ({ text: i, value: i })),
      });
    }
    const available = this.state.entities.map(text => ({ text }));
    const fuzzyResult = fuzzy.go(searchText, available, {
      key: 'text',
    });
    const search = fuzzyResult.map(result => {
      const { target } = result;
      const value = available.find(option => option.text === target);
      return {
        text: this.highlight(result),
        value: value.text,
      };
    });
    this.setState({ search });
  }
}
