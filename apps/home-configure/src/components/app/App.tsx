import { is } from '@steggy/utilities';
import { Layout, Typography } from 'antd';
import React from 'react';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import { store } from '../../store';
import { ADMIN_KEY, BASE_URL } from '../../types';
import { EntityPage } from '../entities';
import { GroupPage } from '../groups';
import { HomePage } from '../home';
import { PeoplePage } from '../people';
import { RoomPage } from '../rooms';
import { RoutinePage } from '../routines';
import { SettingsPage } from '../settings';
import { ApplicationMenu } from './ApplicationMenu';

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
        {/* eslint-disable-next-line spellcheck/spell-checker */}
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
                  <Route path="/people" component={PeoplePage} />
                  <Route path="/entities" component={EntityPage} />
                  <Route path="/routines" component={RoutinePage} />
                  <Route path="/rooms" component={RoomPage} />
                  <Route path="/groups" component={GroupPage} />
                  <Route path="/settings" component={SettingsPage} />
                  <Route path="/" component={HomePage} />
                </Switch>
              )}
            </Content>
            <Layout.Footer style={{ textAlign: 'center' }}>
              <Typography.Link
                href="https://github.com/ccontour/steggy"
                target="_blank"
              >
                @steggy
              </Typography.Link>
            </Layout.Footer>
          </Layout>
        </Layout>
      </Provider>
    );
  }

  private onCollapse(collapsed: boolean) {
    this.setState({ collapsed });
  }
}
