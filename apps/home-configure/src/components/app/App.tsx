import { is } from '@automagical/utilities';
import { Layout, Typography } from 'antd';
import React from 'react';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import { store } from '../../store';
import { sendRequest } from '../../types';
import { EntityList } from '../entities';
import { Foot } from '../footer';
import { GroupList } from '../groups';
import { HomePage } from '../home';
import { ApplicationMenu } from '../menu';
import { RoomList } from '../rooms';
import { RoutineList } from '../routines';
import { SettingsPage } from '../settings';

const { Header, Sider, Content } = Layout;

export class App extends React.Component {
  override state = { collapsed: false };

  override render() {
    const { collapsed } = this.state;
    return (
      <Provider store={store}>
        <Layout style={{ minHeight: '100vh' }}>
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={this.onCollapse.bind(this)}
          >
            <ApplicationMenu />
          </Sider>
          <Layout>
            <Header>
              <Typography.Title level={2} style={{ padding: '8px' }}>
                Automation Controller
              </Typography.Title>
            </Header>
            <Content>
              {is.empty(sendRequest.ADMIN_KEY) ? (
                <SettingsPage />
              ) : (
                <Switch>
                  <Route path="/entities" component={EntityList} />
                  <Route path="/routines" component={RoutineList} />
                  <Route path="/rooms" component={RoomList} />
                  <Route path="/groups" component={GroupList} />
                  <Route path="/settings" component={SettingsPage} />
                  <Route path="/" component={HomePage} />
                </Switch>
              )}
            </Content>
            <Foot />
          </Layout>
        </Layout>
      </Provider>
    );
  }

  private onCollapse(collapsed: boolean) {
    this.setState({ collapsed });
  }
}
