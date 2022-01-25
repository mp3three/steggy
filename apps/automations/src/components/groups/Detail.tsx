import { GroupDTO } from '@text-based/controller-shared';
import { is } from '@text-based/utilities';
import {
  Breadcrumb,
  Button,
  Card,
  Layout,
  Space,
  Spin,
  Typography,
} from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

import { sendRequest } from '../../types';
import { EntityModalPicker } from '../entities';
import { LightGroup } from './LightGroup';
import { GroupSaveStates } from './SaveState';

type tStateType = { color: string; group: GroupDTO; name: string };

export const GroupDetail = withRouter(
  class extends React.Component<
    { id: string } & RouteComponentProps<{ id: string }>,
    tStateType
  > {
    static propTypes = {
      id: PropTypes.string,
    };
    override state = {
      color: '#FF0000',
      group: undefined,
      name: undefined,
    };

    override async componentDidMount(): Promise<void> {
      await this.refresh();
    }

    override render() {
      return (
        <Layout style={{ height: '100%' }}>
          {this.state?.group ? (
            <Layout.Content style={{ margin: '16px' }}>
              <Breadcrumb>
                <Breadcrumb.Item>
                  <Link to={`/groups`}>Groups</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  <Link to={`/group/${this.state.group._id}`}>
                    <Typography.Text
                      editable={{ onChange: name => this.nameUpdate(name) }}
                    >
                      {this.state.name}
                    </Typography.Text>
                  </Link>
                </Breadcrumb.Item>
              </Breadcrumb>
              <Card
                title="Entities"
                key="entities"
                style={{ margin: '8px 0' }}
                extra={
                  <EntityModalPicker
                    exclude={this.state.group.entities}
                    domains={this.domainList()}
                    onAdd={this.addEntities.bind(this)}
                  />
                }
              >
                <LightGroup
                  group={this.state.group}
                  groupUpdate={this.refresh.bind(this)}
                />
              </Card>
              <GroupSaveStates
                group={this.state.group}
                onGroupUpdate={this.refresh.bind(this)}
              />
            </Layout.Content>
          ) : (
            <Layout.Content>
              <Spin size="large" tip="Loading..." />
            </Layout.Content>
          )}
          <Layout.Sider style={{ padding: '16px' }}>
            <Space direction="vertical" align="end" size={8}>
              <Button danger>Delete</Button>
              <Button>Circadian</Button>
              <Button>Off</Button>
              <Button>On</Button>
            </Space>
          </Layout.Sider>
        </Layout>
      );
    }

    private async addEntities(entities: string[]): Promise<void> {
      const { group } = this.state as { group: GroupDTO };
      group.entities = is.unique([...group.entities, ...entities]);
      this.setState({
        group: await sendRequest(`/group/${group._id}`, {
          body: JSON.stringify({
            entities: group.entities,
          } as Partial<GroupDTO>),
          method: 'put',
        }),
      });
    }

    private domainList(): string[] {
      const group = this.state.group as GroupDTO;
      switch (group.type) {
        case 'light':
          return ['light'] as string[];
        case 'switch':
          return ['light', 'fan', 'switch', 'climate'];
        case 'lock':
          return ['lock'];
        case 'fan':
          return ['fan'];
      }
      return [];
    }

    private groupRendering() {
      return <LightGroup group={this.state.group} />;
    }

    private async nameUpdate(name: string): Promise<void> {
      if (name === this.state.group.friendlyName) {
        return;
      }
      await sendRequest<GroupDTO>(`/group/${this.state.group._id}`, {
        body: JSON.stringify({
          friendlyName: name,
        }),
        method: 'put',
      });
      this.state.group.friendlyName = name;
      this.setState({ name });
    }

    private async onUpdate({ _id, ...group }: GroupDTO): Promise<void> {
      await sendRequest<GroupDTO>(`/group/${_id}`, {
        body: JSON.stringify(group),
        method: 'put',
      });
      await this.refresh();
    }

    private async refresh(group?: GroupDTO): Promise<void> {
      const { id } = this.props.match.params;
      // cheating refresh
      group ??= await sendRequest<GroupDTO>(`/group/${id}`);
      this.setState({ group, name: group.friendlyName });
    }
  },
);
