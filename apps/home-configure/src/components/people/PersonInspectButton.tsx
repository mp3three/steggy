import { PersonDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Button, Drawer } from 'antd';
import React, { useEffect, useState } from 'react';

import { sendRequest } from '../../types';
import { PeopleDetail } from './PeopleDetail';

export function PersonInspectButton(props: {
  onUpdate?: (room: PersonDTO) => void;
  person: PersonDTO | string;
}) {
  const [visible, setVisible] = useState(false);
  const [person, setPerson] = useState<PersonDTO>();

  async function load(visible?: boolean): Promise<void> {
    const room = await sendRequest<PersonDTO>({
      url: `/person/${
        is.string(props.person) ? props.person : props.person._id
      }`,
    });
    if (props.onUpdate) {
      props.onUpdate(room);
    }
    setPerson(room);
    if (visible) {
      setVisible(true);
    }
  }

  useEffect(() => {
    if (is.string(props.person)) {
      load();
      return;
    }
    setPerson(props.person);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.person]);

  return (
    <>
      <Drawer
        title="Person Details"
        size="large"
        visible={visible}
        onClose={() => setVisible(false)}
      >
        <PeopleDetail
          nested
          onUpdate={update =>
            props.onUpdate ? props.onUpdate(update) : undefined
          }
          person={person}
        />
      </Drawer>
      <Button
        size="small"
        type={visible ? 'primary' : 'text'}
        onClick={() => setVisible(true)}
      >
        {person?.friendlyName}
      </Button>
    </>
  );
}
