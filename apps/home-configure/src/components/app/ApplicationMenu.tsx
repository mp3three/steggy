import { is } from '@steggy/utilities';
import { Menu } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

import { FD_ICONS, sendRequest } from '../../types';

export class ApplicationMenu extends React.Component {
  override render() {
    return (
      <Menu theme="dark" defaultSelectedKeys={this.getSelected()} mode="inline">
        {is.empty(sendRequest.ADMIN_KEY) ? undefined : (
          <>
            <Menu.Item key="home" icon={FD_ICONS.get('home')}>
              <Link to="/">Home</Link>
            </Menu.Item>
            <Menu.Item key="entities" icon={FD_ICONS.get('entities')}>
              <Link to="/entities">Entities</Link>
            </Menu.Item>
            <Menu.Item key="groups" icon={FD_ICONS.get('groups')}>
              <Link to="/groups">Groups</Link>
            </Menu.Item>
            <Menu.Item key="rooms" icon={FD_ICONS.get('rooms')}>
              <Link to="/rooms">Rooms</Link>
            </Menu.Item>
            <Menu.Item key="people" icon={FD_ICONS.get('people')}>
              <Link to="/people">People</Link>
            </Menu.Item>
            <Menu.Item key="routines" icon={FD_ICONS.get('routines')}>
              <Link to="/routines">Routines</Link>
            </Menu.Item>
          </>
        )}
        <Menu.Item key="settings" icon={FD_ICONS.get('settings')}>
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
      return ['rooms'];
    }
    if (window.location.href.includes('/entities')) {
      return ['entities'];
    }
    if (window.location.href.includes('/groups')) {
      return ['groups'];
    }
    if (window.location.href.includes('/routines')) {
      return ['routines'];
    }
    if (window.location.href.includes('/settings')) {
      return ['settings'];
    }
    if (window.location.href.includes('/people')) {
      return ['people'];
    }
    return ['home'];
  }
}
