import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FanCommandDto } from '@automagical/home-assistant';
import { PhoneService } from './phone.service';

@Controller('phone')
export class PhoneController {
  // #region Constructors

  public constructor(private phoneService: PhoneService) {}

  // #endregion Constructors

  // #region Public Methods

  @Get('/state')
  public async getState() {
    return this.phoneService.getPhoneState();
  }

  @Get('/command/house/leave')
  public async leaveHome() {
    return this.phoneService.leaveHome();
  }

  @Get('/command/house/lock')
  public async lockHouse() {
    return this.phoneService.lockHouse();
  }

  @Get('/command/car/frunk')
  public async openFrunk() {
    return this.phoneService.openFrunk();
  }

  @Get('/command/car/climate')
  public async toggleClimage() {
    return this.phoneService.toggleClimate();
  }

  @Get('/command/toggle/:switch')
  public async toggleSwitch(@Param('switch') switchName: string) {
    return this.phoneService.toggleSwitch(switchName);
  }

  @Get('/command/house/unlock')
  public async unlockHouse() {
    return this.phoneService.unlockHouse();
  }

  @Post('/command/roku')
  public async controlRoku(
    @Body() rokuCommand: { location: 'loft' | 'living_room'; command: string },
  ) {
    const { location, command } = rokuCommand;
    return this.phoneService.controlRoku(location, command);
  }

  @Post('/command/fan')
  public async setFan(@Body() fanCommand: FanCommandDto) {
    // log(`setFan`, fanCommand);
    return this.phoneService.setFan(fanCommand);
  }

  // #endregion Public Methods
}
