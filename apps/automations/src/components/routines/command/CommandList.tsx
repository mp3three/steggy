import PlusBoxMultiple from '@2fd/ant-design-icons/lib/PlusBoxMultiple';
import {
  CloseOutlined,
  MenuOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { RoutineCommandDTO, RoutineDTO } from '@automagical/controller-shared';
import { is, TitleCase } from '@automagical/utilities';
import {
  Button,
  Card,
  Form,
  FormInstance,
  List,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from 'react-sortable-hoc';

import { sendRequest } from '../../../types';
import { RoutineCommandDrawer } from '../RoutineCommandDrawer';

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

export class CommandList extends React.Component<{
  onUpdate: (routine: RoutineDTO) => void;
  routine: RoutineDTO;
}> {
  static propTypes = {
    id: PropTypes.string,
  };
  private commandCreateForm: FormInstance;
  private commandDrawer: RoutineCommandDrawer;

  private get id() {
    return this.props.routine._id;
  }

  override render() {
    return (
      <>
        <RoutineCommandDrawer
          routine={this.props.routine}
          onUpdate={routine => this.props.onUpdate(routine)}
          ref={i => (this.commandDrawer = i)}
        />
        <Card
          title="Command Actions"
          extra={
            <Popconfirm
              onConfirm={this.validateCommand.bind(this)}
              icon={<QuestionCircleOutlined style={{ visibility: 'hidden' }} />}
              title={
                <Form
                  onFinish={this.validateCommand.bind(this)}
                  ref={form => (this.commandCreateForm = form)}
                >
                  <Form.Item
                    label="Type"
                    name="type"
                    rules={[{ required: true }]}
                  >
                    <Select style={{ width: '200px' }} defaultActiveFirstOption>
                      <Select.Option value="entity_state">
                        Entity State
                      </Select.Option>
                      <Select.Option value="group_state">
                        Group State
                      </Select.Option>
                      <Select.Option value="group_action">
                        Group Action
                      </Select.Option>
                      <Select.Option value="room_state">
                        Room State
                      </Select.Option>
                      <Select.Option value="send_notification">
                        Send Notification
                      </Select.Option>
                      <Select.Option value="sleep">Sleep</Select.Option>
                      <Select.Option value="stop_processing">
                        Stop Processing
                      </Select.Option>
                      <Select.Option value="trigger_routine">
                        Trigger Routine
                      </Select.Option>
                      <Select.Option value="webhook">Webhook</Select.Option>
                    </Select>
                  </Form.Item>
                </Form>
              }
            >
              <Button size="small" icon={<PlusBoxMultiple />}>
                Add new
              </Button>
            </Popconfirm>
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
                  <Space onClick={() => this.commandDrawer.load(record)}>
                    <List.Item.Meta
                      style={{ minWidth: '250px' }}
                      title={
                        <Typography.Text
                          onClick={e => e.stopPropagation()}
                          style={{
                            minWidth: '250px',
                            whiteSpace: 'nowrap',
                            width: '100%',
                          }}
                          editable={{
                            onChange: value =>
                              this.renameCommand(record, value),
                          }}
                        >
                          {record.friendlyName}
                        </Typography.Text>
                      }
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
                  onClick={() => this.commandDrawer.load(item)}
                >
                  <List.Item.Meta
                    title={
                      <Typography.Text
                        onClick={e => e.stopPropagation()}
                        editable={{
                          onChange: value => this.renameCommand(item, value),
                        }}
                      >
                        {item.friendlyName}
                      </Typography.Text>
                    }
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

  private async renameCommand(
    command: RoutineCommandDTO,
    friendlyName: string,
  ): Promise<void> {
    const { routine } = this.props;
    const updated = await sendRequest<RoutineDTO>({
      body: {
        command: routine.command.map(i =>
          i.id === command.id
            ? {
                ...command,
                friendlyName,
              }
            : i,
        ),
      },
      method: 'put',
      url: `/routine/${routine._id}`,
    });
    this.props.onUpdate(updated);
  }

  private async validateCommand(): Promise<void> {
    try {
      const values = await this.commandCreateForm.validateFields();
      values.friendlyName = `${TitleCase(values.type)} action`;
      this.commandDrawer.load(values as RoutineCommandDTO);
    } catch (error) {
      console.error(error);
    }
  }
}
