export enum MobileDevice {
  // 😂
  // eslint-disable-next-line unicorn/prevent-abbreviations
  iPhone = 'mobile_app_cameron_s_iphone',
  pixel2 = 'mobile_app_pixel',
  // iPad = 'mobile_app_camerons_ipad',
  generic = 'notify',
}

export enum NotificationGroup {
  door = 'Door Status',
  serverStatus = 'Server Status',
  battery = 'Battery Watch',
  environment = 'Environment',
}

export type HueEvent = {
  buttonEvent: string;
  buttonNumber: '1' | '2' | '3' | '4';
  event: number;
};

export enum RoomsCode {
  bedroom = 'bedroom',
  games = 'games',
  guest = 'guest',
  garage = 'garage',
  livingRoom = 'living_room',
  living = 'living',
  loft = 'loft',
}
