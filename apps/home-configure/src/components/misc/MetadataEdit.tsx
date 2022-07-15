import { RoomDTO, RoomMetadataDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import {
  Checkbox,
  DatePicker,
  Divider,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Typography,
} from 'antd';
import moment from 'moment';

import { ItemPin } from './ItemPin';

const DESCRIPTION_PLACEHOLDER = property =>
  `Note to self: why does ${property} exist?`;

// eslint-disable-next-line radar/cognitive-complexity
export function MetadataEdit(props: {
  metadata: RoomMetadataDTO;
  onComplete?: () => void;
  onUpdate?: (metadata: Partial<RoomMetadataDTO>) => void;
  room: RoomDTO;
  type: 'room' | 'person';
}) {
  function onComplete() {
    if (props.onComplete) {
      props.onComplete();
    }
  }

  function onUpdate(metadata: Partial<RoomMetadataDTO>) {
    if (props.onUpdate) {
      props.onUpdate(metadata);
    }
  }

  function renderValue() {
    const { type, value, options, id } = props.metadata;
    if (type === 'boolean') {
      return (
        <Checkbox
          checked={Boolean(value)}
          onChange={({ target }) => onUpdate({ value: target.checked })}
        />
      );
    }
    if (type === 'number') {
      return (
        <Input
          type="number"
          key={id}
          defaultValue={Number(value)}
          onBlur={({ target }) => onUpdate({ value: target.value })}
        />
      );
    }
    if (type === 'enum') {
      return (
        <Select value={value} onChange={value => onUpdate({ value })}>
          {(options ?? []).map(item => (
            <Select.Option value={item} key={item}>
              {item}
            </Select.Option>
          ))}
        </Select>
      );
    }
    if (type === 'date') {
      return (
        <DatePicker
          showTime
          onChange={value => onUpdate({ value: value.toISOString() })}
          value={moment(
            is.date(value) || is.string(value) ? value : new Date(),
          )}
        />
      );
    }
    return (
      <Input
        key={id}
        defaultValue={String(value)}
        onBlur={({ target }) => props.onUpdate({ value: target.value })}
      />
    );
  }

  return (
    <Drawer
      size="large"
      visible={!is.undefined(props.metadata)}
      title={<Typography.Text strong>Edit Metadata</Typography.Text>}
      extra={
        <ItemPin target={props.metadata?.id} type={`${props.type}_metadata`} />
      }
      onClose={() => onComplete()}
    >
      {is.undefined(props.metadata) ? undefined : (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item label="Property name">
            <Input
              key={props.metadata.id}
              defaultValue={props.metadata.name}
              onBlur={({ target }) => onUpdate({ name: target.value })}
            />
          </Form.Item>
          <Form.Item label="Property type">
            <Select
              value={props.metadata.type}
              onChange={type => onUpdate({ type })}
            >
              <Select.Option value="string">string</Select.Option>
              <Select.Option value="enum">enum</Select.Option>
              <Select.Option value="boolean">boolean</Select.Option>
              <Select.Option value="number">number</Select.Option>
              <Select.Option value="date">date</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Current value">{renderValue()}</Form.Item>
          {props.metadata.type !== 'enum' ? undefined : (
            <>
              <Divider orientation="left">Enum options (1 per line)</Divider>
              <Input.TextArea
                key={props.metadata.id}
                defaultValue={(props.metadata.options ?? []).join(`\n`)}
                style={{ minHeight: '150px' }}
                onBlur={({ target }) =>
                  onUpdate({
                    options: target.value
                      .trim()
                      .split(`\n`)
                      .map(i => i.trim()),
                  })
                }
              />
            </>
          )}
          <Divider orientation="left">Description</Divider>
          <Form.Item>
            <Input.TextArea
              style={{ minHeight: '150px' }}
              key={props.metadata.id}
              defaultValue={props.metadata.description}
              onBlur={({ target }) => onUpdate({ description: target.value })}
              placeholder={DESCRIPTION_PLACEHOLDER(
                props.metadata.name || 'this property',
              )}
            />
          </Form.Item>
        </Space>
      )}
    </Drawer>
  );
}
