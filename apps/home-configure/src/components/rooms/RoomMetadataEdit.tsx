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
} from 'antd';
import moment from 'moment';
import React from 'react';

type tState = {
  // name: string;
};

export class RoomMetadataEdit extends React.Component<
  {
    metadata: RoomMetadataDTO;
    onComplete: () => void;
    onUpdate: (metadata: Partial<RoomMetadataDTO>) => void;
    room: RoomDTO;
  },
  tState
> {
  override state = {} as tState;

  override render() {
    return (
      <Drawer
        visible={!is.undefined(this.props.metadata)}
        title="Edit Metadata"
        onClose={() => this.props.onComplete()}
      >
        {is.undefined(this.props.metadata) ? undefined : (
          <Space direction="vertical">
            <Form.Item label="Property name">
              <Input
                defaultValue={this.props.metadata.name}
                onBlur={({ target }) =>
                  this.props.onUpdate({ name: target.value })
                }
              />
            </Form.Item>
            <Form.Item label="Property type">
              <Select
                value={this.props.metadata.type}
                onChange={type => this.props.onUpdate({ type })}
              >
                <Select.Option value="string">string</Select.Option>
                <Select.Option value="enum">enum</Select.Option>
                <Select.Option value="boolean">boolean</Select.Option>
                <Select.Option value="number">number</Select.Option>
                <Select.Option value="date">date</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Current value">{this.renderValue()}</Form.Item>
            {this.props.metadata.type !== 'enum' ? undefined : (
              <>
                <Divider orientation="left">Enum options (1 per line)</Divider>
                <Input.TextArea
                  defaultValue={(this.props.metadata.options ?? []).join(`\n`)}
                  onBlur={({ target }) =>
                    this.props.onUpdate({
                      options: target.value
                        .trim()
                        .split(`\n`)
                        .map(i => i.trim()),
                    })
                  }
                />
              </>
            )}
          </Space>
        )}
      </Drawer>
    );
  }

  private renderValue() {
    const { type, value, options } = this.props.metadata;
    if (type === 'boolean') {
      return (
        <Checkbox
          checked={Boolean(value)}
          onChange={({ target }) =>
            this.props.onUpdate({ value: target.checked })
          }
        />
      );
    }
    if (type === 'number') {
      return (
        <Input
          type="number"
          defaultValue={Number(value)}
          onBlur={({ target }) => this.props.onUpdate({ value: target.value })}
        />
      );
    }
    if (type === 'enum') {
      return (
        <Select
          value={value}
          onChange={value => this.props.onUpdate({ value })}
        >
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
          onChange={value =>
            this.props.onUpdate({ value: value.toISOString() })
          }
          value={moment(
            is.date(value) || is.string(value) ? value : new Date(),
          )}
        />
      );
    }
    return (
      <Input
        defaultValue={String(value)}
        onBlur={({ target }) => this.props.onUpdate({ value: target.value })}
      />
    );
  }
}
