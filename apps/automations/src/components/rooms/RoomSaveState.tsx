import PlusBoxMultiple from '@2fd/ant-design-icons/lib/PlusBoxMultiple';
import { RoomDTO } from '@text-based/controller-shared';
import { Button, Card, Form, FormInstance, Popconfirm } from 'antd';
import React from 'react';

export class RoomSaveStates extends React.Component<{
  room: RoomDTO;
  roomUpdated: (room: RoomDTO) => void;
}> {
  override state = { modalVisible: false };
  private form: FormInstance;

  override render() {
    return (
      <Card
        title="Room save states"
        extra={
          <Popconfirm title={<Form></Form>}>
            <Button size="small" icon={<PlusBoxMultiple />}>
              Create new
            </Button>
          </Popconfirm>
        }
      >
        SAVE STATES
      </Card>
    );
  }

  private async validate(): Promise<void> {
    // try {
    //   const values = await this.form.validateFields();
    //   values.type = this.props.type;
    //   await sendRequest(`/group`, {
    //     body: JSON.stringify(values),
    //     method: 'post',
    //   });
    //   this.props.groupsUpdated();
    // } catch (error) {
    //   console.error(error);
    // }
  }
}
