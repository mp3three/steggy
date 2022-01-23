import {
  BugOutlined,
  GroupOutlined,
  HomeOutlined,
  IdcardOutlined,
  RocketOutlined,
  SettingOutlined,
  SolutionOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

export class ApplicationMenu extends React.Component {
  override render() {
    return (
      <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
        <Menu.Item key="1" icon={<HomeOutlined />}>
          <Link to="/">Home</Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<GroupOutlined />}>
          <Link to="/groups">Groups</Link>
        </Menu.Item>
        <Menu.Item key="3" icon={<IdcardOutlined />}>
          <Link to="/rooms">Rooms</Link>
        </Menu.Item>
        <Menu.Item key="4" icon={<SolutionOutlined />}>
          <Link to="/routines">Routines</Link>
        </Menu.Item>
        <Menu.Item key="5" icon={<RocketOutlined />}>
          <Link to="/entities">Entities</Link>
        </Menu.Item>
        <Menu.Item key="6" icon={<BugOutlined />}>
          <Link to="/debugger">Debugger</Link>
        </Menu.Item>
        <Menu.Item key="7" icon={<SettingOutlined />}>
          <Link to="/settings">Settings</Link>
        </Menu.Item>
      </Menu>
    );
  }
}
