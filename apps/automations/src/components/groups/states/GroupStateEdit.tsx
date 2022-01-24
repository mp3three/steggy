import {
  GroupDTO,
  GroupSaveStateDTO,
  RoomEntitySaveStateDTO,
} from '@text-based/controller-shared';
import { LightAttributesDTO } from '@text-based/home-assistant-shared';
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Layout,
  Row,
  Space,
  Spin,
  Typography,
} from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

import { sendRequest } from '../../../types';
import { LightGroupCard } from '../../entities';

type tStateType = { group: GroupDTO; name: string; state: GroupSaveStateDTO };

export const GroupStateEdit = withRouter(
  class extends React.Component<
    { id: string; state: string } & RouteComponentProps<{
      id: string;
      state: string;
    }>,
    tStateType
  > {
    static propTypes = {
      id: PropTypes.string,
      state: PropTypes.string,
    };
    override state = {
      group: undefined,
      name: undefined,
      state: {} as GroupSaveStateDTO,
    };
    private cards: LightGroupCard[];

    private get entities(): string[] {
      return this.state.group.entities;
    }

    override async componentDidMount(): Promise<void> {
      await this.refresh();
    }

    override render() {
      this.cards = [];
      return this.state?.group ? (
        <>
          <Row style={{ margin: '8px 16px' }}>
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link to={`/groups`}>Groups</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link to={`/group/${this.props.match.params.id}`}>
                  {this.state.group.friendlyName}
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link
                  to={`/group/${this.props.match.params.id}/state/${this.props.match.params.state}`}
                >
                  <Typography.Text
                    editable={{ onChange: name => this.nameUpdate(name) }}
                  >
                    {this.state.name}
                  </Typography.Text>
                </Link>
              </Breadcrumb.Item>
            </Breadcrumb>
          </Row>
          <Row style={{ height: '100%', margin: '8px 16px' }}>
            <Col span={14}>
              <Layout>
                <Layout.Content>
                  <Card title="Edit State">
                    <Space wrap>
                      {this.entities.map(entity => (
                        <LightGroupCard
                          ref={i => this.cards.push(i)}
                          key={entity}
                          state={this.state.state.states.find(
                            ({ ref }) => ref === entity,
                          )}
                          onUpdate={this.onStateChange.bind(this)}
                        />
                      ))}
                    </Space>
                  </Card>
                </Layout.Content>
              </Layout>
            </Col>
            <Col span={9} offset={1}>
              <Card title="Edit State">
                <LightGroupCard
                  title="Update all"
                  onUpdate={this.onStateChange.bind(this)}
                />
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <Layout.Content>
          <Spin size="large" tip="Loading..." />
        </Layout.Content>
      );
    }
    private async nameUpdate(name: string): Promise<void> {
      const { state, group } = this.state;
      if (name === state.friendlyName) {
        return;
      }
      state.friendlyName = name;

      await sendRequest<GroupDTO>(`/group/${group._id}/state/${state.id}`, {
        body: JSON.stringify({
          friendlyName: name,
        }),
        method: 'put',
      });
      this.setState({ name });
    }

    private onStateChange(state: RoomEntitySaveStateDTO): void {
      this.cards.forEach(i =>
        i.setState({ state: state.state, ...state.extra }),
      );
    }

    private async refresh(): Promise<void> {
      this.setState({ group: undefined, name: undefined, state: undefined });
      const { id, state: stateId } = this.props.match.params;
      const group = await sendRequest<GroupDTO>(`/group/${id}`);
      const state = group.save_states.find(({ id }) => id === stateId);
      const name = state.friendlyName;
      console.log(state);
      this.setState({ group, name, state });
    }
  },
);
