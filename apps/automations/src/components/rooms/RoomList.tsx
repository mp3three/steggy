import PlusBoxMultiple from '@2fd/ant-design-icons/lib/PlusBoxMultiple';
import { CloseOutlined } from '@ant-design/icons';
import type { RoomDTO } from '@text-based/controller-shared';
import { DOWN, UP } from '@text-based/utilities';
import {
  Breadcrumb,
  Button,
  Card,
  Form,
  FormInstance,
  Input,
  Layout,
  List,
  Popconfirm,
} from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

import { sendRequest } from '../../types';

const { Content } = Layout;

export class RoomList extends React.Component {
  override state: { rooms: RoomDTO[] } = {
    rooms: [],
  };
  private form: FormInstance;

  override async componentDidMount(): Promise<void> {
    await this.refresh();
  }

  override render() {
    return (
      <Layout hasSider>
        <Content style={{ padding: '16px' }}>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/rooms">Rooms</Link>
            </Breadcrumb.Item>
          </Breadcrumb>
          <Card
            style={{ margin: '16px 0 0 0' }}
            title="All Rooms"
            extra={
              <Popconfirm
                onConfirm={this.validate.bind(this)}
                title={
                  <Form
                    onFinish={this.validate.bind(this)}
                    layout="vertical"
                    ref={form => (this.form = form)}
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
                <Button size="small" icon={<PlusBoxMultiple />}>
                  Create new
                </Button>
              </Popconfirm>
            }
          >
            <List
              dataSource={this.sort()}
              pagination={{ pageSize: 10 }}
              renderItem={this.renderRoom.bind(this)}
            ></List>
          </Card>
        </Content>
      </Layout>
    );
  }

  private async deleteRoom(room: RoomDTO): Promise<void> {
    await sendRequest(`/room/${room._id}`, { method: 'delete' });
    await this.refresh();
  }

  private async refresh(): Promise<void> {
    const rooms = await sendRequest<RoomDTO[]>(`/room`);
    this.setState({ rooms });
  }

  private renderRoom(room: RoomDTO) {
    return (
      <List.Item key={room._id}>
        <List.Item.Meta
          title={<Link to={`/room/${room._id}`}>{room.friendlyName}</Link>}
        />
        <Popconfirm
          title={`Are you sure you want to delete ${room.friendlyName}?`}
          onConfirm={() => this.deleteRoom(room)}
        >
          <Button danger type="text">
            <CloseOutlined />
          </Button>
        </Popconfirm>
      </List.Item>
    );
  }

  private sort(): RoomDTO[] {
    return this.state.rooms.sort((a, b) =>
      a.friendlyName > b.friendlyName ? UP : DOWN,
    );
  }

  private async validate(): Promise<void> {
    try {
      const values = await this.form.validateFields();
      await sendRequest(`/room`, {
        body: JSON.stringify(values),
        method: 'post',
      });
      await this.refresh();
    } catch (error) {
      console.error(error);
    }
  }
}
