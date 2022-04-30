import { Switch } from 'antd';

import { CurrentUserContext, FD_ICONS } from '../../types';

export function ItemPin(props: { target: string; type: string }) {
  return (
    <CurrentUserContext.Consumer>
      {({ person, togglePin }) =>
        person ? (
          <Switch
            style={{ marginRight: '8px' }}
            checked={(person?.pinned_items ?? []).some(
              pin => pin.target === props.target && pin.type === props.type,
            )}
            checkedChildren={FD_ICONS.get('pin')}
            unCheckedChildren={FD_ICONS.get('pin_off')}
            onChange={add => togglePin(props.type, props.target, add)}
          />
        ) : (
          <Switch disabled unCheckedChildren={FD_ICONS.get('pin_off')} />
        )
      }
    </CurrentUserContext.Consumer>
  );
}
