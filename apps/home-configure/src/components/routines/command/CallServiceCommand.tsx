import { CallServiceCommandDTO } from '@steggy/controller-shared';
import {
  HassStateDTO,
  ServiceListField,
  ServiceListFieldDescription,
  ServiceListItemDTO,
} from '@steggy/home-assistant-shared';
import { DOWN, is, TitleCase, UP } from '@steggy/utilities';
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
  const allServices = availableServices.filter(
    i =>
      // direct match of domain
      i.domain === domain(props.command?.entity_id) ||
      // something more integration specific
      // has a selector for a domain
      Object.values(i?.services ?? {}).some(i =>
        Object.values(i?.fields ?? {}).some(
          // There can be a `domain` selector also, but I'm not sure where to get that info from right now
          i => i.selector?.entity?.domain === domain(props.command?.entity_id),
        ),
      ),
  );
  let service: ServiceListField;
  if (!is.empty(allServices)) {
    allServices.forEach(i => {
      if (i.services[props.command?.service]) {
        service = i.services[props.command?.service];
      }
    });
  }
  if (props.command) {
    props.command.attributes ??= {};
    props.command.set_attributes ??= [];
  }
  const updateAttribute = (value, fieldName: string) =>
    props.onUpdate({
      attributes: {
        ...props.command?.attributes,
        [fieldName]: value,
      },
    });
  type tCommandList = [{ domain: string; service: string }, ServiceListField];
  const commands: tCommandList[] = [];
  allServices.forEach(i => {
    Object.entries(i.services).forEach(([name, service]) => {
      commands.push([
        { domain: i.domain, service: name },
        service,
      ] as tCommandList);
    });
  });

  function sendUpdate(update: string) {
    const [domain, service] = update.split('.');
    props.onUpdate({ attributes: {}, domain, service, set_attributes: [] });
  }

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
      {!commands ? undefined : (
        <Form.Item label="Service">
          <Select
            value={
              is.empty(props.command?.service)
                ? ''
                : [props.command.domain, props.command.service].join(`.`)
            }
            onChange={service => sendUpdate(service)}
          >
            {commands
              .sort(([aDomain, a], [bDomain, b]) =>
                aDomain.domain > bDomain.domain ||
                (a.name || aDomain.service) > (b.name || bDomain.service)
                  ? UP
                  : DOWN,
              )
              .map(([{ domain, service }, serviceItem]) => (
                <Select.Option
                  key={[domain, service].join('.')}
                  value={[domain, service].join('.')}
                >
                  {serviceItem.name || service}
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
          ([fieldName, field]: [string, ServiceListFieldDescription]) =>
            !is.undefined(field.selector.entity) ? undefined : (
              <Form.Item
                labelCol={{ span: 8 }}
                label={
                  <Popover
                    title={
                      <Typography.Title level={5}>
                        {field.name}
                      </Typography.Title>
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
                              require another attribute ALSO be set (ex: min
                              temp + max temp, instead of just one of them), or
                              some other extra logic. This is the most I know
                              about it right now.
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
                    {field.name || TitleCase(fieldName)}
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
                              set_attributes:
                                props.command?.set_attributes.filter(
                                  i => i !== fieldName,
                                ),
                            })
                      }
                      checked={props.command?.set_attributes?.includes(
                        fieldName,
                      )}
                    />
                  </Tooltip>

                  {/* BOOLEAN */}
                  {field.selector.boolean === null ? (
                    <Checkbox
                      checked={
                        props.command?.attributes[fieldName].value as boolean
                      }
                      onChange={({ target }) =>
                        updateAttribute(target.checked, fieldName)
                      }
                    />
                  ) : undefined}
                  {/* ENTITY */}
                  {field.selector.entity ? (
                    <FuzzySelect
                      onChange={value => updateAttribute(value, fieldName)}
                      value={
                        props.command?.attributes[fieldName].value as string
                      }
                      style={{ minWidth: '250px' }}
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
                      defaultValue={Number(
                        props.command?.attributes[fieldName],
                      )}
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
                      defaultValue={
                        props.command?.attributes[fieldName].value as string
                      }
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
                      value={
                        props.command?.attributes[fieldName].value as string
                      }
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
                  {!is.undefined(field.selector.text) ? (
                    <Input
                      defaultValue={
                        props.command?.attributes[fieldName].value as string
                      }
                      onBlur={({ target }) =>
                        updateAttribute(target.checked, fieldName)
                      }
                    />
                  ) : undefined}
                  {/* TIME */}
                  {!is.undefined(field.selector.time) ? (
                    <Input
                      defaultValue={
                        props.command?.attributes[fieldName].value as string
                      }
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
