import AlarmBell from '@2fd/ant-design-icons/lib/AlarmBell';
import BulletinBoard from '@2fd/ant-design-icons/lib/BulletinBoard';
import HomeAutomation from '@2fd/ant-design-icons/lib/HomeAutomation';
import LightbulbGroupOutline from '@2fd/ant-design-icons/lib/LightbulbGroupOutline';
import { HomeOutlined, SettingOutlined } from '@ant-design/icons';
import { is } from '@automagical/utilities';
import { Menu } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

import { sendRequest } from '../../types';

export class ApplicationMenu extends React.Component {
  override render() {
    return (
      <Menu theme="dark" defaultSelectedKeys={this.getSelected()} mode="inline">
        {is.empty(sendRequest.ADMIN_KEY) ? undefined : (
          <>
            <Menu.Item key="home" icon={<HomeOutlined />}>
              <Link to="/">Home</Link>
            </Menu.Item>
            <Menu.Item key="group" icon={<LightbulbGroupOutline />}>
              <Link to="/groups">Groups</Link>
            </Menu.Item>
            <Menu.Item key="room" icon={<BulletinBoard />}>
              <Link to="/rooms">Rooms</Link>
            </Menu.Item>
            <Menu.Item key="routines" icon={<HomeAutomation />}>
              <Link to="/routines">Routines</Link>
            </Menu.Item>
            <Menu.Item key="entities" icon={<AlarmBell />}>
              <Link to="/entities">Entities</Link>
            </Menu.Item>
          </>
        )}
        <Menu.Item key="settings" icon={<SettingOutlined />}>
          <Link to="/settings">Settings</Link>
        </Menu.Item>
      </Menu>
    );
  }

  private getSelected(): string[] {
    if (is.empty(sendRequest.ADMIN_KEY)) {
      return ['settings'];
    }
    if (window.location.href.includes('/room')) {
      return ['room'];
    }
    if (window.location.href.includes('/ent')) {
      return ['entities'];
    }
    if (window.location.href.includes('/group')) {
      return ['group'];
    }
    if (window.location.href.includes('/routine')) {
      return ['routines'];
    }
    if (window.location.href.includes('/settings')) {
      return ['settings'];
    }
    return ['home'];
  }
}
