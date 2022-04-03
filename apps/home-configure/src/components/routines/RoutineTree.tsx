import PlusBoxMultiple from '@2fd/ant-design-icons/lib/PlusBoxMultiple';
import { NodeIndexOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { RoutineDTO } from '@automagical/controller-shared';
import { DOWN, is, UP } from '@automagical/utilities';
import {
  Button,
  Card,
  Empty,
  Form,
  FormInstance,
  Input,
  Popconfirm,
  Tree,
  Typography,
} from 'antd';
import { DataNode, EventDataNode } from 'antd/lib/tree';
import type { NodeDragEventParams } from 'rc-tree/lib/contextTypes';
import { Key } from 'rc-tree/lib/interface';
import React from 'react';

import { sendRequest } from '../../types';

type tRoutineMap = Map<string, { item: DataNode; routine: RoutineDTO }>;
type tState = {
  name: string;
  routineMap: tRoutineMap;
  treeData: DataNode[];
};

type DropOptions = NodeDragEventParams<HTMLDivElement> & {
  dragNode: EventDataNode;
  dragNodesKeys: Key[];
  dropPosition: number;
  dropToGap: boolean;
};

export class RoutineTree extends React.Component<
  {
    enabled: string[];
    onSelect: (routine: RoutineDTO) => void;
    onUpdate: () => void;
    routine: RoutineDTO;
    routines: RoutineDTO[];
  },
  tState
> {
  override state = {} as tState;
  private form: FormInstance;

  override componentDidMount(): void {
    if (is.empty(this.state.treeData)) {
      this.refresh();
    }
  }

  override componentDidUpdate(
    previousProperties: Readonly<{ routines: RoutineDTO[] }>,
  ): void {
    const { routines } = this.props;
    if (previousProperties.routines === routines) {
      return;
    }
    this.refresh();
  }

  override render() {
    const children = this.state.treeData ?? [];
    return (
      <Card
        title="Routine List"
        extra={
          <Popconfirm
            icon={<QuestionCircleOutlined style={{ visibility: 'hidden' }} />}
            onConfirm={this.validate.bind(this)}
            title={
              <Form
                onFinish={this.validate.bind(this)}
                ref={form => (this.form = form)}
              >
                <Form.Item
                  label="Friendly Name"
                  name="friendlyName"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Form>
            }
          >
            <Button size="small" icon={<PlusBoxMultiple />}>
              Create new
            </Button>
          </Popconfirm>
        }
      >
        {is.empty(children) ? (
          <Empty />
        ) : (
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
            draggable
            showIcon
            selectedKeys={[this.props.routine?._id]}
            onDrop={this.onDrop.bind(this)}
            onSelect={this.onSelect.bind(this)}
            blockNode
            defaultExpandedKeys={['root']}
          />
        )}
      </Card>
    );
  }

  private async onDrop(info: DropOptions): Promise<void> {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const parent = dropKey === 'root' ? '' : dropKey;
    await sendRequest({
      body: { parent } as Partial<RoutineDTO>,
      method: 'put',
      url: `/routine/${dragKey}`,
    });
    this.props.onUpdate();
  }

  private onSelect(selected: string[]): void {
    const [item] = selected;
    if (!item) {
      return;
    }
    this.props.onSelect(this.state.routineMap.get(item).routine);
  }

  private refresh(): void {
    const { routines, enabled } = this.props;
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
        this.sortChildren(a, b, routineMap),
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
      if (is.empty(item.children)) {
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
    this.setState({ routineMap, treeData });
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

  private async validate(): Promise<void> {
    try {
      const values = await this.form.validateFields();
      const routine = await sendRequest<RoutineDTO>({
        body: values,
        method: 'post',
        url: `/routine`,
      });
      this.form.resetFields();
      this.props.onUpdate();
      this.props.onSelect(routine);
    } catch (error) {
      console.error(error);
    }
  }
}
