import { is } from '@steggy/utilities';
import { Layout, Typography } from 'antd';
import { Footer } from 'antd/lib/layout/layout';
import React from 'react';
import { Provider } from 'react-redux';
import { Link, Route, Switch } from 'react-router-dom';

import { store } from '../../store';
import { ADMIN_KEY, BASE_URL } from '../../types';
import { EntityList } from '../EntityPage';
import { GroupList } from '../GroupPage';
import { HomePage } from '../HomePage';
import { RoomList } from '../RoomPage';
import { RoutineList } from '../RoutinePage';
import { SettingsPage } from '../SettingsPage';
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
            <Footer style={{ textAlign: 'center' }}>
              <Link to="https://github.com/ccontour/steggy" target="_blank">
                @steggy
              </Link>
            </Footer>
          </Layout>
        </Layout>
      </Provider>
    );
  }

  private onCollapse(collapsed: boolean) {
    this.setState({ collapsed });
  }
}
