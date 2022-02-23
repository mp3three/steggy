import AlarmBell from '@2fd/ant-design-icons/lib/AlarmBell';
import Bug from '@2fd/ant-design-icons/lib/Bug';
import BulletinBoard from '@2fd/ant-design-icons/lib/BulletinBoard';
import HomeAutomation from '@2fd/ant-design-icons/lib/HomeAutomation';
import LightbulbGroupOutline from '@2fd/ant-design-icons/lib/LightbulbGroupOutline';
import { HomeOutlined, SettingOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

export class ApplicationMenu extends React.Component {
  override render() {
    return (
      <Menu theme="dark" defaultSelectedKeys={this.getSelected()} mode="inline">
        <Menu.Item key="home" icon={<HomeOutlined />}>
          <Link to="/">Home</Link>
        </Menu.Item>
        <Menu.Item key="group" icon={<LightbulbGroupOutline />}>
          <Link to="/groups">Groups</Link>
        </Menu.Item>
        <Menu.Item key="room" icon={<BulletinBoard />}>
          <Link to="/rooms">Rooms</Link>
        </Menu.Item>
        <Menu.Item key="4" icon={<HomeAutomation />}>
          <Link to="/routines">Routines</Link>
        </Menu.Item>
        <Menu.Item key="entities" icon={<AlarmBell />}>
          <Link to="/entities">Entities</Link>
        </Menu.Item>
        <Menu.Item key="6" icon={<Bug />}>
          <Link to="/debugger">Debugger</Link>
        </Menu.Item>
        <Menu.Item key="7" icon={<SettingOutlined />}>
          <Link to="/settings">Settings</Link>
        </Menu.Item>
      </Menu>
    );
  }

  private getSelected(): string[] {
    if (window.location.href.includes('/room')) {
      return ['room'];
    }
    if (window.location.href.includes('/entities')) {
      return ['entities'];
    }
    if (window.location.href.includes('/group')) {
      return ['group'];
    }
    return ['home'];
  }
}
