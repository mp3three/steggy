import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import {
  ROUTINE_ACTIVATE_TYPES,
  RoutineActivateDTO,
  RoutineDTO,
} from '@steggy/controller-shared';
import { ARRAY_OFFSET, TitleCase } from '@steggy/utilities';
import { Button, Card, List, Popconfirm } from 'antd';
import React from 'react';

import { sendRequest } from '../../../types';
import { RoutineActivateDrawer } from '../RoutineActivateDrawer';
import { ActivateAdd } from './ActivateAdd';

type tState = {
  activate?: RoutineActivateDTO;
};

export class ActivateList extends React.Component<
  {
    onUpdate: (routine: RoutineDTO) => void;
    routine: RoutineDTO;
  },
  tState
> {
  override state = {} as tState;

  override render() {
    return (
      <>
        <Card
          type="inner"
          extra={
            <ActivateAdd
              routine={this.props.routine}
              onCreate={routine => this.onAdd(routine)}
            />
          }
        >
          <List
            dataSource={this.props.routine.activate}
            renderItem={item => (
              <List.Item
                key={item.id}
                onClick={() => this.setState({ activate: item })}
              >
                <List.Item.Meta
                  title={
                    <Button
                      size="small"
                      onClick={() => this.setState({ activate: item })}
                      type="text"
                    >
                      {item.friendlyName}
                    </Button>
                  }
                  description={TitleCase(
                    item.type === 'kunami' ? 'sequence' : item.type,
                  )}
                />
                <Popconfirm
                  icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                  title={`Are you sure you want to delete ${item.friendlyName}?`}
                  onConfirm={e => {
                    this.deleteActivate(item);
                    e?.stopPropagation();
                  }}
                >
                  <Button danger type="text" onClick={e => e.stopPropagation()}>
                    <CloseOutlined />
                  </Button>
                </Popconfirm>
              </List.Item>
            )}
          />
        </Card>
        <RoutineActivateDrawer
          routine={this.props.routine}
          onUpdate={activate => this.updateActivate(activate)}
          onComplete={() => this.setState({ activate: undefined })}
          activate={this.state.activate}
        />
      </>
    );
  }

  private async deleteActivate(item: RoutineActivateDTO): Promise<void> {
    const routine = await sendRequest<RoutineDTO>({
      method: 'delete',
      url: `/routine/${this.props.routine._id}/activate/${item.id}`,
    });
    this.props.onUpdate(routine);
  }

  private onAdd(routine: RoutineDTO): void {
    const activate = routine.activate[routine.activate.length - ARRAY_OFFSET];
    this.setState({ activate });
    this.props.onUpdate(routine);
  }

  private async updateActivate(
    body: Partial<ROUTINE_ACTIVATE_TYPES>,
  ): Promise<void> {
    const routine = await sendRequest<RoutineDTO>({
      body,
      method: 'put',
      url: `/routine/${this.props.routine._id}/activate/${this.state.activate.id}`,
    });
    body = routine.activate.find(({ id }) => id === this.state.activate.id);
    this.setState({ activate: body as RoutineActivateDTO });
    this.props.onUpdate(routine);
  }
}
