import {
  CloseOutlined,
  MenuOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { RoutineCommandDTO, RoutineDTO } from '@automagical/controller-shared';
import { ARRAY_OFFSET, is, TitleCase } from '@automagical/utilities';
import { Button, Card, List, Popconfirm, Space, Table } from 'antd';
import React from 'react';
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from 'react-sortable-hoc';

import { sendRequest } from '../../../types';
import { RoutineCommandDrawer } from '../RoutineCommandDrawer';
import { CommandAdd } from './CommandAdd';

const DragHandle = SortableHandle(() => (
  <MenuOutlined style={{ color: '#999', cursor: 'grab' }} />
));
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
type tState = { command?: RoutineCommandDTO };

export class CommandList extends React.Component<
  {
    onUpdate: (routine: RoutineDTO) => void;
    routine: RoutineDTO;
  },
  tState
> {
  override state = {} as tState;

  private get id() {
    return this.props.routine._id;
  }

  override render() {
    return (
      <>
        <RoutineCommandDrawer
          routine={this.props.routine}
          onComplete={() => this.setState({ command: undefined })}
          onUpdate={routine => this.updateCommand(routine)}
          command={this.state.command}
        />
        <Card
          type="inner"
          extra={
            <CommandAdd
              routine={this.props.routine}
              onCreate={routine => this.addCommand(routine)}
            />
          }
        >
          {this.props.routine.sync ? (
            <Table
              dataSource={this.props.routine.command}
              showHeader={false}
              pagination={false}
              rowKey="id"
              components={{
                body: {
                  row: this.draggableBodyRow.bind(this),
                  wrapper: this.draggableContainer.bind(this),
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
                  <Space onClick={() => this.setState({ command: record })}>
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
                    icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                    title={`Are you sure you want to delete ${item.friendlyName}?`}
                    onConfirm={e => {
                      this.deleteCommand(item);
                      e.stopPropagation();
                    }}
                  >
                    <Button
                      danger
                      type="text"
                      onClick={e => e.stopPropagation()}
                    >
                      <CloseOutlined />
                    </Button>
                  </Popconfirm>
                )}
              />
            </Table>
          ) : (
            <List
              pagination={false}
              dataSource={this.props.routine.command}
              renderItem={item => (
                <List.Item
                  key={item.id}
                  onClick={() => this.setState({ command: item })}
                >
                  <List.Item.Meta
                    title={<Button type="text">{item.friendlyName}</Button>}
                    description={TitleCase(item.type)}
                  />
                  <Popconfirm
                    icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                    title={`Are you sure you want to delete ${item.friendlyName}?`}
                    onConfirm={e => {
                      this.deleteCommand(item);
                      e.stopPropagation();
                    }}
                  >
                    <Button
                      danger
                      type="text"
                      onClick={e => e.stopPropagation()}
                    >
                      <CloseOutlined />
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

  private addCommand(routine: RoutineDTO): void {
    const command = routine.command[routine.command.length - ARRAY_OFFSET];
    this.setState({ command });
    this.props.onUpdate(routine);
  }

  private async deleteCommand(item: RoutineCommandDTO): Promise<void> {
    const updated = await sendRequest<RoutineDTO>({
      method: 'delete',
      url: `/routine/${this.id}/command/${item.id}`,
    });
    this.props.onUpdate(updated);
  }

  private draggableBodyRow({ className, style, ...restProperties }) {
    is.undefined([className, style]);
    const dataSource = this.props.routine.command;
    const index = dataSource.findIndex(
      x => x.id === restProperties['data-row-key'],
    );
    return <SortableItem index={index} {...restProperties} />;
  }

  private draggableContainer(properties) {
    return (
      <SortableBody
        useDragHandle
        disableAutoscroll
        helperClass="row-dragging"
        onSortEnd={this.onSortEnd.bind(this)}
        {...properties}
      />
    );
  }

  private async onSortEnd({ oldIndex, newIndex }) {
    if (oldIndex === newIndex) {
      return;
    }
    const command = array_move(this.props.routine.command, oldIndex, newIndex);
    const routine = await sendRequest<RoutineDTO>({
      body: { command },
      method: 'put',
      url: `/routine/${this.props.routine._id}`,
    });
    this.props.onUpdate(routine);
  }

  private async updateCommand(
    command: Partial<RoutineCommandDTO>,
  ): Promise<void> {
    const updated = await sendRequest<RoutineDTO>({
      body: command,
      method: 'put',
      url: `/routine/${this.props.routine._id}/command/${this.state.command.id}`,
    });
    this.setState({
      command: updated.command.find(({ id }) => id === this.state.command.id),
    });
    this.props.onUpdate(updated);
  }
}
