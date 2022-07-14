import { GenericImport, RoutineDTO } from '@steggy/controller-shared';
import { DOWN, is, UP } from '@steggy/utilities';
import {
  Card,
  Descriptions,
  Empty,
  notification,
  Popover,
  Tooltip,
  Tree,
  Typography,
} from 'antd';
import { DataNode, EventDataNode } from 'antd/lib/tree';
import type { NodeDragEventParams } from 'rc-tree/lib/contextTypes';
import { Key } from 'rc-tree/lib/interface';
import { useEffect, useState } from 'react';

import { FD_ICONS, sendRequest } from '../../types';
import { ImportCreate } from '../misc';

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
  const [pureFolders, setPureFolders] = useState<number>(0);
  const [conditionalFolders, setConditionalFolders] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

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

  routineMap.forEach(({ routine, item }) => {
    item.title = (
      <Tooltip title={routine.description}>{getTitle(item, routine)}</Tooltip>
    );
  });

  function getTitle(item: DataNode, routine: RoutineDTO) {
    const isEnabled = props.enabled.includes(routine._id);
    if (
      !is.empty(item.children) &&
      is.empty(routine.activate) &&
      is.empty(routine.command)
    ) {
      // Routines used for grouping only get fancy
      return (
        <Tooltip title={routine.description}>
          {FD_ICONS.get(
            expandedKeys.includes(routine._id) ? 'folder_open' : 'folder',
          )}
          <Typography.Text
            strong
            italic
            type={isEnabled ? 'success' : 'danger'}
          >
            {` ${routine.friendlyName}`}
          </Typography.Text>
        </Tooltip>
      );
    }
    if (
      is.empty(item.children) ||
      !is.empty(routine.command) ||
      !is.empty(routine.activate)
    ) {
      // If the server will attempt to mount + reject, warn
      return (
        <Tooltip title={routine.description}>
          {is.empty(routine.command) || is.empty(routine.activate) ? (
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
          )}
        </Tooltip>
      );
    }
    return <Tooltip title={'Hello world'}>{item.title}</Tooltip>;
  }

  function refresh(): void {
    const { routines } = props;
    const routineMap = new Map<
      string,
      { item: DataNode; routine: RoutineDTO }
    >();
    const treeData: DataNode[] = [];
    let pureFolder = 0;
    const conditionalFolder: string[] = [];
    routines.forEach(routine => {
      routine.enable ??= {};
      routine.enable.type ??= 'enable';
      const isFolder =
        is.empty(routine.activate) &&
        is.empty(routine.command) &&
        routines.some(({ parent }) => parent === routine._id);
      if (isFolder) {
        if (['enable', 'disable'].includes(routine.enable.type)) {
          pureFolder++;
        } else {
          conditionalFolder.push(routine._id);
        }
      }
      routineMap.set(routine._id, {
        item: {
          children: [],
          key: routine._id,
          title: routine.friendlyName,
        },
        routine,
      });
    });
    setPureFolders(pureFolder);
    setConditionalFolders(conditionalFolder);
    routineMap.forEach(({ item, routine }) => {
      if (is.empty(routine.parent)) {
        treeData.push(item);
        return;
      }
      routineMap.get(routine.parent).item.children.push(item);
    });
    routineMap.forEach(({ item }) => {
      item.children = item.children.sort((a, b) =>
        sortChildren(a, b, routineMap),
      );
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

  async function create(friendlyName: string): Promise<void> {
    try {
      const routine = await sendRequest<RoutineDTO>({
        body: { friendlyName },
        method: 'post',
        url: `/routine`,
      });
      props.onUpdate();
      props.onSelect(routine);
    } catch (error) {
      console.error(error);
    }
  }

  async function createImport(body: GenericImport): Promise<void> {
    try {
      const routine = await sendRequest<RoutineDTO>({
        body,
        method: 'post',
        url: `/routine/import`,
      });
      if (!routine) {
        notification.error({
          message: `Invalid import text`,
        });
        return;
      }
      props.onUpdate();
      props.onSelect(routine);
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
      title={
        <>
          <Typography.Text type="secondary">
            ({props.routines?.length ?? 0})
          </Typography.Text>
          <Popover
            content={
              <Descriptions bordered>
                <Descriptions.Item span={3} label="Enabled">
                  {props.enabled.length ?? 0}
                </Descriptions.Item>
                <Descriptions.Item span={3} label="Pure folders">
                  {pureFolders}
                </Descriptions.Item>
                <Descriptions.Item span={2} label="Conditional folders">
                  {conditionalFolders.length}
                </Descriptions.Item>
                <Descriptions.Item span={1} label="Enabled">
                  {
                    conditionalFolders.filter(i => props.enabled.includes(i))
                      .length
                  }
                </Descriptions.Item>
              </Descriptions>
            }
          >
            <Typography.Text strong> Routines</Typography.Text>
          </Popover>
        </>
      }
      extra={
        <ImportCreate
          primary={is.empty(treeData)}
          type="routine"
          onCreate={async body => {
            if (is.empty(body.import)) {
              await create(body.friendlyName);
              return;
            }
            await createImport(body);
          }}
        />
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
          onExpand={keys => setExpandedKeys(keys as string[])}
          expandedKeys={expandedKeys}
          selectedKeys={[props.routine?._id]}
          onDrop={options => onDrop(options)}
          onSelect={(keys: string[]) => onSelect(keys)}
          blockNode
        />
      )}
    </Card>
  );
}
