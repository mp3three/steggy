import {
  PersonDTO,
  RoomDTO,
  RoomMetadataDTO,
  RoutineDTO,
} from '@steggy/controller-shared';
import { ARRAY_OFFSET, is } from '@steggy/utilities';
import {
  Button,
  Card,
  Drawer,
  List,
  Popconfirm,
  Skeleton,
  Space,
  Tabs,
  Typography,
} from 'antd';
import React from 'react';

import { FD_ICONS, sendRequest } from '../../types';
import { RoutineListDetail } from '../routines';
import { MetadataEdit } from './MetadataEdit';

type tState = {
  activate: RoutineDTO[];
  enable: RoutineDTO[];
  metadata?: RoomMetadataDTO;
  routine: RoutineDTO;
  set_metadata: RoutineDTO[];
  stop_processing: RoutineDTO[];
};
const TAB_LIST = [
  ['enable', 'Enable'],
  ['activate', 'Activate'],
  ['set_metadata', 'Set Metadata'],
  ['stop_processing', 'Stop Processing'],
];

export class RoomMetadata extends React.Component<
  {
    onUpdate: (room: RoomDTO) => void;
    person?: PersonDTO;
    room?: RoomDTO;
  },
  tState
> {
  override state = {} as tState;

  override componentDidMount(): void {
    this.refresh();
  }

  private get base() {
    return this.props.room ? 'room' : 'person';
  }

  private get item() {
    return this.props.room ?? this.props.person;
  }

  override render() {
    return (
      <>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card
            type="inner"
            extra={
              <Button
                icon={FD_ICONS.get('plus_box')}
                size="small"
                onClick={this.create.bind(this)}
              >
                Create new
              </Button>
            }
          >
            <List
              dataSource={this.item.metadata}
              renderItem={record => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Button
                        size="small"
                        type={
                          this.state.metadata?.id === record.id
                            ? 'primary'
                            : 'text'
                        }
                        onClick={() => this.setState({ metadata: record })}
                      >
                        {is.empty(record.name) ? (
                          <Typography.Text type="danger">
                            NO NAME
                          </Typography.Text>
                        ) : (
                          record.name
                        )}
                      </Button>
                    }
                    description={record.type}
                  />
                  <Popconfirm
                    title={`Are you sure you want to remove ${record.name}?`}
                    onConfirm={() => this.remove(record.id)}
                  >
                    <Button danger type="text">
                      X
                    </Button>
                  </Popconfirm>
                </List.Item>
              )}
            />
          </Card>
          <Card type="inner" title="Related Routines">
            <Tabs>
              {TAB_LIST.map(([key, label]) => (
                <Tabs.TabPane tab={label} key={key}>
                  <List
                    pagination={{ pageSize: 5, size: 'small' }}
                    dataSource={this.state[key] as RoutineDTO[]}
                    renderItem={item => (
                      <List.Item>
                        <Button
                          type="text"
                          onClick={() => this.setState({ routine: item })}
                        >
                          {item.friendlyName}
                        </Button>
                      </List.Item>
                    )}
                  />
                </Tabs.TabPane>
              ))}
            </Tabs>
          </Card>
        </Space>
        <MetadataEdit
          room={this.item}
          metadata={this.state.metadata}
          onUpdate={metadata => this.updateMetadata(metadata)}
          onComplete={() => this.setState({ metadata: undefined })}
        />
        <Drawer
          title="Edit routine"
          size="large"
          onClose={() => this.setState({ routine: undefined })}
          visible={!is.undefined(this.state.routine)}
        >
          {is.undefined(this.state.routine) ? (
            <Skeleton />
          ) : (
            <RoutineListDetail
              nested
              routine={this.state.routine}
              onUpdate={routine => this.updateRoutine(routine)}
            />
          )}
        </Drawer>
      </>
    );
  }

  private async create(): Promise<void> {
    const room = await sendRequest<RoomDTO>({
      body: { name: Date.now().toString() } as Partial<RoomMetadataDTO>,
      method: 'post',
      url: `/${this.base}/${this.item._id}/metadata`,
    });
    this.props.onUpdate(room);
    const metadata = room.metadata[room.metadata.length - ARRAY_OFFSET];
    this.setState({ metadata });
  }

  private async refresh(): Promise<void> {
    await Promise.all([
      this.refreshActivate(),
      this.refreshEnable(),
      this.refreshSetMetadata(),
      this.refreshStopProcessing(),
    ]);
  }

  private async refreshActivate() {
    this.item.metadata ??= [];
    const routines = await sendRequest<RoutineDTO[]>({
      control: {
        filters: new Set([
          {
            field: 'activate.type',
            value: 'room_metadata',
          },
          {
            field: 'activate.activate.property',
            operation: 'in',
            value: this.item.metadata.map(({ name }) => name),
          },
        ]),
      },
      url: `/routine`,
    });
    this.setState({ activate: routines });
  }

  private async refreshEnable() {
    this.item.metadata ??= [];
    const routines = await sendRequest<RoutineDTO[]>({
      control: {
        filters: new Set([
          {
            field: 'enable.comparisons.type',
            value: 'room_metadata',
          },
          {
            field: 'enable.comparisons.comparisons.property',
            operation: 'in',
            value: this.item.metadata.map(({ name }) => name),
          },
        ]),
      },
      url: `/routine`,
    });
    this.setState({ enable: routines });
  }

  private async refreshSetMetadata() {
    const routines = await sendRequest<RoutineDTO[]>({
      control: {
        filters: new Set([
          {
            field: 'command.type',
            value: 'set_room_metadata',
          },
          {
            field: 'command.command.name',
            operation: 'in',
            value: this.item.metadata.map(({ name }) => name),
          },
        ]),
      },
      url: `/routine`,
    });
    this.setState({ set_metadata: routines });
  }

  private async refreshStopProcessing() {
    const routines = await sendRequest<RoutineDTO[]>({
      control: {
        filters: new Set([
          {
            field: 'command.type',
            value: 'stop_processing',
          },
          {
            field: 'command.command.type',
            value: 'room_metadata',
          },
          {
            field: 'command.command.comparison.property',
            operation: 'in',
            value: this.item.metadata.map(({ name }) => name),
          },
        ]),
      },
      url: `/routine`,
    });
    this.setState({ stop_processing: routines });
  }

  private async remove(id: string) {
    this.props.onUpdate(
      await sendRequest({
        method: 'delete',
        url: `/${this.base}/${this.item._id}/metadata/${id}`,
      }),
    );
  }

  private async updateMetadata(
    metadata: Partial<RoomMetadataDTO>,
  ): Promise<void> {
    const room = await sendRequest<RoomDTO>({
      body: metadata,
      method: 'put',
      url: `/${this.base}/${this.item._id}/metadata/${this.state.metadata.id}`,
    });
    this.props.onUpdate(room);
    const updated = room.metadata.find(
      ({ id }) => id === this.state.metadata?.id,
    );
    this.setState({ metadata: updated });
  }

  private updateRoutine(routine: RoutineDTO): void {
    TAB_LIST.forEach(([type]) => {
      const list = (this.state[type] as RoutineDTO[]).map(item => {
        if (item._id === this.state.routine._id) {
          const updated = {
            ...item,
            ...routine,
          };
          this.setState({ routine: updated });
          return updated;
        }
        return item;
      });
      this.setState({
        [type]: list,
      } as unknown as tState);
    });
  }
}
