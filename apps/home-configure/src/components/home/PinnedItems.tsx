import { PinnedItemDTO } from '@steggy/controller-shared';
import { DOWN, TitleCase, UP } from '@steggy/utilities';
import { Button, Card, Empty, List, Typography } from 'antd';

import { CurrentUserContext, FD_ICONS, sendRequest } from '../../types';
import { EntityInspectButton } from '../entities';
import { GroupInspectButton, GroupStateEdit } from '../groups';
import { PersonInspectButton } from '../people';
import { RoomInspectButton, RoomStateEdit } from '../rooms';
import { RoutineInspectButton } from '../routines/RoutineInspectButton';

const ID_MAP = new Map<string, string>();

function renderPin(item: PinnedItemDTO) {
  switch (item.type) {
    case 'group':
      return <GroupInspectButton group={item.target} />;
    case 'entity':
      return <EntityInspectButton entity_id={item.target} />;
    case 'room':
      return <RoomInspectButton room={item.target} />;
    case 'routine':
      return <RoutineInspectButton routine={item.target} />;
    case 'person':
      return <PersonInspectButton person={item.target} />;
    case 'group_state':
      return (
        <GroupStateEdit
          onBaseLoad={(target, state) => ID_MAP.set(state, target)}
          state={item.target}
        />
      );
    case 'person_state':
      return (
        <RoomStateEdit
          onBaseLoad={(target, state) => ID_MAP.set(state, target)}
          person_state={item.target}
        />
      );
    case 'room_state':
      return (
        <RoomStateEdit
          onBaseLoad={(target, state) => ID_MAP.set(state, target)}
          room_state={item.target}
        />
      );
  }
  return undefined;
}

async function activate(item: PinnedItemDTO) {
  const [base] = item.type.split('_');
  if (['group_state', 'person_state', 'room_state'].includes(item.type)) {
    await sendRequest({
      method: 'post',
      url: `/${base}/${ID_MAP.get(item.target)}/state/${item.target}`,
    });
    return;
  }
  if (item.type === 'routine') {
    await sendRequest({
      method: 'post',
      url: `/routine/${item.target}`,
    });
  }
}

function renderActivate(item: PinnedItemDTO) {
  switch (item.type) {
    case 'group_state':
    case 'person_state':
    case 'routine':
    case 'room_state':
      return (
        <Button
          type="primary"
          size="small"
          icon={FD_ICONS.get('execute')}
          onClick={() => activate(item)}
        >
          Activate
        </Button>
      );
  }
  return undefined;
}

export function PinnedItems() {
  return (
    <Card
      type="inner"
      title={<Typography.Text strong>Pinned Items</Typography.Text>}
    >
      <CurrentUserContext.Consumer>
        {({ person }) =>
          person ? (
            <List
              pagination={{ size: 'small' }}
              dataSource={(person.pinned_items ?? [])
                .filter(
                  ({ type }) =>
                    !['room_metadata', 'person_metadata'].includes(type),
                )
                .sort((a, b) => (a.type > b.type ? UP : DOWN))}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={renderPin(item)}
                    description={
                      <Typography.Text code>
                        {TitleCase(item.type)}
                      </Typography.Text>
                    }
                  />
                  {renderActivate(item)}
                </List.Item>
              )}
            />
          ) : (
            <Empty description="Select a user on the settings page to view pinned items" />
          )
        }
      </CurrentUserContext.Consumer>
    </Card>
  );
}
