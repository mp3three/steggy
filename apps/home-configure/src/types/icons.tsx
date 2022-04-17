import AlarmBell from '@2fd/ant-design-icons/lib/AlarmBell';
import ApplicationVariable from '@2fd/ant-design-icons/lib/ApplicationVariable';
import BulletinBoard from '@2fd/ant-design-icons/lib/BulletinBoard';
import CardRemove from '@2fd/ant-design-icons/lib/CardRemove';
import ContentCopy from '@2fd/ant-design-icons/lib/ContentCopy';
import DebugStepInto from '@2fd/ant-design-icons/lib/DebugStepInto';
import Filter from '@2fd/ant-design-icons/lib/Filter';
import HomeAutomation from '@2fd/ant-design-icons/lib/HomeAutomation';
import InformationIcon from '@2fd/ant-design-icons/lib/Information';
import LightbulbGroupOutline from '@2fd/ant-design-icons/lib/LightbulbGroupOutline';
import Magnify from '@2fd/ant-design-icons/lib/Magnify';
import Menu from '@2fd/ant-design-icons/lib/Menu';
import PlusBoxMultiple from '@2fd/ant-design-icons/lib/PlusBoxMultiple';
import StepForward from '@2fd/ant-design-icons/lib/StepForward';
import TimelinePlus from '@2fd/ant-design-icons/lib/TimelinePlus';
import { HomeOutlined, SettingOutlined } from '@ant-design/icons';

type iconTypes =
  | 'magnify'
  | 'menu'
  | 'plus_box'
  | 'routines'
  | 'entities'
  | 'execute'
  | 'information'
  | 'filter'
  | 'clone'
  | 'list_add'
  | 'remove'
  | 'settings'
  | 'rooms'
  | 'metadata'
  | 'run'
  | 'groups'
  | 'home';

/**
 * Partially for consistent icons, partially because of the annoying way @2fd exports their stuff
 */
export const FD_ICONS = new Map<iconTypes, JSX.Element>([
  ['entities', <AlarmBell />],
  ['groups', <LightbulbGroupOutline />],
  ['home', <HomeOutlined />],
  ['information', <InformationIcon />],
  ['filter', <Filter />],
  ['clone', <ContentCopy />],
  ['list_add', <TimelinePlus />],
  ['magnify', <Magnify />],
  ['menu', <Menu />],
  ['metadata', <ApplicationVariable />],
  ['execute', <StepForward />],
  ['remove', <CardRemove />],
  ['plus_box', <PlusBoxMultiple />],
  ['rooms', <BulletinBoard />],
  ['routines', <HomeAutomation />],
  ['run', <DebugStepInto />],
  ['settings', <SettingOutlined />],
]);
