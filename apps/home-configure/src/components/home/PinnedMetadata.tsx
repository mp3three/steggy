import { DOWN, UP } from '@steggy/utilities';
import { Card, Empty, List, Typography } from 'antd';

import { CurrentUserContext } from '../../types';

export function PinnedMetadata() {
  return (
    <Card
      type="inner"
      title={<Typography.Text strong>Pinned Metadata</Typography.Text>}
    >
      <CurrentUserContext.Consumer>
        {({ person }) =>
          person ? (
            <List
              pagination={{ size: 'small' }}
              dataSource={(person.pinned_items ?? [])
                .filter(({ type }) =>
                  ['room_metadata', 'person_metadata'].includes(type),
                )
                .sort((a, b) => (a.type > b.type ? UP : DOWN))}
            />
          ) : (
            <Empty description="Select a user on the settings page to view pinned items" />
          )
        }
      </CurrentUserContext.Consumer>
    </Card>
  );
}
