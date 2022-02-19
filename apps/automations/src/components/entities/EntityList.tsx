import { HassStateDTO } from '@text-based/home-assistant-shared';
import {
  DOWN,
  INCREMENT,
  INVERT_VALUE,
  is,
  START,
  UP,
} from '@text-based/utilities';
import {
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Empty,
  Input,
  Layout,
  List,
  Row,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import fuzzy from 'fuzzysort';
import parse from 'html-react-parser';
import yaml from 'js-yaml';
import React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { domain, sendRequest } from '../../types';

type tState = {
  entities: string[];
  entity: HassStateDTO;
  flags: string[];
  search: { text: string; value: string }[];
};
const TEMP_TEMPLATE_SIZE = 3;

export const EntityList = withRouter(
  class extends React.Component<RouteComponentProps, tState> {
    override state = { entities: [], search: [], flags: [] } as tState;

    override async componentDidMount(): Promise<void> {
      await this.refresh();
    }

    override render() {
      return (
        <Layout>
          <Layout.Content style={{ padding: '16px' }}>
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link to="/entities">Entities</Link>
              </Breadcrumb.Item>
            </Breadcrumb>
            <Row style={{ margin: '16px 0 0 0', width: '100%' }} gutter={8}>
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
                    pagination={{ onChange: () => ({}) }}
                    dataSource={this.state.search}
                    renderItem={item => (
                      <List.Item>
                        <Button
                          type={
                            item.value !== this.state.entity?.entity_id
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
                {is.undefined(this.state.entity) ? (
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
                      {yaml.dump(this.state.entity).trimEnd()}
                    </SyntaxHighlighter>
                    {this.flags()}
                  </Card>
                )}
              </Col>
            </Row>
          </Layout.Content>
        </Layout>
      );
    }

    private flags() {
      const { entity } = this.state;
      if (domain(entity.entity_id) === 'light') {
        return (
          <>
            <Divider orientation="left">Flags</Divider>
            <Space direction="vertical">
              <Tooltip
                title={
                  <Typography.Text>
                    Fix for lights that do not include{' '}
                    <Typography.Text code>color_temp</Typography.Text> in
                    <Typography.Text code>
                      supported_color_modes
                    </Typography.Text>
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
            </Space>
          </>
        );
      }
      return undefined;
    }

    private async focus(entity_id: string) {
      await Promise.all(
        [
          async () => {
            const entity = await sendRequest<HassStateDTO>(
              `/entity/id/${entity_id}`,
            );
            this.setState({ entity });
          },
          async () => {
            const flags = await sendRequest<string[]>(
              `/entity/flags/${entity_id}`,
            );
            this.setState({ flags });
          },
        ].map(async f => await f()),
      );
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

    private async refresh(): Promise<void> {
      const entities = (await sendRequest<string[]>(`/entity/list`))
        // .filter(i => domain(i) === 'light')
        .sort((a, b) => (a > b ? UP : DOWN));
      this.setState({
        entities,
        search: entities.map(i => ({ text: i, value: i })),
      });
    }

    private async toggleFlag(flag: string, state: boolean) {
      let flags: string[];
      if (state) {
        flags = await sendRequest<string[]>(
          `/entity/flags/${this.state.entity.entity_id}`,
          {
            method: 'post',
            body: JSON.stringify({ flag }),
          },
        );
        this.setState({ flags });
        return;
      }
      flags = await sendRequest<string[]>(
        `/entity/flags/${this.state.entity.entity_id}/${flag}`,
        {
          method: 'delete',
        },
      );
      this.setState({ flags });
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
  },
);
