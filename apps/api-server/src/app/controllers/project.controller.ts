import {
  Body,
  Controller,
  Get,
  NotImplementedException,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ProjectDTO } from '@automagical/contracts/formio-sdk';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

/**
 * Rate limit request going into this controller.
 * Defaults are set up in app.module
 */
@UseGuards(ThrottlerGuard)
@Controller('project')
export class ProjectController {
  // #region Public Methods

  @Get('/export')
  public exportTemplate(): Promise<ProjectDTO> {
    throw new NotImplementedException();
  }

  @Get('/access')
  public getAccessInfo(): Promise<ProjectDTO> {
    throw new NotImplementedException();
  }

  @Get('/:projectId')
  public getProject(): Promise<ProjectDTO> {
    throw new NotImplementedException();
  }

  @Get()
  public listAllProjects(): Promise<ProjectDTO[]> {
    throw new NotImplementedException();
  }

  @Get('/token')
  public tempAuthToken(): Promise<null> {
    throw new NotImplementedException();
  }

  @Post()
  public async createProject(
    @Body() project: Partial<ProjectDTO>,
  ): Promise<ProjectDTO> {
    return project as ProjectDTO;
  }

  @Post('/admin')
  public createProjectAdmin(): Promise<null> {
    throw new NotImplementedException();
  }

  @Post('/import')
  public importTemplate(): Promise<ProjectDTO> {
    throw new NotImplementedException();
  }

  @Put('/:projectId')
  public updateProject(): Promise<ProjectDTO> {
    throw new NotImplementedException();
  }

  /**
   * Since this is a login route, it is subject to more restrictive throttling rules.
   *
   * Log into a project as a project admin (2 attempts / min / IP).
   * Don't screw up twice in a row or you gotta wait
   */
  @Throttle(2, 60)
  @Post('/admin/login')
  public adminLogin(): Promise<null> {
    throw new NotImplementedException();
  }

  // #endregion Public Methods
}
