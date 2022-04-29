import { RoutineCommandGroupActionDTO } from '@steggy/controller-shared';
import { Form, Radio, Slider } from 'antd';
import React from 'react';

type tCommand = Omit<
  RoutineCommandGroupActionDTO<{ brightness: number }>,
  'group'
>;

export function LightGroupAction(props: {
  command: tCommand;
  onUpdate: (
    command: Partial<RoutineCommandGroupActionDTO<{ brightness: number }>>,
  ) => void;
}) {
  // function getValue(): tCommand {
  //   return {
  //     command: props.command.command,
  //     extra: {
  //       brightness: props.command.extra.brightness,
  //     },
  //   };
  // }

  return (
    <>
      <Form.Item label="Direction">
        <Radio.Group
          buttonStyle="solid"
          value={props.command.command}
          onChange={({ target }) =>
            props.onUpdate({
              command: target.value as string,
            })
          }
        >
          <Radio.Button value="dimUp">Up</Radio.Button>
          <Radio.Button value="dimDown">Down</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="Amount">
        <Slider
          min={1}
          max={255}
          value={props.command?.extra?.brightness}
          onChange={brightness => props.onUpdate({ extra: { brightness } })}
          marks={{
            1: 'min',
            128: '1/2',
            170: '2/3',
            192: '3/4',
            255: 'max',
            64: '1/4',
            85: '1/3',
          }}
        />
      </Form.Item>
    </>
  );
}
