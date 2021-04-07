import {
  Body,
  Controller,
  Get,
  NotImplementedException,
  Post,
  Put,
} from '@nestjs/common';
import { ProjectDTO } from '@automagical/contracts/formio-sdk';

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

  @Post('/admin/login')
  public adminLogin(): Promise<null> {
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

  // #endregion Public Methods
}
