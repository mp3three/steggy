import { is } from '@steggy/utilities';
import { Layout, Typography } from 'antd';
import React from 'react';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import { store } from '../../store';
import { ADMIN_KEY, BASE_URL } from '../../types';
import { EntityList } from '../entities';
import { Foot } from '../footer';
import { GroupList } from '../groups';
import { HomePage } from '../home';
import { ApplicationMenu } from '../menu';
import { RoomList } from '../rooms';
import { RoutineList } from '../routines';
import { SettingsPage } from '../settings';

const { Header, Sider, Content } = Layout;

type tState = {
  ADMIN_KEY: string;
  BASE_URL: string;
  collapsed: boolean;
};

export class App extends React.Component {
  override state = {
    ADMIN_KEY: localStorage.getItem(ADMIN_KEY),
    BASE_URL: localStorage.getItem(BASE_URL),
    collapsed: false,
  } as tState;

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
              {is.empty(this.state.ADMIN_KEY) ? (
                <SettingsPage
                  onConnectionUpdate={update => this.setState(update)}
                />
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
