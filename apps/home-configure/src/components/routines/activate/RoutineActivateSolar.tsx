import { SolarActivateDTO } from '@steggy/controller-shared';
import { DOWN, UP } from '@steggy/utilities';
import { Button, List, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import SolarCalc from 'solar-calc/types/solarCalc';

import { FD_ICONS, sendRequest } from '../../../types';

type tState = {
  astronomicalDawn?: string;
  astronomicalDusk?: string;
  civilDawn?: string;
  civilDusk?: string;
  dawn?: string;
  dusk?: string;
  goldenHourEnd?: string;
  goldenHourStart?: string;
  name: string;
  nauticalDawn?: string;
  nauticalDusk?: string;
  nightEnd?: string;
  nightStart?: string;
  solarNoon?: string;
  sunrise?: string;
  sunriseEnd?: string;
  sunset?: string;
  sunsetStart?: string;
};
const LABELS = new Map([
  ['astronomicalDawn', 'Astronomical Dawn'],
  ['astronomicalDusk', 'Astronomical Dusk'],
  ['civilDawn', 'Civil Dawn'],
  ['civilDusk', 'Civil Dusk'],
  ['dawn', 'Dawn'],
  ['dusk', 'Dusk'],
  ['nauticalDawn', 'Nautical Dawn'],
  ['nauticalDusk', 'Nautical Dusk'],
  ['nightEnd', 'Night End'],
  ['nightStart', 'Night Start'],
  ['solarNoon', 'Solar Noon'],
  ['sunrise', 'Sunrise'],
  ['sunriseEnd', 'Sunrise End'],
  ['sunset', 'Sunset'],
  ['sunsetStart', 'Sunset Start'],
  // These move between sunrise and sunset
  ['goldenHourStart', 'Golden Hour Start'],
  ['goldenHourEnd', 'Golden Hour End'],
]);

export function RoutineActivateSolar(props: {
  activate: SolarActivateDTO;
  onUpdate: (activate: Partial<SolarActivateDTO>) => void;
}) {
  const [state, setState] = useState<tState>({} as tState);

  useEffect(() => {
    async function refresh(): Promise<void> {
      setState({
        ...(await sendRequest<tState>({
          url: `/debug/solar`,
        })),
      });
    }
    refresh();
  }, []);

  return (
    <List
      pagination={{ pageSize: 20 }}
      dataSource={[
        'astronomicalDawn',
        'astronomicalDusk',
        'civilDawn',
        'civilDusk',
        'dawn',
        'dusk',
        // 'goldenHourStart',
        // 'goldenHourEnd',
        'nauticalDawn',
        'nauticalDusk',
        'nightEnd',
        'nightStart',
        'solarNoon',
        'sunrise',
        'sunriseEnd',
        'sunset',
        'sunsetStart',
      ]
        .map(event => [event, dayjs(state[event])])
        .sort(([, a]: [string, dayjs.Dayjs], [, b]: [string, dayjs.Dayjs]) =>
          a.isAfter(b) ? UP : DOWN,
        )}
      header={
        <div style={{ textAlign: 'right' }}>
          <Tooltip
            title="Times vary based on coordinates provided by Home Assistant and current date"
            placement="topLeft"
          >
            {FD_ICONS.get('information')}
          </Tooltip>
        </div>
      }
      renderItem={([eventName, day]: [keyof SolarCalc, dayjs.Dayjs]) => (
        <List.Item>
          <List.Item.Meta
            title={
              <Button
                size="small"
                type={props.activate?.event !== eventName ? 'text' : 'primary'}
                onClick={() => props.onUpdate({ event: eventName })}
              >
                {LABELS.get(eventName)}
              </Button>
            }
          />
          <Typography.Text type="secondary">
            {day.format('hh:mm:ss A')}
          </Typography.Text>
        </List.Item>
      )}
    />
  );
}
