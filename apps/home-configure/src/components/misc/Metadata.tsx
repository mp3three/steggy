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
  Empty,
  List,
  Popconfirm,
  Skeleton,
  Space,
  Tabs,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';

import { FD_ICONS, sendRequest } from '../../types';
import { RoutineListDetail } from '../routines';
import { MetadataEdit } from './MetadataEdit';

const TAB_LIST = [
  ['enable', 'Enable'],
  ['activate', 'Activate'],
  ['set_metadata', 'Set Metadata'],
  ['stop_processing', 'Stop Processing'],
];

// eslint-disable-next-line radar/cognitive-complexity
export function RoomMetadata(props: {
  onUpdate?: (room: RoomDTO) => void;
  person?: PersonDTO;
  room?: RoomDTO;
}) {
  const [activate, setActivate] = useState<RoutineDTO[]>([]);
  const [enable, setEnable] = useState<RoutineDTO[]>([]);
  const [metadata, setMetadata] = useState<RoomMetadataDTO>();
  const [routine, setRoutine] = useState<RoutineDTO>();
  const [set_metadata, setSetMetadata] = useState<RoutineDTO[]>([]);
  const [stop_processing, setStopProcessing] = useState<RoutineDTO[]>([]);
  // This seems like the best refactor for my terrible original solution
  // Don't judge me
  const getMap = new Map<string, unknown>([
    ['activate', activate],
    ['enable', enable],
    ['metadata', metadata],
    ['routine', routine],
    ['set_metadata', set_metadata],
    ['stop_processing', stop_processing],
  ]);
  const HAS_RELATED = !is.empty([
    ...activate,
    ...enable,
    ...set_metadata,
    ...stop_processing,
  ]);
  const setMap = new Map<string, (...i) => void>([
    ['activate', setActivate],
    ['enable', setEnable],
    ['metadata', setMetadata],
    ['routine', setRoutine],
    ['set_metadata', setSetMetadata],
    ['stop_processing', setStopProcessing],
  ]);
  const item = props.room ?? props.person;
  const base = props.room ? 'room' : 'person';

  useEffect(() => {
    async function refreshActivate() {
      item.metadata ??= [];
      const routines = await sendRequest<RoutineDTO[]>({
        control: {
          filters: new Set([
            {
              field: 'activate.type',
              value: 'metadata',
            },
            {
              field: 'activate.activate.property',
              operation: 'in',
              value: item.metadata.map(({ name }) => name),
            },
          ]),
        },
        url: `/routine`,
      });
      setActivate(routines);
    }

    async function refreshEnable() {
      item.metadata ??= [];
      const routines = await sendRequest<RoutineDTO[]>({
        control: {
          filters: new Set([
            {
              field: 'enable.comparisons.type',
              value: 'metadata',
            },
            {
              field: 'enable.comparisons.comparisons.property',
              operation: 'in',
              value: item.metadata.map(({ name }) => name),
            },
          ]),
        },
        url: `/routine`,
      });
      setEnable(routines);
    }

    async function refreshSetMetadata() {
      const routines = await sendRequest<RoutineDTO[]>({
        control: {
          filters: new Set([
            {
              field: 'command.type',
              value: 'set_metadata',
            },
            {
              field: 'command.command.name',
              operation: 'in',
              value: item.metadata.map(({ name }) => name),
            },
          ]),
        },
        url: `/routine`,
      });
      setSetMetadata(routines);
    }

    async function refreshStopProcessing() {
      const routines = await sendRequest<RoutineDTO[]>({
        control: {
          filters: new Set([
            {
              field: 'command.type',
              value: 'stop_processing',
            },
            {
              field: 'command.command.type',
              value: 'metadata',
            },
            {
              field: 'command.command.comparison.property',
              operation: 'in',
              value: item.metadata.map(({ name }) => name),
            },
          ]),
        },
        url: `/routine`,
      });
      setStopProcessing(routines);
    }
    async function refresh(): Promise<void> {
      await Promise.all([
        refreshActivate(),
        refreshEnable(),
        refreshSetMetadata(),
        refreshStopProcessing(),
      ]);
    }
    refresh();
  }, [item]);

  async function create(): Promise<void> {
    const room = await sendRequest<RoomDTO>({
      body: { name: Date.now().toString() } as Partial<RoomMetadataDTO>,
      method: 'post',
      url: `/${base}/${item._id}/metadata`,
    });
    props.onUpdate(room);
    const metadata = room.metadata[room.metadata.length - ARRAY_OFFSET];
    setMetadata(metadata);
  }

  async function remove(id: string) {
    props.onUpdate(
      await sendRequest({
        method: 'delete',
        url: `/${base}/${item._id}/metadata/${id}`,
      }),
    );
  }

  async function updateMetadata(
    update: Partial<RoomMetadataDTO>,
  ): Promise<void> {
    const room = await sendRequest<RoomDTO>({
      body: update,
      method: 'put',
      url: `/${base}/${item._id}/metadata/${metadata.id}`,
    });
    const updated = room.metadata.find(({ id }) => id === metadata.id);
    setMetadata(updated);
    if (props.onUpdate) {
      props.onUpdate(room);
    }
  }

  function updateRoutine(routine: RoutineDTO): void {
    TAB_LIST.forEach(([type]) => {
      const list = (getMap.get(type) as RoutineDTO[]).map(item => {
        if (item._id === routine._id) {
          const updated = {
            ...item,
            ...routine,
          };
          setRoutine(updated);
          return updated;
        }
        return item;
      });
      setMap.get(type)(list);
    });
  }

  return (
    <>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card
          type="inner"
          extra={
            <Button
              icon={FD_ICONS.get('plus_box')}
              size="small"
              type={is.empty(item.metadata) ? 'primary' : 'text'}
              onClick={() => create()}
            >
              Create new
            </Button>
          }
        >
          <List
            pagination={{ size: 'small' }}
            dataSource={item.metadata}
            renderItem={record => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Button
                      size="small"
                      type={metadata?.id === record.id ? 'primary' : 'text'}
                      onClick={() => setMetadata(record)}
                    >
                      {is.empty(record.name) ? (
                        <Typography.Text type="danger">NO NAME</Typography.Text>
                      ) : (
                        record.name
                      )}
                    </Button>
                  }
                  description={record.type}
                />
                <Popconfirm
                  title={`Are you sure you want to remove ${record.name}?`}
                  onConfirm={() => remove(record.id)}
                >
                  <Button danger type="text">
                    X
                  </Button>
                </Popconfirm>
              </List.Item>
            )}
          />
        </Card>
        <Card
          type="inner"
          title={<Typography.Text strong>Related Routines</Typography.Text>}
        >
          {HAS_RELATED ? (
            <Tabs>
              {TAB_LIST.map(([key, label]) =>
                is.empty(getMap.get(key) as RoutineDTO[]) ? undefined : (
                  <Tabs.TabPane
                    tab={
                      <>
                        <Typography.Text type="secondary">{`(${
                          (getMap.get(key) as RoutineDTO[]).length
                        })`}</Typography.Text>
                        {` ${label}`}
                      </>
                    }
                    key={key}
                  >
                    <List
                      pagination={{ size: 'small' }}
                      dataSource={getMap.get(key) as RoutineDTO[]}
                      renderItem={item => (
                        <List.Item>
                          <Button
                            type={
                              routine?._id === item._id ? 'primary' : 'text'
                            }
                            onClick={() => setRoutine(item)}
                          >
                            {item.friendlyName}
                          </Button>
                        </List.Item>
                      )}
                    />
                  </Tabs.TabPane>
                ),
              )}
            </Tabs>
          ) : (
            <Empty />
          )}
        </Card>
      </Space>
      <MetadataEdit
        room={item}
        type={base}
        metadata={metadata}
        onUpdate={metadata => updateMetadata(metadata)}
        onComplete={() => setMetadata(undefined)}
      />
      <Drawer
        title="Edit routine"
        size="large"
        onClose={() => setRoutine(undefined)}
        visible={!is.undefined(routine)}
      >
        {is.undefined(routine) ? (
          <Skeleton />
        ) : (
          <RoutineListDetail
            nested
            routine={routine}
            onUpdate={routine => updateRoutine(routine)}
          />
        )}
      </Drawer>
    </>
  );
}
