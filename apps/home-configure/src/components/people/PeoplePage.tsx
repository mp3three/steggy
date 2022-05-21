import type { PersonDTO } from '@steggy/controller-shared';
import { DOWN, is, NOT_FOUND, UP } from '@steggy/utilities';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Layout,
  List,
  notification,
  Popconfirm,
  Row,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';

import { FD_ICONS, sendRequest } from '../../types';
import { PeopleDetail } from './PeopleDetail';

const { Content } = Layout;

// eslint-disable-next-line radar/cognitive-complexity
export function PeoplePage() {
  const [people, setPeople] = useState<PersonDTO[]>([]);
  const [person, setPerson] = useState<PersonDTO>();
  const [friendlyName, setFriendlyName] = useState('');

  useEffect(() => {
    refresh();
  }, []);

  function onClone(person: PersonDTO) {
    setPeople(
      [...people, person].sort((a, b) =>
        a.friendlyName > b.friendlyName ? UP : DOWN,
      ),
    );
    setPerson(person);
  }

  async function refresh(): Promise<PersonDTO[]> {
    const people = await sendRequest<PersonDTO[]>({
      control: {
        select: ['friendlyName'],
        sort: ['friendlyName'],
      },
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
      setPeople(
        [...people, item].sort((a, b) =>
          a.friendlyName > b.friendlyName ? UP : DOWN,
        ),
      );
      return;
    }
    setPeople(people.map(item => (person._id === item._id ? person : item)));
  }

  async function validate(): Promise<void> {
    try {
      if (is.empty(friendlyName)) {
        notification.error({
          message: `Friendly name is required`,
        });
        return;
      }
      const created = await sendRequest<PersonDTO>({
        body: { friendlyName },
        method: 'post',
        url: `/person`,
      });
      const people = await refresh();
      setPerson(people.find(({ _id }) => _id === created._id));
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
              title={
                <>
                  <Typography.Text type="secondary">
                    ({people.length})
                  </Typography.Text>
                  <Typography.Text strong> People</Typography.Text>
                </>
              }
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
