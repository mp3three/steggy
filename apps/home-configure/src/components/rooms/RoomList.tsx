import PlusBoxMultiple from '@2fd/ant-design-icons/lib/PlusBoxMultiple';
import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { RoomDTO } from '@automagical/controller-shared';
import { NOT_FOUND } from '@automagical/utilities';
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
import React from 'react';

import { sendRequest } from '../../types';
import { RoomListDetail } from './RoomListDetail';

const { Content } = Layout;

export class RoomList extends React.Component {
  override state: { room: RoomDTO; rooms: RoomDTO[] } = {
    room: undefined,
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
          <Row gutter={8}>
            <Col span={12}>
              <Card
                title="All Rooms"
                extra={
                  <Popconfirm
                    icon={
                      <QuestionCircleOutlined
                        style={{ visibility: 'hidden' }}
                      />
                    }
                    onConfirm={this.validate.bind(this)}
                    title={
                      <Form
                        onFinish={this.validate.bind(this)}
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
                  dataSource={this.state.rooms}
                  pagination={{ size: 'small' }}
                  renderItem={this.renderRoom.bind(this)}
                />
              </Card>
            </Col>
            <Col span={12}>
              <RoomListDetail
                room={this.state.room}
                onUpdate={update => this.updateRoom(update)}
              />
            </Col>
          </Row>
        </Content>
      </Layout>
    );
  }

  private async deleteRoom(room: RoomDTO): Promise<void> {
    await sendRequest({
      method: 'delete',
      url: `/room/${room._id}`,
    });
    await this.refresh();
  }

  private async refresh(): Promise<void> {
    const rooms = await sendRequest<RoomDTO[]>({
      control: {
        sort: ['friendlyName'],
      },
      url: `/room`,
    });
    this.setState({ rooms });
  }

  private renderRoom(room: RoomDTO) {
    return (
      <List.Item key={room._id}>
        <List.Item.Meta
          title={
            <Button
              type={this.state?.room?._id === room._id ? 'primary' : 'text'}
              onClick={() => this.setState({ room })}
            >
              {room.friendlyName}
            </Button>
          }
        />
        <Popconfirm
          icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
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

  private updateRoom(room: RoomDTO): void {
    const list = this.state.rooms;
    const index = list.findIndex(({ _id }) => _id === room._id);
    if (index === NOT_FOUND) {
      this.setState({
        room,
        rooms: [...list, room],
      });
      return;
    }
    this.setState({
      room,
      rooms: list.map(item => (room._id === item._id ? room : item)),
    });
  }

  private async validate(): Promise<void> {
    try {
      const values = await this.form.validateFields();
      await sendRequest({
        body: values,
        method: 'post',
        url: `/room`,
      });
      this.form.resetFields();
      await this.refresh();
    } catch (error) {
      console.error(error);
    }
  }
}
