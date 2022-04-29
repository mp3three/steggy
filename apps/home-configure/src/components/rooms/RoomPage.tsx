import { QuestionCircleOutlined } from '@ant-design/icons';
import type { RoomDTO } from '@steggy/controller-shared';
import { NOT_FOUND } from '@steggy/utilities';
import {
  Button,
  Card,
  Col,
  Form,
  FormInstance,
  Input,
  Layout,
  List,
  Popconfirm,
  Row,
} from 'antd';
import React, { useEffect, useState } from 'react';

import { FD_ICONS, sendRequest } from '../../types';
import { RoomListDetail } from './RoomListDetail';

const { Content } = Layout;

export function RoomPage() {
  const [room, setRoom] = useState<RoomDTO>();
  const [rooms, setRooms] = useState<RoomDTO[]>();
  let form: FormInstance;

  useEffect(() => {
    refresh();
  }, []);

  function onClone(room: RoomDTO) {
    setRoom(room);
    setRooms([...rooms, room]);
  }

  async function refresh(): Promise<RoomDTO[]> {
    const rooms = await sendRequest<RoomDTO[]>({
      control: {
        sort: ['friendlyName'],
      },
      url: `/room`,
    });
    setRooms(rooms);
    return rooms;
  }

  function renderRoom(room: RoomDTO) {
    return (
      <List.Item key={room._id}>
        <List.Item.Meta
          title={
            <Button
              size="small"
              type={room?._id === room._id ? 'primary' : 'text'}
              onClick={() => loadRoom(room)}
            >
              {room.friendlyName}
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
      setRooms([...rooms, target]);
      return;
    }
    setRooms(rooms.map(item => (target._id === item._id ? target : item)));
  }

  async function validate(): Promise<void> {
    try {
      const values = await form.validateFields();
      const created = await sendRequest<RoomDTO>({
        body: values,
        method: 'post',
        url: `/room`,
      });
      form.resetFields();
      const rooms = await refresh();
      setRoom(rooms.find(({ _id }) => _id === created._id));
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
                  icon={
                    <QuestionCircleOutlined style={{ visibility: 'hidden' }} />
                  }
                  onConfirm={() => validate()}
                  title={
                    <Form
                      onFinish={() => validate()}
                      ref={target => (form = target)}
                    >
                      <Form.Item
                        label="Friendly Name"
                        name="friendlyName"
                        rules={[{ required: true }]}
                      >
                        <Input />
                      </Form.Item>
                    </Form>
                  }
                >
                  <Button size="small" icon={FD_ICONS.get('plus_box')}>
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
