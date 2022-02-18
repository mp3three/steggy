import { GroupDTO } from '@text-based/controller-shared';
import { is } from '@text-based/utilities';
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

import { sendRequest } from '../../types';
import { EntityModalPicker } from '../entities';
import { FanGroup } from './FanGroup';
import { GroupSaveStates } from './GroupSaveState';
import { LightGroup } from './LightGroup';
import { SwitchGroup } from './SwitchGroup';

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
              <Row style={{ margin: '8px 0' }}>
                <Col span={15}>
                  <Card
                    title="Entities"
                    key="entities"
                    extra={
                      <EntityModalPicker
                        exclude={this.state.group.entities}
                        domains={this.domainList()}
                        onAdd={this.addEntities.bind(this)}
                      />
                    }
                  >
                    {this.groupRendering()}
                  </Card>
                </Col>
                <Col span={8} offset={1}>
                  <Card title="Group Actions">
                    <Space>
                      <Button>Circadian</Button>
                      <Button>Off</Button>
                      <Button>On</Button>
                    </Space>
                  </Card>
                </Col>
              </Row>
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
        </Layout>
      );
    }

    private async addEntities(entities: string[]): Promise<void> {
      const { group } = this.state as { group: GroupDTO };
      group.entities = is.unique([...group.entities, ...entities]);
      this.refresh(
        await sendRequest(`/group/${group._id}`, {
          body: JSON.stringify({
            entities: group.entities,
          } as Partial<GroupDTO>),
          method: 'put',
        }),
      );
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
      if (this.state.group.type === 'switch') {
        return (
          <SwitchGroup
            group={this.state.group}
            groupUpdate={this.onUpdate.bind(this)}
          />
        );
      }
      if (this.state.group.type === 'fan') {
        return (
          <FanGroup
            group={this.state.group}
            groupUpdate={this.onUpdate.bind(this)}
          />
        );
      }
      return (
        <LightGroup
          group={this.state.group}
          groupUpdate={this.onUpdate.bind(this)}
        />
      );
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
      await this.refresh(
        await sendRequest<GroupDTO>(`/group/${_id}`, {
          body: JSON.stringify(group),
          method: 'put',
        }),
      );
    }

    private async refresh(group?: GroupDTO): Promise<void> {
      const { id } = this.props.match.params;
      // cheating refresh
      group ??= await sendRequest<GroupDTO>(`/group/${id}`);
      this.setState({ group, name: group.friendlyName });
    }
  },
);
