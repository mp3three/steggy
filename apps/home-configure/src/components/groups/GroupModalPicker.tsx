import { CloseOutlined, FileAddOutlined } from '@ant-design/icons';
import { GroupDTO } from '@steggy/controller-shared';
import {
  DOWN,
  INCREMENT,
  INVERT_VALUE,
  is,
  START,
  UP,
} from '@steggy/utilities';
import {
  Button,
  Divider,
  Empty,
  Input,
  List,
  Modal,
  Space,
  Spin,
  Typography,
} from 'antd';
import fuzzy from 'fuzzysort';
import parse from 'html-react-parser';
import { useState } from 'react';

import { FD_ICONS, sendRequest } from '../../types';

const TEMP_TEMPLATE_SIZE = 3;

type tIdList = (GroupDTO & { highlighted?: string })[];

function highlight(result) {
  const open = '{'.repeat(TEMP_TEMPLATE_SIZE);
  const close = '}'.repeat(TEMP_TEMPLATE_SIZE);
  let highlighted = '';
  let matchesIndex = 0;
  let opened = false;
  const { target, indexes } = result;
  for (let i = START; i < target.length; i++) {
    const char = target[i];
    if (indexes[matchesIndex] === i) {
      matchesIndex++;
      if (!opened) {
        opened = true;
        highlighted += open;
      }
      if (matchesIndex === indexes.length) {
        highlighted += char + close + target.slice(i + INCREMENT);
        break;
      }
      highlighted += char;
      continue;
    }
    if (opened) {
      opened = false;
      highlighted += close;
    }
    highlighted += char;
  }
  return highlighted.replace(
    new RegExp(`${open}(.*?)${close}`, 'g'),
    i =>
      `<span style="color:#F66">${i.slice(
        TEMP_TEMPLATE_SIZE,
        TEMP_TEMPLATE_SIZE * INVERT_VALUE,
      )}</span>`,
  );
}

// eslint-disable-next-line radar/cognitive-complexity
export function GroupModalPicker(props: {
  exclude?: string[];
  onAdd: (selected: string[]) => void;
}) {
  const [available, setAvailable] = useState<tIdList>([]);
  const [modalVisible, setModalVisible] = useState<boolean>();
  const [searchText, setSearchText] = useState<string>();
  const [selected, setSelected] = useState<tIdList>();

  function fuzzySort(available: tIdList): tIdList {
    if (is.empty(searchText)) {
      return available;
    }
    const fuzzyResult = fuzzy.go(searchText, available, {
      key: 'friendlyName',
    });
    const highlighted = fuzzyResult.map(result => {
      const { target } = result;
      const item = available.find(option => {
        return is.string(option) ? option === target : option._id === target;
      });
      return {
        ...item,
        highlighted: highlight(result),
      };
    });
    return highlighted;
  }

  function getList() {
    const exclude = props.exclude ?? [];
    const filtered = available.filter(
      item =>
        !exclude.includes(item._id) && selected.every(i => item._id !== i._id),
    );
    if (is.empty(searchText)) {
      return filtered.sort((a, b) =>
        a.friendlyName > b.friendlyName ? UP : DOWN,
      );
    }
    return fuzzySort(available);
  }

  function hide(e?: Event): void {
    if (!is.undefined(e)) {
      e.stopPropagation();
    }
    setModalVisible(false);
  }

  function onComplete(): void {
    props.onAdd(selected.map(({ _id }) => _id));
    setSelected([]);
    setModalVisible(false);
  }

  function removeItem(entity_id: string): void {
    setSelected(selected.filter(i => i._id !== entity_id));
  }

  async function show(e?: Event): Promise<void> {
    if (!is.undefined(e)) {
      e.stopPropagation();
    }
    setAvailable(undefined);
    setModalVisible(true);
    setSearchText('');
    setSelected([]);
    setAvailable(await sendRequest<GroupDTO[]>({ url: `/group` }));
  }

  return (
    <>
      <Button
        onClick={() => show()}
        size="small"
        icon={FD_ICONS.get('plus_box')}
      >
        Add groups
      </Button>
      <Modal
        title="Group List Builder"
        visible={modalVisible}
        onOk={() => onComplete()}
        onCancel={() => hide()}
      >
        {!available ? (
          <Spin tip="Loading" />
        ) : (
          <>
            <Input
              placeholder="Filter List"
              onChange={({ target }) => setSearchText(target.value)}
              value={searchText}
              suffix={
                <Button
                  onClick={() => setSearchText('')}
                  type="text"
                  size="small"
                >
                  <CloseOutlined />
                </Button>
              }
            />
            <List
              rowKey="_id"
              dataSource={getList()}
              pagination={{ size: 'small' }}
              renderItem={item => (
                <List.Item>
                  <Space>
                    <Button
                      type="primary"
                      shape="round"
                      size="small"
                      onClick={() => setSelected([...selected, item])}
                      icon={<FileAddOutlined />}
                    />
                    <Typography.Text>
                      {!is.empty(item.highlighted)
                        ? parse(item.highlighted)
                        : item.friendlyName}
                    </Typography.Text>
                  </Space>
                </List.Item>
              )}
            />
            <Divider />
            {is.empty(selected) ? (
              <Empty description="Nothing added yet" />
            ) : (
              <List
                rowKey="_id"
                dataSource={selected}
                pagination={{ size: 'small' }}
                renderItem={item => (
                  <List.Item>
                    <Space>
                      <Button
                        danger
                        shape="round"
                        type="text"
                        size="small"
                        onClick={() => removeItem(item._id)}
                        icon={<CloseOutlined />}
                      />
                      <Typography.Text>
                        {!is.empty(item.highlighted)
                          ? parse(item.highlighted)
                          : item.friendlyName}
                      </Typography.Text>
                    </Space>
                  </List.Item>
                )}
              />
            )}
          </>
        )}
      </Modal>
    </>
  );
}
