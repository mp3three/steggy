import { Breadcrumb, Layout, Typography } from 'antd';
import React from 'react';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import { store } from '../../store';
import { Foot } from '../footer';
import { GroupList } from '../groups';
import { ApplicationMenu } from '../menu';

const { Title } = Typography;
const { Header, Content, Sider } = Layout;

export class App extends React.Component {
  override state = {
    collapsed: false,
  };

  onCollapse = (collapsed: boolean) => {
    this.setState({ collapsed });
  };

  override render() {
    const { collapsed } = this.state;
    return (
      <Provider store={store}>
        <Layout style={{ minHeight: '100vh' }}>
          <Sider collapsible collapsed={collapsed} onCollapse={this.onCollapse}>
            <div className="logo" />
            <ApplicationMenu />
          </Sider>

          <Layout className="site-layout">
            <Header>
              <Title>Automation Controller</Title>
            </Header>
            <Content style={{ margin: '0 16px' }}>
              <Switch>
                <Route path="/groups" component={GroupList} />
                <Route path="/">
                  <Breadcrumb style={{ margin: '16px 0' }}>
                    <Breadcrumb.Item>User</Breadcrumb.Item>
                    <Breadcrumb.Item>Bill</Breadcrumb.Item>
                  </Breadcrumb>
                </Route>
              </Switch>
            </Content>
            <Foot />
          </Layout>
        </Layout>
      </Provider>
    );
  }
}
