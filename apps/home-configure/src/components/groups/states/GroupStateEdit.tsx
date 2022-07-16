/* eslint-disable radar/no-duplicate-string */
import {
  GeneralSaveStateDTO,
  GroupDTO,
  GroupSaveStateDTO,
  PersonDTO,
  RoomDTO,
} from '@steggy/controller-shared';
import {
  ColorModes,
  FanAttributesDTO,
  LightAttributesDTO,
  LockAttributesDTO,
} from '@steggy/home-assistant-shared';
import { is, START } from '@steggy/utilities';
import {
  Button,
  Descriptions,
  Divider,
  Drawer,
  Form,
  notification,
  Select,
  Skeleton,
  Space,
  Tabs,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';

import { sendRequest } from '../../../types';
import {
  FanEntityCard,
  LightEntityCard,
  LockEntityCard,
  SwitchEntityCard,
} from '../../entities';
import { ItemPin } from '../../misc';

const DEFAULT_VALUE = 'none';

// eslint-disable-next-line radar/cognitive-complexity
export function GroupStateEdit(props: {
  group?: GroupDTO;
  onBaseLoad?: (base: string, state: string) => void;
  onUpdate?: (group: GroupDTO) => void;
  state: GroupSaveStateDTO | string;
}) {
  const [dirty, setDirty] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [friendlyName, setFriendlyName] = useState('');
  const [state, setState] = useState<GroupSaveStateDTO>(
    {} as GroupSaveStateDTO,
  );
  const [group, setGroup] = useState<GroupDTO>();
  const [groups, setGroups] = useState<GroupDTO[]>([]);
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [people, setPeople] = useState<PersonDTO[]>([]);
  const [referenceStates, setReferenceStates] = useState<
    Record<string, string>
  >({});
  const cards: (
    | LightEntityCard
    | SwitchEntityCard
    | LockEntityCard
    | FanEntityCard
  )[] = [];

  const entities = group?.entities ?? [];

  async function loadEntities() {
    const groups = await sendRequest<GroupDTO[]>({
      control: {
        filters: new Set([
          {
            field: 'save_states.id',
            value: props.state,
          },
        ]),
      },
      url: `/group`,
    });
    if (is.empty(groups)) {
      notification.error({
        duration: 15,
        message: (
          <Typography>
            {'Unable to load information for group state: '}
            <Typography.Text code>{props.state as string}</Typography.Text>
          </Typography>
        ),
      });
      return;
    }
    const group = groups[START];
    const state = group.save_states.find(({ id }) => id === props.state);
    if (props.onBaseLoad) {
      props.onBaseLoad(group._id, props.state as string);
    }
    if (is.undefined(state)) {
      return;
    }
    setState(state);
    setFriendlyName(state.friendlyName);
    setGroup(group);
  }

  useEffect(() => {
    state.states ??= [];
    if (!drawer) {
      setReferenceStates({});
      return;
    }

    setReferenceStates(
      Object.fromEntries(
        state.states
          .filter(({ type }) => ['group', 'room', 'person'].includes(type))
          .map(i => [i.ref, i.state]),
      ),
    );
  }, [state, drawer]);

  useEffect(() => {
    if (is.undefined(props.group)) {
      return;
    }
    setGroup(props.group);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.group]);

  useEffect(() => {
    const references = group?.references ?? [];
    async function fetchGroups() {
      const groups = references.filter(({ type }) => type === 'group');
      if (is.empty(groups)) {
        setGroups([]);
        return;
      }
      setGroups(
        await sendRequest({
          control: {
            filters: new Set([
              {
                field: '_id',
                operation: 'in',
                value: groups.map(({ target }) => target),
              },
            ]),
            select: [
              'friendlyName',
              'save_states.id',
              'save_states.friendlyName',
            ],
          },
          url: `/group`,
        }),
      );
    }

    async function fetchRooms() {
      const rooms = references.filter(({ type }) => type === 'room');
      if (is.empty(rooms)) {
        setRooms([]);
        return;
      }
      setRooms(
        await sendRequest({
          control: {
            filters: new Set([
              {
                field: '_id',
                operation: 'in',
                value: rooms.map(({ target }) => target),
              },
            ]),
            select: [
              'friendlyName',
              'save_states.id',
              'save_states.friendlyName',
            ],
          },
          url: `/room`,
        }),
      );
    }

    async function fetchPeople() {
      const people = references.filter(({ type }) => type === 'person');
      if (is.empty(people)) {
        setPeople([]);
        return;
      }
      setPeople(
        await sendRequest({
          control: {
            filters: new Set([
              {
                field: '_id',
                operation: 'in',
                value: people.map(({ target }) => target),
              },
            ]),
            select: [
              'friendlyName',
              'save_states.id',
              'save_states.friendlyName',
            ],
          },
          url: `/person`,
        }),
      );
    }

    fetchPeople();
    fetchGroups();
    fetchRooms();
  }, [group?.references]);

  useEffect(() => {
    if (is.string(props.state)) {
      loadEntities();
      return;
    }
    setState(props.state);
    setFriendlyName(props.state?.friendlyName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.state]);

  function referenceEdit() {
    return [...groups, ...rooms, ...people].map(item => (
      <Form.Item key={item._id} label={item.friendlyName}>
        <Select
          value={referenceStates[item._id] ?? DEFAULT_VALUE}
          onChange={value =>
            setReferenceStates({
              ...referenceStates,
              [item._id]: value,
            })
          }
        >
          <Select.Option value={DEFAULT_VALUE}>
            <Typography.Text type="secondary">No Change</Typography.Text>
          </Select.Option>
          {item.save_states.map((state: GroupSaveStateDTO) => (
            <Select.Option key={state.id} value={state.id}>
              {state.friendlyName}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    ));
  }

  function bulkEdit() {
    switch (group?.type) {
      case 'light':
        return (
          <LightEntityCard
            title="Bulk change"
            onUpdate={(state, type) => onStateChange(state, type)}
          />
        );
      case 'switch':
        return (
          <SwitchEntityCard
            title="Bulk change"
            onUpdate={state => onStateChange(state)}
          />
        );
      case 'fan':
        return (
          <FanEntityCard
            title="Bulk change"
            onUpdate={state => onStateChange(state)}
          />
        );
      case 'lock':
        return (
          <LockEntityCard
            title="Bulk change"
            onUpdate={state => onStateChange(state)}
          />
        );
      case 'room':
      case 'person':
      case 'group':
        return referenceEdit();
    }
    return <Skeleton />;
  }

  function updateFriendlyName(name: string) {
    setFriendlyName(name);
  }

  function entityRender(entity: string) {
    const item = state?.states?.find(({ ref }) => ref === entity) || {
      extra: {},
      ref: entity,
      state: undefined,
    };
    switch (group?.type) {
      case 'light':
        return (
          <LightEntityCard
            ref={i => cards.push(i)}
            key={entity}
            state={item}
            onUpdate={() => setDirty(true)}
          />
        );
      case 'switch':
        return (
          <SwitchEntityCard
            ref={i => cards.push(i)}
            key={entity}
            state={item}
            onUpdate={() => setDirty(true)}
          />
        );
      case 'fan':
        return (
          <FanEntityCard
            ref={i => cards.push(i)}
            key={entity}
            state={item}
            onUpdate={() => setDirty(true)}
          />
        );
      case 'lock':
        return (
          <LockEntityCard
            ref={i => cards.push(i)}
            key={entity}
            state={item}
            onUpdate={() => setDirty(true)}
          />
        );
    }
    return <Skeleton key={entity} />;
  }

  function onClose(warn: boolean): void {
    if (dirty && warn) {
      notification.warn({
        description: `Changes to ${state?.friendlyName} were not saved`,
        message: 'Unsaved changes',
      });
    }
    setDrawer(false);
  }

  function onFanChange(state: GeneralSaveStateDTO<FanAttributesDTO>): void {
    cards.forEach(card =>
      (card as FanEntityCard)?.setState({
        percentage: state?.extra.percentage,
      }),
    );
  }

  function onLightStateChange(
    state: GeneralSaveStateDTO<LightAttributesDTO>,
    type: string,
  ): void {
    setDirty(dirty);
    const set: LightAttributesDTO & { state?: string } = {};
    switch (type) {
      case 'state':
        set.state = state?.state;
        if (state?.extra.color_mode === 'color_temp') {
          set.color_mode = 'color_temp' as ColorModes;
        } else {
          set.rgb_color = state?.extra.rgb_color;
          set.color_mode = 'hs' as ColorModes;
        }
        break;
      case 'brightness':
        set.brightness = state?.extra.brightness;
        break;
      case 'color':
        set.state = 'on';
        set.rgb_color = state?.extra.rgb_color;
        set.color_mode = 'hs' as ColorModes;
        break;
    }
    console.log(set);
    cards.forEach(i =>
      (i as LightEntityCard)?.setState(set as GeneralSaveStateDTO),
    );
  }

  function onLockChange(state: GeneralSaveStateDTO<LockAttributesDTO>): void {
    cards.forEach(card => {
      (card as LockEntityCard)?.setState({
        state: state?.state,
      });
    });
  }

  async function onSave(): Promise<void> {
    const id = state?.id;
    const refTypes = new Map();
    groups.forEach(({ _id }) => refTypes.set(_id, 'group'));
    rooms.forEach(({ _id }) => refTypes.set(_id, 'room'));
    people.forEach(({ _id }) => refTypes.set(_id, 'person'));
    const states = [
      ...cards.filter(i => !!i).map(i => i.getSaveState()),
      ...Object.entries(referenceStates)
        .filter(([, value]) => value !== DEFAULT_VALUE)
        .map(
          ([ref, state]) =>
            ({ ref, state, type: refTypes.get(ref) } as GeneralSaveStateDTO),
        ),
    ];
    const item = await sendRequest<GroupDTO>({
      body: { friendlyName, id, states } as GroupSaveStateDTO,
      method: 'put',
      url: `/group/${group?._id}/state/${id}`,
    });
    setDirty(false);
    setDrawer(false);
    if (props.onUpdate) {
      props.onUpdate(item);
    }
  }

  function onStateChange(state: GeneralSaveStateDTO, type?: string): void {
    setDirty(true);
    switch (group?.type) {
      case 'light':
        onLightStateChange(state, type);
        return;
      case 'switch':
        onSwitchStateChanged(state);
        return;
      case 'fan':
        onFanChange(state);
        return;
      case 'lock':
        onLockChange(state);
        return;
    }
  }

  function onSwitchStateChanged(state: GeneralSaveStateDTO): void {
    cards.forEach(i =>
      (i as SwitchEntityCard)?.setState({
        state: state?.state,
      }),
    );
  }

  return group ? (
    <>
      <Drawer
        title={
          <Typography.Text
            editable={{
              onChange: friendlyName => updateFriendlyName(friendlyName),
            }}
          >
            {friendlyName}
          </Typography.Text>
        }
        size="large"
        visible={drawer}
        onClose={() => onClose(true)}
        extra={
          <Space>
            <ItemPin type="group_state" target={state?.id} />
            <Button type="primary" onClick={() => onSave()}>
              Save
            </Button>
            <Button onClick={() => onClose(false)}>Cancel</Button>
          </Space>
        }
      >
        <Tabs>
          <Tabs.TabPane tab="State" key="state">
            <Space direction="vertical" style={{ width: '100%' }}>
              {bulkEdit()}
              {!is.empty(entities) ? (
                <>
                  <Divider orientation="left">
                    <Typography.Text strong>Edit State</Typography.Text>
                  </Divider>
                  <Space wrap>
                    {entities.map(entity => entityRender(entity))}
                  </Space>
                </>
              ) : undefined}
            </Space>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Extra Information" key="info">
            <Descriptions bordered>
              <Descriptions.Item span={2} label="Group Name">
                {group?.friendlyName}
              </Descriptions.Item>
              <Descriptions.Item span={1} label="Group ID">
                <Typography.Text code>{group?._id}</Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item span={3} label="State ID">
                <Typography.Text code>{state?.id}</Typography.Text>
              </Descriptions.Item>
            </Descriptions>
          </Tabs.TabPane>
        </Tabs>
      </Drawer>
      <Button
        size="small"
        type={drawer ? 'primary' : 'text'}
        onClick={() => setDrawer(true)}
      >
        {state?.friendlyName}
      </Button>
    </>
  ) : (
    <Skeleton.Button active />
  );
}
