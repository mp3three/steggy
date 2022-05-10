import { Menu } from 'antd';
import { Link } from 'react-router-dom';

import { FD_ICONS, MenuItem } from '../../types';

function getSelected(isConfigured: boolean): string[] {
  if (!isConfigured) {
    return ['settings'];
  }
  if (window.location.href.includes('/room')) {
    return ['rooms'];
  }
  if (window.location.href.includes('/people')) {
    return ['people'];
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
  return ['home'];
}

export function ApplicationMenu(props: { isConfigured: boolean }) {
  return (
    <Menu
      theme="dark"
      defaultSelectedKeys={getSelected(props.isConfigured)}
      mode="inline"
      items={
        [
          ...(!props.isConfigured
            ? []
            : [
                {
                  icon: FD_ICONS.get('home'),
                  key: 'home',
                  label: <Link to="/">Home</Link>,
                },
                {
                  icon: FD_ICONS.get('groups'),
                  key: 'groups',
                  label: <Link to="/groups">Groups</Link>,
                },
                {
                  icon: FD_ICONS.get('rooms'),
                  key: 'rooms',
                  label: <Link to="/rooms">Rooms</Link>,
                },
                {
                  icon: FD_ICONS.get('people'),
                  key: 'people',
                  label: <Link to="/people">People</Link>,
                },
                {
                  icon: FD_ICONS.get('routines'),
                  key: 'routines',
                  label: <Link to="/routines">Routines</Link>,
                },
                {
                  icon: FD_ICONS.get('entities'),
                  key: 'entities',
                  label: <Link to="/entities">Entities</Link>,
                },
              ]),
          {
            icon: FD_ICONS.get('settings'),
            key: 'settings',
            label: <Link to="/settings">Settings</Link>,
          },
        ] as MenuItem[]
      }
    />
  );
}
