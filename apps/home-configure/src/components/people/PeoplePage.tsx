import { QuestionCircleOutlined } from '@ant-design/icons';
import type { PersonDTO } from '@steggy/controller-shared';
import { is, NOT_FOUND } from '@steggy/utilities';
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
import { PeopleDetail } from './PeopleDetail';

const { Content } = Layout;

export function PeoplePage() {
  const [people, setPeople] = useState<PersonDTO[]>([]);
  const [person, setPerson] = useState<PersonDTO>();
  let form: FormInstance;

  useEffect(() => {
    refresh();
  }, []);

  function onClone(person: PersonDTO) {
    setPeople([...people, person]);
    setPerson(person);
  }

  async function refresh(): Promise<PersonDTO[]> {
    const people = await sendRequest<PersonDTO[]>({
      control: { sort: ['friendlyName'] },
      url: `/person`,
    });
    setPeople(people);
    return people;
  }

  function renderPerson(item: PersonDTO) {
    return (
      <List.Item key={item._id}>
        <List.Item.Meta
          title={
            <Button
              size="small"
              type={person?._id === item._id ? 'primary' : 'text'}
              onClick={() => loadPerson(item)}
            >
              {item.friendlyName}
            </Button>
          }
        />
      </List.Item>
    );
  }

  async function loadPerson(person: PersonDTO): Promise<void> {
    setPerson(
      await sendRequest({
        url: `/person/${person._id}`,
      }),
    );
  }

  function updatePerson(item: PersonDTO): void {
    if (!item) {
      setPeople(people.filter(({ _id }) => _id !== person._id));
      setPerson(undefined);
      return;
    }
    setPerson(item);
    const index = people.findIndex(({ _id }) => _id === item._id);
    if (index === NOT_FOUND) {
      setPeople([...people, item]);
      return;
    }
    setPeople(people.map(item => (person._id === item._id ? person : item)));
  }

  async function validate(): Promise<void> {
    try {
      const values = await form.validateFields();
      const created = await sendRequest<PersonDTO>({
        body: values,
        method: 'post',
        url: `/person`,
      });
      form.resetFields();
      const people = await refresh();
      setPerson(people.find(({ _id }) => _id === created._id));
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
                    <Form onFinish={() => validate()} ref={ref => (form = ref)}>
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
                  <Button
                    size="small"
                    type={is.empty(people) ? 'primary' : 'text'}
                    icon={FD_ICONS.get('plus_box')}
                  >
                    Create new
                  </Button>
                </Popconfirm>
              }
            >
              <List
                dataSource={people}
                pagination={{ size: 'small' }}
                renderItem={person => renderPerson(person)}
              />
            </Card>
          </Col>
          <Col span={12}>
            <PeopleDetail
              onClone={person => onClone(person)}
              person={person}
              onUpdate={update => updatePerson(update)}
            />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
