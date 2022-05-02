import { GroupSaveStateDTO } from '@steggy/controller-shared';
import { LightAttributesDTO } from '@steggy/home-assistant-shared';
import { TitleCase } from '@steggy/utilities';
import { Table, Typography } from 'antd';

export function LightGroupDescription(props: { state: GroupSaveStateDTO }) {
  return (
    <Table dataSource={props.state.states} pagination={{ size: 'small' }}>
      <Table.Column title="Entity" key="ref" dataIndex="ref" />
      <Table.Column title="State" key="state" dataIndex="state" />
      <Table.Column
        title="Attributes"
        key="extra"
        dataIndex="extra"
        render={(value: LightAttributesDTO) =>
          Object.keys(value).map(key => (
            <Typography.Paragraph key={key}>
              {TitleCase(key)}: {value[key]}
            </Typography.Paragraph>
          ))
        }
      />
    </Table>
  );
}
