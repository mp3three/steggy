import { PersonDTO } from '@steggy/controller-shared';
import { Card, Form, Select, Tooltip, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

import { CurrentUserContext, FD_ICONS, sendRequest } from '../../types';

export function SelectedPerson() {
  const [people, setPeople] = useState<PersonDTO[]>([]);

  useEffect(() => {
    async function refresh() {
      setPeople(
        await sendRequest({
          control: { select: ['friendlyName'] },
          url: `/person`,
        }),
      );
    }
    refresh();
  }, []);

  return (
    <Card
      title={<Typography.Text strong>Persistence Target</Typography.Text>}
      type="inner"
    >
      <CurrentUserContext.Consumer>
        {({ person, load }) => (
          <Form.Item
            label={
              <Tooltip
                title={
                  <Typography>
                    Some UI data, such as pinned favorites, will be tracked
                    against the selected person. If no person is selected, then
                    the features will be unavailable for use.
                  </Typography>
                }
              >
                {FD_ICONS.get('information')} Person
              </Tooltip>
            }
          >
            <Select value={person?._id} onChange={value => load(value)}>
              {people.map(person => (
                <Select.Option key={person._id} value={person._id}>
                  {person.friendlyName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
      </CurrentUserContext.Consumer>
    </Card>
  );
}
