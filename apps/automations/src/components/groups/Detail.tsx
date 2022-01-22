import { GroupDTO } from '@text-based/controller-shared';
import { TitleCase } from '@text-based/utilities';
import { Layout, Spin, Typography } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { ChromePicker } from 'react-color';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { sendRequest } from '../../types';
import { LightGroup } from './LightGroup';

const { Title } = Typography;

type tStateType = { color: string; group: GroupDTO };

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
    };

    override async componentDidMount(): Promise<void> {
      const { id } = this.props.match.params;
      const group = await sendRequest<GroupDTO>(`/group/${id}`);
      this.setState({ group });
    }

    override render() {
      return (
        <Layout>
          {this.state?.group ? (
            <Layout.Content>
              <Title level={3}>{this.state.group.friendlyName}</Title>
              <Title level={5}>
                {TitleCase(this.state.group.type || '')} Group
              </Title>
              {this.groupRendering()}
            </Layout.Content>
          ) : (
            <Layout.Content>
              <Spin size="large" tip="Loading..." />
            </Layout.Content>
          )}
          <Layout.Sider>
            <ChromePicker
              onChange={i => this.setState({ color: i.hex })}
              onChangeComplete={i => this.setState({ color: i.hex })}
              color={this.state.color}
            />
          </Layout.Sider>
        </Layout>
      );
    }

    private groupRendering() {
      return <LightGroup group={this.state.group} />;
    }
  },
);
