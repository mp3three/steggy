import { NodeIndexOutlined } from '@ant-design/icons';
import {
  RoutineCommandTriggerRoutineDTO,
  RoutineDTO,
} from '@steggy/controller-shared';
import { DOWN, is, UP } from '@steggy/utilities';
import { Checkbox, Divider, Empty, Space, Typography } from 'antd';
import Tree, { DataNode } from 'antd/lib/tree';
import React from 'react';

import { sendRequest } from '../../../types';

type tRoutineMap = Map<string, { item: DataNode; routine: RoutineDTO }>;
type tState = {
  routineMap: tRoutineMap;
  routines: RoutineDTO[];
  treeData: DataNode[];
};

export class TriggerRoutineCommand extends React.Component<
  {
    command?: RoutineCommandTriggerRoutineDTO;
    onUpdate: (command: Partial<RoutineCommandTriggerRoutineDTO>) => void;
  },
  tState
> {
  override state = {
    routines: [],
  } as tState;

  override async componentDidMount(): Promise<void> {
    await this.listRoutines();
  }

  override render() {
    const children = this.state.treeData ?? [];
    const selected = !is.empty(this.props.command?.routine)
      ? [this.props.command?.routine]
      : [];
    return is.empty(children) ? (
      <Empty />
    ) : (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Tree
          treeData={[
            {
              children: children.sort((a, b) =>
                this.sortChildren(a, b, this.state.routineMap),
              ),
              icon: <NodeIndexOutlined />,
              key: 'root',
              selectable: false,
              title: <Typography.Text strong>Root</Typography.Text>,
            },
          ]}
          className="draggable-tree"
          onSelect={([routine]: string[]) => this.props.onUpdate({ routine })}
          showIcon
          blockNode
          selectedKeys={selected}
          defaultExpandedKeys={this.getDefaultExpandedKeys(
            this.state.routines.find(
              ({ _id }) => _id === this.props.command?.routine,
            ),
            ['root'],
          )}
        />
        <Divider orientation="left">Flags</Divider>
        <Checkbox
          checked={this.props?.command?.ignoreEnabled}
          onChange={({ target }) =>
            this.props.onUpdate({ ignoreEnabled: target.checked })
          }
        >
          Bypass disabled state
        </Checkbox>
      </Space>
    );
  }

  private getDefaultExpandedKeys(
    routine: RoutineDTO,
    list: string[],
  ): string[] {
    if (is.empty(routine?.parent)) {
      return list;
    }
    return this.getDefaultExpandedKeys(
      this.state.routines.find(({ _id }) => _id === routine.parent),
      [...list, routine.parent],
    );
  }

  private async listRoutines(): Promise<void> {
    const routines = await sendRequest<RoutineDTO[]>({
      control: {
        select: ['friendlyName', 'parent'] as (keyof RoutineDTO)[],
        sort: ['friendlyName'],
      },
      url: `/routine`,
    });
    const routineMap: tRoutineMap = new Map();
    const treeData: DataNode[] = [];
    routines.forEach(routine =>
      routineMap.set(routine._id, {
        item: {
          children: [],
          key: routine._id,
          title: routine.friendlyName,
        },
        routine,
      }),
    );
    routineMap.forEach(({ item, routine }) => {
      if (is.empty(routine.parent)) {
        treeData.push(item);
        return;
      }
      routineMap.get(routine.parent).item.children.push(item);
    });
    this.setState({ routineMap, routines, treeData });
  }

  private sortChildren(a: DataNode, b: DataNode, routineMap: tRoutineMap) {
    const aRoutine = routineMap.get(a.key as string).routine;
    const bRoutine = routineMap.get(b.key as string).routine;
    if (!is.empty(a.children) && is.empty(b.children)) {
      return DOWN;
    }
    if (is.empty(a.children) && !is.empty(b.children)) {
      return UP;
    }
    return aRoutine.friendlyName > bRoutine.friendlyName ? UP : DOWN;
  }
}
