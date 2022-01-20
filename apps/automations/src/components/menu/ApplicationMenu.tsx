import 'antd/dist/antd.less';

import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import React from 'react';

export class ApplicationMenu extends React.Component {
  override render() {
    return (
      <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
        <Menu.Item key="1" icon={<PieChartOutlined />}>
          Home
        </Menu.Item>
        <Menu.Item key="2" icon={<DesktopOutlined />}>
          Groups
        </Menu.Item>
        {/* <SubMenu key="sub1" icon={<UserOutlined />} title="User">
              <Menu.Item key="3">Tom</Menu.Item>
              <Menu.Item key="4">Bill</Menu.Item>
              <Menu.Item key="5">Alex</Menu.Item>
            </SubMenu>
            <SubMenu key="sub2" icon={<TeamOutlined />} title="Team">
              <Menu.Item key="6">Team 1</Menu.Item>
              <Menu.Item key="8">Team 2</Menu.Item>
            </SubMenu> */}
        <Menu.Item key="3" icon={<FileOutlined />}>
          Rooms
        </Menu.Item>
        <Menu.Item key="4" icon={<FileOutlined />}>
          Routines
        </Menu.Item>
        <Menu.Item key="5" icon={<FileOutlined />}>
          Entities
        </Menu.Item>
        <Menu.Item key="6" icon={<FileOutlined />}>
          Debugger
        </Menu.Item>
      </Menu>
    );
  }
}
