import { CallServiceCommandDTO } from '@steggy/controller-shared';
import {
  HassStateDTO,
  ServiceListFieldDescription,
  ServiceListItemDTO,
} from '@steggy/home-assistant-shared';
import { DOWN, is, UP } from '@steggy/utilities';
import {
  Checkbox,
  Divider,
  Empty,
  Form,
  Input,
  InputNumber,
  Popover,
  Select,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';

import { domain, sendRequest } from '../../../types';
import { FuzzySelect } from '../../misc';

// eslint-disable-next-line radar/cognitive-complexity
export function CallServiceCommand(props: {
  command?: CallServiceCommandDTO;
  onUpdate: (command: Partial<CallServiceCommandDTO>) => void;
}) {
  const [availableServices, setAvailableServices] = useState<
    ServiceListItemDTO[]
  >([]);
  const [entities, setEntities] = useState<string[]>([]);
  const [entity, setEntity] = useState<HassStateDTO>();

  useEffect(() => {
    async function services(): Promise<void> {
      const targets = await sendRequest<ServiceListItemDTO[]>({
        url: `/debug/home-assistant/services`,
      });
      setAvailableServices(targets);
    }
    async function entities(): Promise<void> {
      const targets = await sendRequest<string[]>({
        url: `/entity/list`,
      });
      setEntities(targets);
    }
    services();
    entities();
  }, []);
  useEffect(() => {
    async function refresh(): Promise<void> {
      setEntity(
        await sendRequest({
          url: `/entity/id/${props.command.entity_id}`,
        }),
      );
    }
    if (is.empty(props.command?.entity_id)) {
      setEntity(undefined);
      return;
    }
    refresh();
  }, [props.command?.entity_id]);
  const serviceList = availableServices.find(
    i => i.domain === domain(props.command?.entity_id),
  );
  const service = serviceList
    ? serviceList?.services[props.command.service]
    : undefined;
  if (props.command) {
    props.command.attributes ??= {};
    props.command.set_attributes ??= [];
  }
  const updateAttribute = (value, fieldName: string) =>
    props.onUpdate({
      attributes: {
        ...props.command.attributes,
        [fieldName]: value,
      },
    });

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Form.Item label="Entity ID">
        <FuzzySelect
          onChange={entity_id =>
            props.onUpdate({ attributes: {}, entity_id, set_attributes: [] })
          }
          value={props.command?.entity_id}
          data={entities.map(id => ({ text: id, value: id }))}
        />
      </Form.Item>
      {!serviceList ? undefined : (
        <Form.Item label="Service">
          <Select
            value={props.command.service}
            onChange={service =>
              props.onUpdate({ attributes: {}, service, set_attributes: [] })
            }
          >
            {Object.keys(serviceList?.services)
              .sort((a, b) => (a > b ? UP : DOWN))
              .map(service => (
                <Select.Option key={service} value={service}>
                  {serviceList?.services[service].name}
                </Select.Option>
              ))}
          </Select>
          {!service ? undefined : (
            <Typography.Text type="secondary">
              {service.description}
            </Typography.Text>
          )}
        </Form.Item>
      )}
      {!service ? undefined : is.empty(Object.entries(service.fields ?? {})) ? (
        <Empty description="No options to set" />
      ) : (
        // *
        // * FIELDS
        // *
        Object.entries(service.fields).map(
          ([fieldName, field]: [string, ServiceListFieldDescription]) => (
            <Form.Item
              labelCol={{ span: 8 }}
              label={
                <Popover
                  title={
                    <Typography.Title level={5}>{field.name}</Typography.Title>
                  }
                  content={
                    <>
                      {field.description}
                      {is.undefined(service.example) ? undefined : (
                        <>
                          <Divider />
                          <Typography.Text code>
                            {JSON.stringify(service.example)}
                          </Typography.Text>
                        </>
                      )}
                      {field.advanced ? (
                        <>
                          <Divider />
                          <Typography.Text type="secondary">
                            Dev note: Property flagged as "advanced". It may
                            require another attribute ALSO be set (ex: min temp
                            + max temp, instead of just one of them), or some
                            other extra logic. This is the most I know about it
                            right now.
                          </Typography.Text>
                        </>
                      ) : undefined}
                    </>
                  }
                >
                  {field.advanced ? (
                    <Typography.Text style={{ color: 'blue' }}>
                      {'* '}
                    </Typography.Text>
                  ) : undefined}
                  {field.name}
                </Popover>
              }
            >
              <Space style={{ width: '100%' }}>
                <Tooltip title="Set value">
                  <Checkbox
                    onChange={({ target }) =>
                      target.checked
                        ? props.onUpdate({
                            set_attributes: [
                              ...props.command.set_attributes,
                              fieldName,
                            ],
                          })
                        : props.onUpdate({
                            set_attributes: props.command.set_attributes.filter(
                              i => i !== fieldName,
                            ),
                          })
                    }
                    checked={props.command.set_attributes?.includes(fieldName)}
                  />
                </Tooltip>

                {/* BOOLEAN */}
                {field.selector.boolean === null ? (
                  <Checkbox
                    checked={props.command.attributes[fieldName] as boolean}
                    onChange={({ target }) =>
                      updateAttribute(target.checked, fieldName)
                    }
                  />
                ) : undefined}
                {/* ENTITY */}
                {field.selector.entity ? (
                  <FuzzySelect
                    onChange={value => updateAttribute(value, fieldName)}
                    value={props.command.attributes[fieldName] as string}
                    data={entities
                      .filter(id =>
                        is.empty(field.selector.entity.domain)
                          ? true
                          : domain(id) === field.selector.entity.domain,
                      )
                      .map(id => ({ text: id, value: id }))}
                  />
                ) : undefined}
                {/* NUMBER */}
                {field.selector.number ? (
                  <InputNumber
                    max={field.selector.number.max}
                    min={field.selector.number.min}
                    step={field.selector.number.step}
                    defaultValue={Number(props.command.attributes[fieldName])}
                    onBlur={({ target }) =>
                      updateAttribute(Number(target.value), fieldName)
                    }
                    placeholder={
                      entity
                        ? String(entity?.attributes[fieldName] ?? '')
                        : undefined
                    }
                    addonAfter={field.selector.number.unit_of_measurement}
                  />
                ) : undefined}
                {/* OBJECT */}
                {field.selector.object ? (
                  <Input
                    onBlur={value => updateAttribute(value, fieldName)}
                    defaultValue={props.command.attributes[fieldName] as string}
                    placeholder={
                      (service.example as string) ?? 'Enter value as json'
                    }
                  />
                ) : undefined}
                {/* SELECT */}
                {field.selector.select ? (
                  <Select
                    style={{ minWidth: '150px' }}
                    onChange={value => updateAttribute(value, fieldName)}
                    value={props.command.attributes[fieldName] as string}
                  >
                    {field.selector.select.options.map(
                      (option: string | Record<'label' | 'value', string>) =>
                        is.string(option) ? (
                          <Select.Option key={option} value={option}>
                            {option}
                          </Select.Option>
                        ) : (
                          <Select.Option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </Select.Option>
                        ),
                    )}
                  </Select>
                ) : undefined}
                {/* TEXT */}
                {field.selector.text ? (
                  <Input
                    defaultValue={props.command.attributes[fieldName] as string}
                    onBlur={({ target }) =>
                      updateAttribute(target.checked, fieldName)
                    }
                  />
                ) : undefined}
              </Space>
            </Form.Item>
          ),
        )
      )}
    </Space>
  );
}
