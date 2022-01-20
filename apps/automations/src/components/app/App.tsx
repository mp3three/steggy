import 'antd/dist/antd.less';

import { Breadcrumb, Layout, Typography } from 'antd';
import React from 'react';

import { Foot } from '../footer';
import { ApplicationMenu } from '../menu';

const { Title } = Typography;
const { Header, Content, Sider } = Layout;

export class App extends React.Component {
  override state = {
    collapsed: false,
  };

  onCollapse = (collapsed: boolean) => {
    // console.log(collapsed);
    this.setState({ collapsed });
  };

  override render() {
    const { collapsed } = this.state;
    return (
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
            <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item>User</Breadcrumb.Item>
              <Breadcrumb.Item>Bill</Breadcrumb.Item>
            </Breadcrumb>
            <div
              className="site-layout-background"
              style={{ minHeight: 360, padding: 24 }}
            >
              Bill is a cat.
            </div>
          </Content>
          <Foot />
        </Layout>
      </Layout>
    );
  }
}
