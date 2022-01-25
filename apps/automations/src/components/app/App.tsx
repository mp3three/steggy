import { Layout, Typography } from 'antd';
import React from 'react';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import { store } from '../../store';
import { Foot } from '../footer';
import { GroupDetail, GroupList } from '../groups';
import { HomePage } from '../home';
import { ApplicationMenu } from '../menu';
import { RoomDetail, RoomList } from '../rooms';

const { Header, Sider } = Layout;

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
              <Typography.Title>Automation Controller</Typography.Title>
            </Header>
            <Switch>
              <Route path="/room/:id" component={RoomDetail} />
              <Route path="/rooms" component={RoomList} />
              <Route path="/group/:id" component={GroupDetail} />
              <Route path="/groups" component={GroupList} />
              <Route path="/" component={HomePage} />
            </Switch>
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
