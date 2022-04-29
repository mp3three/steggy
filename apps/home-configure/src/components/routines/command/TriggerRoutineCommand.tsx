import { NodeIndexOutlined } from '@ant-design/icons';
import {
  RoutineCommandTriggerRoutineDTO,
  RoutineDTO,
} from '@steggy/controller-shared';
import { DOWN, is, UP } from '@steggy/utilities';
import { Checkbox, Divider, Empty, Space, Typography } from 'antd';
import Tree, { DataNode } from 'antd/lib/tree';
import React, { useEffect, useState } from 'react';

import { sendRequest } from '../../../types';

type tRoutineMap = Map<string, { item: DataNode; routine: RoutineDTO }>;

// eslint-disable-next-line radar/cognitive-complexity
export function TriggerRoutineCommand(props: {
  command?: RoutineCommandTriggerRoutineDTO;
  onUpdate: (command: Partial<RoutineCommandTriggerRoutineDTO>) => void;
}) {
  const [routineMap, setRoutineMap] = useState<tRoutineMap>();
  const [routines, setRoutines] = useState<RoutineDTO[]>([]);
  const [treeData, setTreeData] = useState<DataNode[]>([]);

  useEffect(() => {
    async function listRoutines(): Promise<void> {
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
      setRoutineMap(routineMap);
      setRoutines(routines);
      setTreeData(treeData);
    }
    listRoutines();
  }, []);

  function getDefaultExpandedKeys(
    routine: RoutineDTO,
    list: string[],
  ): string[] {
    if (is.empty(routine?.parent)) {
      return list;
    }
    return getDefaultExpandedKeys(
      routines.find(({ _id }) => _id === routine.parent),
      [...list, routine.parent],
    );
  }

  function sortChildren(a: DataNode, b: DataNode, routineMap: tRoutineMap) {
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

  const selected = !is.empty(props.command?.routine)
    ? [props.command?.routine]
    : [];
  return is.empty(treeData) ? (
    <Empty />
  ) : (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Tree
        treeData={[
          {
            children: treeData.sort((a, b) => sortChildren(a, b, routineMap)),
            icon: <NodeIndexOutlined />,
            key: 'root',
            selectable: false,
            title: <Typography.Text strong>Root</Typography.Text>,
          },
        ]}
        className="draggable-tree"
        onSelect={([routine]: string[]) => props.onUpdate({ routine })}
        showIcon
        blockNode
        selectedKeys={selected}
        defaultExpandedKeys={getDefaultExpandedKeys(
          routines.find(({ _id }) => _id === props.command?.routine),
          ['root'],
        )}
      />
      <Divider orientation="left">Flags</Divider>
      <Checkbox
        checked={props?.command?.ignoreEnabled}
        onChange={({ target }) =>
          props.onUpdate({ ignoreEnabled: target.checked })
        }
      >
        Bypass disabled state
      </Checkbox>
    </Space>
  );
}
