// @Put('/:projectId')
export const PROJECT_UPDATE_DESCRIPTION =
  'Modify an already existing project. Not all properties may be modified through this route';
export const PROJECT_UPDATE_EXTERNAL_DOCS = {
  description: 'example docs description',
  url: 'https://www.example.com',
};
export const PROJECT_UPDATE_SUMMARY = 'Update a project definition';

// @Post('/')
export const PROJECT_CREATE_DESCRIPTION =
  'Insert a new project w/ components into the database';
export const PROJECT_CREATE_EXTERNAL_DOCS = {
  description: 'example docs description',
  url: 'https://www.example.com',
};
export const PROJECT_CREATE_SUMMARY = 'Create a new project';

// @Post('/admin')
