import { LIB_PERSISTENCE } from '@automagical/contracts/constants';
import { ProjectDTO, PROJECT_TYPES } from '@automagical/contracts/formio-sdk';
import { PROJECT_PERSISTENCE_DRIVER } from '@automagical/contracts/persistence';
import { iDriver } from '@automagical/persistence';
import { InjectLogger, Trace } from '@automagical/utilities';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class ProjectDriver {
  // #region Constructors

  constructor(
    @InjectLogger(ProjectDriver, LIB_PERSISTENCE)
    protected readonly logger: PinoLogger,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  /**
   * Verify minimum properties exist
   *
   * Ask driver to store data
   */
  @Trace()
  public async create(project: Partial<ProjectDTO>): Promise<ProjectDTO> {
    // if (!project?.name) {
    //   throw new BadRequestException(`name is required`);
    // }
    // project.type = PROJECT_TYPES.project;
    // project.title = project.title || project.name;
    // project.settings = project.settings || {};
    // project.settings.cors = project.settings.cors || '*';
    // return (await super.create(project)) as ProjectDTO;
    return project as ProjectDTO;
  }

  // #endregion Public Methods
}
// {
//   message: 'Remote already connected to an environment.',
//   validator(value) {
//     return new Promise((resolve) => {
//       if (!value || !value.project || !value.project._id) {
//         return resolve(true);
//       }

//       const search: Record<string, unknown> = {
//         'remote.url': value.url,
//         'remote.project._id': value.project._id,
//         deleted: { $eq: null },
//       };

//       if (this._id) {
//         search._id = { $ne: this._id };
//       }

//       return mongoose
//         .model('project')
//         .findOne(search)
//         .lean()
//         .exec(function (err, result) {
//           if (err) {
//             logger.error(err);
//           }
//           if (err || result) {
//             return resolve(false);
//           }
//           return resolve(true);
//         });
//     });
//   },
// },

// {
//   message: 'The Project name must be unique.',
//   validator(value: string) {
//     return new Promise((resolve) => {
//       const search: Record<string, unknown> = {
//         name: value,
//         deleted: { $eq: null },
//       };

//       // Ignore the id if this is an update.
//       if (this._id) {
//         search._id = { $ne: this._id };
//       }
//       return model('project')
//         .findOne(search)
//         .lean()
//         .exec((err, result) => {
//           if (err) {
//             logger.error(err);
//           }
//           if (err || result) {
//             return resolve(false);
//           }
//           resolve(true);
//         });
//     });
//   },
// },
