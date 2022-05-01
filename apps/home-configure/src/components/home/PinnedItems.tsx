import { PinnedItemDTO } from '@steggy/controller-shared';
import { TitleCase } from '@steggy/utilities';
import { Card, Empty, List, Typography } from 'antd';

import { CurrentUserContext } from '../../types';
import { EntityInspectButton } from '../entities';
import { GroupInspectButton, GroupStateEdit } from '../groups';
import { PersonInspectButton } from '../people';
import { RoomInspectButton } from '../rooms';
import { RoutineInspectButton } from '../routines/RoutineInspectButton';

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
    case 'group_state':
      return <GroupStateEdit state={item.target} />;
    case 'person':
      return <PersonInspectButton person={item.target} />;
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
              dataSource={person.pinned_items ?? []}
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