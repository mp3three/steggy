import { PersonDTO, RoomMetadataDTO } from '@steggy/controller-shared';
import { is, START } from '@steggy/utilities';
import {
  Avatar,
  Button,
  Checkbox,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Empty,
  Input,
  Layout,
  List,
  Popover,
  Row,
  Select,
  Skeleton,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import moment from 'moment';

import { CurrentUserContext, sendRequest } from '../../types';
import { PersonInspectButton } from '../people';

export function Header() {
  let updatePerson: (person: PersonDTO) => void;
  let personId: string;
  async function updateValue(metadata: RoomMetadataDTO, value: unknown) {
    const person = await sendRequest<PersonDTO>({
      body: { value },
      method: 'put',
      url: `/person/${personId}/metadata/${metadata.id}`,
    });
    updatePerson(person);
  }

  async function activateState(id: string) {
    await sendRequest({
      method: 'post',
      url: `/person/${personId}/state/${id}`,
    });
  }

  function renderInput(metadata: RoomMetadataDTO) {
    if (metadata.type === 'boolean') {
      return (
        <Checkbox
          checked={!!metadata.value}
          onChange={({ target }) => updateValue(metadata, target.checked)}
        />
      );
    }
    if (metadata.type === 'date') {
      return (
        <DatePicker
          allowClear={false}
          value={moment(metadata.value as string)}
          onChange={value => {
            if (!value) {
              return;
            }
            updateValue(metadata, value.toDate().toISOString());
          }}
        />
      );
    }
    if (metadata.type === 'enum') {
      return (
        <Select
          value={metadata.value}
          style={{ minWidth: '150px' }}
          onChange={value => updateValue(metadata, value)}
        >
          {metadata.options.map(i => (
            <Select.Option key={i} value={i}>
              {i}
            </Select.Option>
          ))}
        </Select>
      );
    }
    if (metadata.type === 'number') {
      return (
        <Input
          type="number"
          defaultValue={Number(metadata.value ?? 0)}
          onBlur={({ target }) => updateValue(metadata, target.value)}
        />
      );
    }
    if (metadata.type === 'string') {
      return (
        <Input
          defaultValue={metadata.value as string}
          onBlur={({ target }) => updateValue(metadata, target.value)}
        />
      );
    }
    return <Skeleton />;
  }

  function renderItem(metadata: RoomMetadataDTO) {
    return (
      <Descriptions.Item
        span={3}
        label={<Tooltip title={metadata.description}>{metadata.name}</Tooltip>}
      >
        {renderInput(metadata)}
      </Descriptions.Item>
    );
  }

  return (
    <Layout.Header>
      <CurrentUserContext.Consumer>
        {({ person, update }) => {
          personId = person?._id;
          updatePerson = update;
          return (
            <Row>
              <Col span={20}>
                <Typography.Title level={2} style={{ padding: '8px' }}>
                  Automation Controller
                </Typography.Title>
              </Col>
              <Col span={4}>
                {!person ? (
                  <Typography.Text code>None Selected</Typography.Text>
                ) : (
                  <>
                    <Popover
                      content={
                        <Space direction="vertical">
                          <Typography.Title level={5}>
                            Manage Metadata
                          </Typography.Title>
                          {is.empty(person.metadata) ? (
                            <Empty description="No metadata attached to person" />
                          ) : (
                            <Descriptions bordered>
                              {person.metadata.map(metadata =>
                                renderItem(metadata),
                              )}
                            </Descriptions>
                          )}
                          <Divider />
                          <Typography.Title level={5}>
                            Activate States
                          </Typography.Title>
                          <List>
                            {person.save_states.map(state => (
                              <List.Item key={state.id}>
                                <Button
                                  size="small"
                                  type="primary"
                                  onClick={() => activateState(state.id)}
                                >
                                  {state.friendlyName}
                                </Button>
                              </List.Item>
                            ))}
                          </List>
                        </Space>
                      }
                    >
                      <Avatar style={{ marginRight: '8px' }}>
                        {(person?.friendlyName ?? '?').charAt(START)}
                      </Avatar>
                    </Popover>
                    <PersonInspectButton
                      person={person}
                      onUpdate={update => updatePerson(update)}
                    />
                  </>
                )}
              </Col>
            </Row>
          );
        }}
      </CurrentUserContext.Consumer>
    </Layout.Header>
  );
}
