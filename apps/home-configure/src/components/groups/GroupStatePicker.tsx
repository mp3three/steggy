import { GroupDTO } from '@steggy/controller-shared';
import { Card } from 'antd';

export function GroupStatePicker(props: { group: GroupDTO }) {
  return <Card title={props.group.friendlyName + ' save states'}></Card>;
}
