import { QuestionCircleOutlined } from '@ant-design/icons';
import type { PersonDTO } from '@steggy/controller-shared';
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
import React from 'react';

import { FD_ICONS, sendRequest } from '../../types';

const { Content } = Layout;
type tState = { room: PersonDTO; rooms: PersonDTO[] };

export class PeoplePage extends React.Component {
  override state = {
    room: undefined,
    rooms: [],
  } as tState;
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
                extra={
                  <Popconfirm
                    icon={
                      <QuestionCircleOutlined
                        style={{ visibility: 'hidden' }}
                      />
                    }
                    onConfirm={() => this.validate()}
                    title={
                      <Form
                        onFinish={() => this.validate()}
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
                    <Button size="small" icon={FD_ICONS.get('plus_box')}>
                      Create new
                    </Button>
                  </Popconfirm>
                }
              >
                <List
                  dataSource={this.state.rooms ?? []}
                  pagination={{ size: 'small' }}
                  renderItem={room => this.renderRoom(room)}
                />
              </Card>
            </Col>
            <Col span={12}>
              {/* <RoomListDetail
                onClone={room => this.onClone(room)}
                room={this.state.room}
                onUpdate={update => this.updateRoom(update)}
              /> */}
            </Col>
          </Row>
        </Content>
      </Layout>
    );
  }

  private onClone(room: PersonDTO) {
    this.setState({
      room,
      rooms: [...this.state.rooms, room],
    });
  }

  private async refresh(): Promise<PersonDTO[]> {
    const rooms = await sendRequest<PersonDTO[]>({
      control: {
        sort: ['friendlyName'],
      },
      url: `/person`,
    });
    this.setState({ rooms });
    return rooms;
  }

  private renderRoom(room: PersonDTO) {
    return (
      <List.Item key={room._id}>
        <List.Item.Meta
          title={
            <Button
              size="small"
              type={this.state?.room?._id === room._id ? 'primary' : 'text'}
              onClick={() => this.setRoom(room)}
            >
              {room.friendlyName}
            </Button>
          }
        />
      </List.Item>
    );
  }

  private async setRoom(room: PersonDTO): Promise<void> {
    this.setState({
      room: await sendRequest({
        url: `/person/${room._id}`,
      }),
    });
  }

  private updateRoom(room: PersonDTO): void {
    if (!room) {
      this.setState({
        room: undefined,
        rooms: this.state.rooms.filter(
          ({ _id }) => _id !== this.state.room._id,
        ),
      });
      return;
    }
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
      const created = await sendRequest<PersonDTO>({
        body: values,
        method: 'post',
        url: `/person`,
      });
      this.form.resetFields();
      const rooms = await this.refresh();
      this.setState({
        room: rooms.find(({ _id }) => _id === created._id),
      });
    } catch (error) {
      console.error(error);
    }
  }
}
