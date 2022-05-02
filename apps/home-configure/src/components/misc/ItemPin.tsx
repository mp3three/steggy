import { PersonDTO } from '@steggy/controller-shared';
import { Button, Menu, Switch } from 'antd';

import { CurrentUserContext, FD_ICONS } from '../../types';

export function ItemPin(props: {
  menuItem?: boolean;
  target: string;
  type: string;
}) {
  const isPinned = (person: PersonDTO) =>
    (person?.pinned_items ?? []).some(
      pin => pin.target === props.target && pin.type === props.type,
    );
  if (props.menuItem) {
    return (
      <Menu.Item>
        <CurrentUserContext.Consumer>
          {({ person, togglePin }) =>
            !person ? (
              <Button
                disabled
                icon={FD_ICONS.get('pin_off')}
                style={{ textAlign: 'start', width: '100%' }}
              >
                Pin
              </Button>
            ) : isPinned(person) ? (
              <Button
                style={{ textAlign: 'start', width: '100%' }}
                onClick={() => togglePin(props.type, props.target, false)}
                icon={FD_ICONS.get('pin_off')}
                type="dashed"
              >
                Unpin
              </Button>
            ) : (
              <Button
                style={{ textAlign: 'start', width: '100%' }}
                onClick={() => togglePin(props.type, props.target, true)}
                icon={FD_ICONS.get('pin')}
              >
                Pin
              </Button>
            )
          }
        </CurrentUserContext.Consumer>
      </Menu.Item>
    );
  }

  return (
    <CurrentUserContext.Consumer>
      {({ person, togglePin }) =>
        person ? (
          <Switch
            style={{ marginRight: '8px' }}
            checked={isPinned(person)}
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
