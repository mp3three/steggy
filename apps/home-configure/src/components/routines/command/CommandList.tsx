import {
  ActivateCommand,
  RoutineCommandDTO,
  RoutineDTO,
} from '@steggy/controller-shared';
import { ARRAY_OFFSET, is, TitleCase } from '@steggy/utilities';
import { Button, Card, List, Popconfirm, Space, Table } from 'antd';
import { useState } from 'react';
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from 'react-sortable-hoc';

import { FD_ICONS, sendRequest } from '../../../types';
import { RoutineCommandDrawer } from '../RoutineCommandDrawer';
import { CommandAdd } from './CommandAdd';

const DragHandle = SortableHandle(() => FD_ICONS.get('drag_handle'));
const SortableBody = SortableContainer(properties => <tbody {...properties} />);
const SortableItem = SortableElement(properties => (
  <tr {...properties} style={{ whiteSpace: 'nowrap' }} />
));

function array_move<T>(array: T[], old_index: number, new_index: number): T[] {
  if (new_index >= array.length) {
    let k = new_index - array.length + 1;
    while (k--) {
      array.push(undefined);
    }
  }
  array.splice(new_index, 0, array.splice(old_index, 1)[0]);
  return array; // for testing
}

export function CommandList(props: {
  highlight: boolean;
  onUpdate: (routine: RoutineDTO) => void;
  routine: RoutineDTO;
}) {
  const [command, setCommand] = useState<RoutineCommandDTO>();
  const id = props.routine._id;
  const overrideSync = props.routine.command.some(({ type }) =>
    (['sleep', 'stop_processing'] as ActivateCommand[]).includes(type),
  );

  function addCommand(routine: RoutineDTO): void {
    const command = routine.command[routine.command.length - ARRAY_OFFSET];
    setCommand(command);
    props.onUpdate(routine);
  }

  async function deleteCommand(item: RoutineCommandDTO): Promise<void> {
    const updated = await sendRequest<RoutineDTO>({
      method: 'delete',
      url: `/routine/${id}/command/${item.id}`,
    });
    props.onUpdate(updated);
  }

  function draggableBodyRow({ className, style, ...restProperties }) {
    is.undefined([className, style]);
    const dataSource = props.routine.command;
    const index = dataSource.findIndex(
      x => x.id === restProperties['data-row-key'],
    );
    return <SortableItem index={index} {...restProperties} />;
  }

  function draggableContainer(properties) {
    return (
      <SortableBody
        useDragHandle
        disableAutoscroll
        helperClass="row-dragging"
        onSortEnd={data => onSortEnd(data)}
        {...properties}
      />
    );
  }

  async function onSortEnd({ oldIndex, newIndex }) {
    if (oldIndex === newIndex) {
      return;
    }
    const command = array_move(props.routine.command, oldIndex, newIndex);
    const routine = await sendRequest<RoutineDTO>({
      body: { command },
      method: 'put',
      url: `/routine/${props.routine._id}`,
    });
    props.onUpdate(routine);
  }

  async function updateCommand(
    body: Partial<RoutineCommandDTO>,
  ): Promise<void> {
    const updated = await sendRequest<RoutineDTO>({
      body: body,
      method: 'put',
      url: `/routine/${props.routine._id}/command/${command.id}`,
    });
    setCommand(updated.command.find(({ id }) => id === command.id));
    props.onUpdate(updated);
  }

  return (
    <>
      <RoutineCommandDrawer
        routine={props.routine}
        onComplete={() => setCommand(undefined)}
        onUpdate={routine => updateCommand(routine)}
        command={command}
      />
      <Card
        type="inner"
        extra={
          <CommandAdd
            highlight={props.highlight}
            routine={props.routine}
            onCreate={routine => addCommand(routine)}
          />
        }
      >
        {props.routine.sync || overrideSync ? (
          <Table
            dataSource={props.routine.command}
            showHeader={false}
            pagination={false}
            rowKey="id"
            components={{
              body: {
                row: draggableBodyRow,
                wrapper: draggableContainer,
              },
            }}
          >
            <Table.Column
              className="drag-visible"
              width={30}
              render={() => <DragHandle />}
            />
            <Table.Column
              title="Friendly Name"
              dataIndex="friendlyName"
              render={(item, record: RoutineCommandDTO) => (
                <Space onClick={() => setCommand(record)}>
                  <List.Item.Meta
                    style={{ minWidth: '250px' }}
                    title={record.friendlyName}
                    description={TitleCase(record.type)}
                  />
                </Space>
              )}
            />
            <Table.Column
              width={30}
              render={(_, item: RoutineCommandDTO) => (
                <Popconfirm
                  icon={FD_ICONS.get('delete')}
                  title={`Are you sure you want to delete ${item.friendlyName}?`}
                  onConfirm={e => {
                    deleteCommand(item);
                    e.stopPropagation();
                  }}
                >
                  <Button danger type="text" onClick={e => e.stopPropagation()}>
                    {FD_ICONS.get('item_remove')}
                  </Button>
                </Popconfirm>
              )}
            />
          </Table>
        ) : (
          <List
            pagination={false}
            dataSource={props.routine.command}
            renderItem={item => (
              <List.Item key={item.id} onClick={() => setCommand(item)}>
                <List.Item.Meta
                  title={
                    <Button
                      size="small"
                      type={command?.id === item.id ? 'primary' : 'text'}
                    >
                      {item.friendlyName}
                    </Button>
                  }
                  description={TitleCase(item.type)}
                />
                <Popconfirm
                  icon={FD_ICONS.get('delete')}
                  title={`Are you sure you want to delete ${item.friendlyName}?`}
                  onConfirm={e => {
                    deleteCommand(item);
                    e.stopPropagation();
                  }}
                >
                  <Button danger type="text" onClick={e => e.stopPropagation()}>
                    {FD_ICONS.get('item_remove')}
                  </Button>
                </Popconfirm>
              </List.Item>
            )}
          />
        )}
      </Card>
    </>
  );
}
