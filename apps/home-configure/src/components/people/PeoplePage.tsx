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
import { PeopleDetail } from './PeopleDetail';

const { Content } = Layout;
type tState = {
  people: PersonDTO[];
  person: PersonDTO;
};

export class PeoplePage extends React.Component {
  override state = {
    people: [],
    person: undefined,
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
                  dataSource={this.state.people ?? []}
                  pagination={{ size: 'small' }}
                  renderItem={person => this.renderPerson(person)}
                />
              </Card>
            </Col>
            <Col span={12}>
              <PeopleDetail
                onClone={person => this.onClone(person)}
                person={this.state.person}
                onUpdate={update => this.updatePerson(update)}
              />
            </Col>
          </Row>
        </Content>
      </Layout>
    );
  }

  private onClone(person: PersonDTO) {
    this.setState({
      people: [...this.state.people, person],
      person,
    });
  }

  private async refresh(): Promise<PersonDTO[]> {
    const people = await sendRequest<PersonDTO[]>({
      control: {
        sort: ['friendlyName'],
      },
      url: `/person`,
    });
    this.setState({ people });
    return people;
  }

  private renderPerson(person: PersonDTO) {
    return (
      <List.Item key={person._id}>
        <List.Item.Meta
          title={
            <Button
              size="small"
              type={this.state?.person?._id === person._id ? 'primary' : 'text'}
              onClick={() => this.setPerson(person)}
            >
              {person.friendlyName}
            </Button>
          }
        />
      </List.Item>
    );
  }

  private async setPerson(person: PersonDTO): Promise<void> {
    this.setState({
      person: await sendRequest({
        url: `/person/${person._id}`,
      }),
    });
  }

  private updatePerson(person: PersonDTO): void {
    if (!person) {
      this.setState({
        people: this.state.people.filter(
          ({ _id }) => _id !== this.state.person._id,
        ),
        person: undefined,
      });
      return;
    }
    const list = this.state.people;
    const index = list.findIndex(({ _id }) => _id === person._id);
    if (index === NOT_FOUND) {
      this.setState({
        people: [...list, person],
        person,
      });
      return;
    }
    this.setState({
      people: list.map(item => (person._id === item._id ? person : item)),
      person,
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
      const people = await this.refresh();
      this.setState({
        people: people.find(({ _id }) => _id === created._id),
      });
    } catch (error) {
      console.error(error);
    }
  }
}
