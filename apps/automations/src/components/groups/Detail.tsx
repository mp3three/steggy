import { GroupDTO } from '@text-based/controller-shared';
import { Button, Divider, Input, Layout, Space, Spin } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

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
        <Layout hasSider>
          {this.state?.group ? (
            <Layout.Content>
              {this.groupRendering()}
              <GroupSaveStates group={this.state.group} />
            </Layout.Content>
          ) : (
            <Layout.Content>
              <Spin size="large" tip="Loading..." />
            </Layout.Content>
          )}
          <Layout.Sider>
            <Input
              value={this.state?.name}
              placeholder="Friendly name"
              onChange={e =>
                this.setState({ name: (e.target as HTMLInputElement).value })
              }
              onPressEnter={this.nameUpdate.bind(this)}
              onBlur={this.nameUpdate.bind(this)}
            />
            <Divider />
            <Space direction="vertical" align="end" size={8}>
              <EntityModalPicker
                // domain={HASS_DOMAINS.light}
                onAdd={this.refresh.bind(this)}
              />
              <Button>Create new save state</Button>
              <Button>Capture current state</Button>
              <Button>Delete</Button>
              <Button>Circadian</Button>
              <Button>Off</Button>
              <Button>On</Button>
            </Space>
          </Layout.Sider>
        </Layout>
      );
    }

    private groupRendering() {
      return <LightGroup group={this.state.group} />;
    }

    private async nameUpdate(): Promise<void> {
      if (this.state.name === this.state.group.friendlyName) {
        return;
      }
      await sendRequest(`/group/${this.state.group._id}`, {
        body: JSON.stringify({
          friendlyName: this.state.name,
        }),
        method: 'put',
      });
    }
    private async refresh(): Promise<void> {
      const { id } = this.props.match.params;
      const group = await sendRequest<GroupDTO>(`/group/${id}`);
      const name = group.friendlyName;
      this.setState({ group, name });
    }
  },
);
