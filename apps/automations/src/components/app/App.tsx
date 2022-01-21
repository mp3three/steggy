import { Layout, Typography } from 'antd';
import React from 'react';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import { store } from '../../store';
import { Foot } from '../footer';
import { GroupDetail, GroupList } from '../groups';
import { HomePage } from '../home';
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
            <ApplicationMenu />
          </Sider>
          <Layout className="site-layout">
            <Header>
              <Title>Automation Controller</Title>
            </Header>
            <Content style={{ margin: '16px' }}>
              <Switch>
                <Route path="/group/:id" component={GroupDetail} />
                <Route path="/groups" component={GroupList} />
                <Route path="/" component={HomePage} />
              </Switch>
            </Content>
            <Foot />
          </Layout>
        </Layout>
      </Provider>
    );
  }
}
