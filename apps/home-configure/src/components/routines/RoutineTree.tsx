import { RoutineDTO } from '@steggy/controller-shared';
import { DOWN, is, UP } from '@steggy/utilities';
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  Popconfirm,
  Tree,
  Typography,
} from 'antd';
import { DataNode, EventDataNode } from 'antd/lib/tree';
import type { NodeDragEventParams } from 'rc-tree/lib/contextTypes';
import { Key } from 'rc-tree/lib/interface';
import { useEffect, useState } from 'react';

import { FD_ICONS, sendRequest } from '../../types';

type tRoutineMap = Map<string, { item: DataNode; routine: RoutineDTO }>;

type DropOptions = NodeDragEventParams<HTMLDivElement> & {
  dragNode: EventDataNode;
  dragNodesKeys: Key[];
  dropPosition: number;
  dropToGap: boolean;
};

// eslint-disable-next-line radar/cognitive-complexity
export function RoutineTree(props: {
  enabled: string[];
  onSelect: (routine: RoutineDTO) => void;
  onUpdate: () => void;
  routine: RoutineDTO;
  routines: RoutineDTO[];
}) {
  const [routineMap, setRoutineMap] = useState<tRoutineMap>(new Map());
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [friendlyName, setFriendlyName] = useState('');

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.routines]);

  function onSelect(selected: string[]): void {
    const [item] = selected;
    if (!item) {
      return;
    }
    props.onSelect(routineMap.get(item).routine);
  }

  function refresh(): void {
    const { routines, enabled } = props;
    const routineMap = new Map<
      string,
      { item: DataNode; routine: RoutineDTO }
    >();
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
    routineMap.forEach(({ item, routine }) => {
      const isEnabled = enabled.includes(routine._id);
      item.children = item.children.sort((a, b) =>
        sortChildren(a, b, routineMap),
      );
      if (
        !is.empty(item.children) &&
        is.empty(routine.activate) &&
        is.empty(routine.command)
      ) {
        // Routines used for grouping only get fancy
        item.title = (
          <Typography.Text
            strong
            italic
            type={isEnabled ? 'success' : 'danger'}
          >
            {routine.friendlyName}
          </Typography.Text>
        );
        return;
      }
      if (
        is.empty(item.children) ||
        !is.empty(routine.command) ||
        !is.empty(routine.activate)
      ) {
        // If the server will attempt to mount + reject, warn
        item.title =
          is.empty(routine.command) || is.empty(routine.activate) ? (
            <Typography.Text
              strong
              italic
              type={isEnabled ? 'warning' : 'danger'}
            >
              {routine.friendlyName}
            </Typography.Text>
          ) : (
            <Typography.Text
              strong
              italic
              type={isEnabled ? 'success' : 'danger'}
            >
              {routine.friendlyName}
            </Typography.Text>
          );
      }
    });
    setRoutineMap(routineMap);
    setTreeData(treeData);
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

  async function validate(): Promise<void> {
    try {
      const routine = await sendRequest<RoutineDTO>({
        body: { friendlyName },
        method: 'post',
        url: `/routine`,
      });
      props.onUpdate();
      props.onSelect(routine);
      setFriendlyName('');
    } catch (error) {
      console.error(error);
    }
  }

  async function onDrop(info: DropOptions): Promise<void> {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const parent = info.dropToGap ? '' : dropKey;

    await sendRequest({
      body: { parent } as Partial<RoutineDTO>,
      method: 'put',
      url: `/routine/${dragKey}`,
    });
    props.onUpdate();
  }

  return (
    <Card
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
            type={!is.empty(treeData) ? 'text' : 'primary'}
            icon={FD_ICONS.get('plus_box')}
          >
            Create new
          </Button>
        </Popconfirm>
      }
    >
      {is.empty(treeData) ? (
        <Empty />
      ) : (
        <Tree
          treeData={treeData.sort((a, b) => sortChildren(a, b, routineMap))}
          className="draggable-tree"
          draggable
          showIcon
          selectedKeys={[props.routine?._id]}
          onDrop={options => onDrop(options)}
          onSelect={(keys: string[]) => onSelect(keys)}
          blockNode
        />
      )}
    </Card>
  );
}
