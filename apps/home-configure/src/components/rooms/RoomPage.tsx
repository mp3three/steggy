import type { RoomDTO } from '@steggy/controller-shared';
import { DOWN, is, NOT_FOUND, UP } from '@steggy/utilities';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Layout,
  List,
  Popconfirm,
  Row,
} from 'antd';
import { useEffect, useState } from 'react';

import { FD_ICONS, sendRequest } from '../../types';
import { RoomListDetail } from './RoomListDetail';

const { Content } = Layout;

// eslint-disable-next-line radar/cognitive-complexity
export function RoomPage() {
  const [room, setRoom] = useState<RoomDTO>();
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [friendlyName, setFriendlyName] = useState('');

  useEffect(() => {
    refresh();
  }, []);

  function onClone(room: RoomDTO) {
    setRoom(room);
    setRooms(
      [...rooms, room].sort((a, b) =>
        a.friendlyName > b.friendlyName ? UP : DOWN,
      ),
    );
  }

  async function refresh(): Promise<RoomDTO[]> {
    const rooms = await sendRequest<RoomDTO[]>({
      control: {
        select: ['friendlyName'],
        sort: ['friendlyName'],
      },
      url: `/room`,
    });
    setRooms(rooms);
    return rooms;
  }

  function renderRoom(item: RoomDTO) {
    return (
      <List.Item key={item._id}>
        <List.Item.Meta
          title={
            <Button
              size="small"
              type={room?._id === item._id ? 'primary' : 'text'}
              onClick={() => loadRoom(item)}
            >
              {item.friendlyName}
            </Button>
          }
        />
      </List.Item>
    );
  }

  async function loadRoom(room: RoomDTO): Promise<void> {
    setRoom(
      await sendRequest({
        url: `/room/${room._id}`,
      }),
    );
  }

  function updateRoom(target: RoomDTO): void {
    if (!target) {
      setRoom(undefined);
      setRooms(rooms.filter(({ _id }) => _id !== room._id));
      return;
    }
    const index = rooms.findIndex(({ _id }) => _id === target._id);
    setRoom(target);
    if (index === NOT_FOUND) {
      setRooms(
        [...rooms, target].sort((a, b) =>
          a.friendlyName > b.friendlyName ? UP : DOWN,
        ),
      );
      return;
    }
    setRooms(rooms.map(item => (target._id === item._id ? target : item)));
  }

  async function validate(): Promise<void> {
    try {
      const created = await sendRequest<RoomDTO>({
        body: { friendlyName },
        method: 'post',
        url: `/room`,
      });
      const rooms = await refresh();
      setRoom(rooms.find(({ _id }) => _id === created._id));
      setFriendlyName('');
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Layout hasSider>
      <Content style={{ padding: '16px' }}>
        <Row gutter={8}>
          <Col span={12}>
            <Card
              extra={
                <Popconfirm
                  icon=""
                  onConfirm={() => validate()}
                  title={
                    <Form.Item
                      label="Friendly Name"
                      name="friendlyName"
                      rules={[{ required: true }]}
                    >
                      <Input
                        value={friendlyName}
                        onChange={({ target }) => setFriendlyName(target.value)}
                      />
                    </Form.Item>
                  }
                >
                  <Button
                    size="small"
                    type={!is.empty(rooms) ? 'text' : 'primary'}
                    icon={FD_ICONS.get('plus_box')}
                  >
                    Create new
                  </Button>
                </Popconfirm>
              }
            >
              <List
                dataSource={rooms}
                pagination={{ size: 'small' }}
                renderItem={room => renderRoom(room)}
              />
            </Card>
          </Col>
          <Col span={12}>
            <RoomListDetail
              onClone={room => onClone(room)}
              room={room}
              onUpdate={update => updateRoom(update)}
            />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
