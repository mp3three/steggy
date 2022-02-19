import {
  GroupDTO,
  RoutineCommandGroupActionDTO,
} from '@automagical/controller-shared';
import { is, TitleCase } from '@automagical/utilities';
import { Empty, Form, Select, Space } from 'antd';
import React from 'react';

import { sendRequest } from '../../../types';
import { LightGroupAction } from '../../groups';

type tState = {
  command: string;
  extra: Record<string, unknown>;
  group: GroupDTO;
  groups: GroupDTO[];
};

export class GroupActionCommand extends React.Component<
  { command?: RoutineCommandGroupActionDTO },
  tState
> {
  override state = {
    groups: [],
  } as tState;

  private picker: LightGroupAction;
  override async componentDidMount(): Promise<void> {
    await this.listGroups();
  }

  public getValue(): RoutineCommandGroupActionDTO {
    return {
      // 🤷
      ...(this.picker?.getValue() ?? { command: 'turnOff' }),
      group: this.state.group._id,
    };
  }

  public load(command: RoutineCommandGroupActionDTO): void {
    console.log(command);
    this.setState({
      command: command?.command,
      extra: command?.extra,
      group: this.state.groups.find(({ _id }) => _id === command?.group),
    });
  }

  override render() {
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Form.Item>
          <Select
            value={this.state.group?._id}
            onChange={this.groupChange.bind(this)}
            showSearch
            style={{ width: '100%' }}
          >
            {this.state.groups.map(group => (
              <Select.Option key={group._id} value={group._id}>
                {group.friendlyName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        {this.renderPicker()}
      </Space>
    );
  }

  private groupChange(group: string): void {
    this.setState({
      group: this.state.groups.find(({ _id }) => _id === group),
    });
  }

  private async listGroups(): Promise<void> {
    const groups = await sendRequest<GroupDTO[]>(
      `/group?select=friendlyName,type&type=light&sort=friendlyName`,
    );
    this.setState({ groups });
    this.load(this.props.command);
  }

  private renderPicker() {
    const { group, command, extra } = this.state;
    if (!is.object(group)) {
      return <Empty description="Select group" />;
    }
    if (group.type === 'light') {
      return (
        <LightGroupAction
          ref={pick => (this.picker = pick)}
          command={{
            command,
            extra: extra as { brightness: number },
          }}
        />
      );
    }
    return (
      <Empty
        description={`${TitleCase(
          group.type,
        )} group does not have special actions`}
      />
    );
  }
}
