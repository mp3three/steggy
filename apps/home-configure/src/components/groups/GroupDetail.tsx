import { GroupDTO } from '@automagical/controller-shared';
import { is } from '@automagical/utilities';
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Empty,
  Layout,
  Row,
  Space,
  Spin,
  Tabs,
  Typography,
} from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

import { sendRequest } from '../../types';
import { EntityModalPicker } from '../entities';
import { RelatedRoutines } from '../routines';
import { FanGroup } from './FanGroup';
import { GroupSaveStates } from './GroupSaveState';
import { LightGroup } from './LightGroup';
import { LockGroup } from './LockGroup';
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
              <Tabs type="card" style={{ margin: '16px 0' }}>
                <Tabs.TabPane tab="Setup" key="setup">
                  <Row gutter={8}>
                    <Col span={12}>
                      <Card
                        type="inner"
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
                    <Col span={12}>
                      <Card type="inner" title="Group Actions">
                        {this.groupActions()}
                      </Card>
                    </Col>
                  </Row>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Save States" key="save">
                  <GroupSaveStates
                    group={this.state.group}
                    onGroupUpdate={this.refresh.bind(this)}
                  />
                </Tabs.TabPane>
              </Tabs>
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
        await sendRequest({
          body: {
            entities: group.entities,
          } as Partial<GroupDTO>,
          method: 'put',
          url: `/group/${group._id}`,
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

    private groupActions() {
      if (this.state.group.type === 'light') {
        return (
          <>
            <Space>
              <Button type="primary">Circadian</Button>
              <Button type="primary">Off</Button>
              <Button type="primary">On</Button>
            </Space>
            <Card
              type="inner"
              title="Related Routines"
              style={{ marginTop: '16px' }}
            >
              <RelatedRoutines groupAction={this.state.group} />
            </Card>
          </>
        );
      }
      return <Empty description="No special actions for group" />;
    }

    private groupRendering() {
      if (this.state.group.type === 'light') {
        return (
          <LightGroup
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
      if (this.state.group.type === 'lock') {
        return (
          <LockGroup
            group={this.state.group}
            groupUpdate={this.onUpdate.bind(this)}
          />
        );
      }
      return (
        <SwitchGroup
          group={this.state.group}
          groupUpdate={this.onUpdate.bind(this)}
        />
      );
    }

    private async nameUpdate(name: string): Promise<void> {
      if (name === this.state.group.friendlyName) {
        return;
      }
      await sendRequest<GroupDTO>({
        body: {
          friendlyName: name,
        },
        method: 'put',
        url: `/group/${this.state.group._id}`,
      });
      this.state.group.friendlyName = name;
      this.setState({ name });
    }

    private async onUpdate({ _id, ...group }: GroupDTO): Promise<void> {
      await this.refresh(
        await sendRequest<GroupDTO>({
          body: group,
          method: 'put',
          url: `/group/${_id}`,
        }),
      );
    }

    private async refresh(group?: GroupDTO): Promise<void> {
      const { id } = this.props.match.params;
      // cheating refresh
      group ??= await sendRequest<GroupDTO>({ url: `/group/${id}` });
      this.setState({ group, name: group.friendlyName });
    }
  },
);
