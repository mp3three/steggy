import { RoutineDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Divider, Select } from 'antd';
import { sendRequest } from 'apps/home-configure/src/types';
import { useEffect, useState } from 'react';

export function RoutineTags(props: {
  onUpdate: (routine: Partial<RoutineDTO>) => void;
  routine: RoutineDTO;
}) {
  const [allTags, setAllTags] = useState<string[]>([]);
  const tags = props.routine?.tags ?? [];

  useEffect(() => {
    async function refresh() {
      const response = await sendRequest<{ tags: string[] }>({
        url: `/debug/routine-tags`,
      });
      setAllTags(response.tags);
    }
    refresh();
  }, [props.routine._id]);

  return (
    <>
      <Divider orientation="left">Tags</Divider>
      <Select
        mode="tags"
        style={{ width: '100%' }}
        placeholder="Tags Mode"
        value={[...tags]}
        onChange={value => props.onUpdate({ tags: is.unique(value) })}
      >
        {allTags.map(tag => (
          <Select.Option value={tag} key={tag}>
            {tag}
          </Select.Option>
        ))}
      </Select>
    </>
  );
}
