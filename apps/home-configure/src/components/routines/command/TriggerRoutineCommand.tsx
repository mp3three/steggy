import {
  RoutineCommandTriggerRoutineDTO,
  RoutineDTO,
} from '@steggy/controller-shared';
import { DOWN, is, UP } from '@steggy/utilities';
import { Checkbox, Divider, Empty, Radio, Space, Tooltip } from 'antd';
import Tree, { DataNode } from 'antd/lib/tree';
import { useEffect, useState } from 'react';

import { sendRequest } from '../../../types';

type tRoutineMap = Map<string, { item: DataNode; routine: RoutineDTO }>;

// eslint-disable-next-line radar/cognitive-complexity
export function TriggerRoutineCommand(props: {
  command?: RoutineCommandTriggerRoutineDTO;
  onUpdate: (command: Partial<RoutineCommandTriggerRoutineDTO>) => void;
  routine: RoutineDTO;
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
    list: string[] = [],
  ): string[] {
    if (is.empty(routine?.parent)) {
      return list;
    }
    return getDefaultExpandedKeys(
      routines.find(({ _id }) => _id === routine.parent),
      [...list, routine.parent],
    );
  }

  function onUpdate(routine: string) {
    props.onUpdate({ routine });
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
      <Radio.Group
        buttonStyle="solid"
        value={!!props?.command?.runChildren}
        onChange={({ target }) => props.onUpdate({ runChildren: target.value })}
      >
        <Radio.Button value={true}>Run child routines</Radio.Button>
        <Radio.Button value={false}>Run specific routine</Radio.Button>
      </Radio.Group>
      {props.command?.runChildren ? undefined : (
        <>
          <Divider />
          <Tree
            disabled={props.command?.runChildren}
            treeData={treeData.sort((a, b) => sortChildren(a, b, routineMap))}
            className="draggable-tree"
            onSelect={([routine]: string[]) => onUpdate(routine)}
            showIcon
            blockNode
            selectedKeys={selected}
            defaultExpandedKeys={getDefaultExpandedKeys(
              routines.find(({ _id }) => _id === props.command?.routine),
            )}
          />
        </>
      )}
      <Divider orientation="left">Flags</Divider>
      <Tooltip title="Ignore the disabled + repeat activation states to forcibly run the routine.">
        <Checkbox
          checked={props?.command?.force}
          onChange={({ target }) => props.onUpdate({ force: target.checked })}
        >
          Force activation
        </Checkbox>
      </Tooltip>
    </Space>
  );
}
