import {
  FILTER_OPERATIONS,
  FilterDTO,
  FilterValueType,
  ResultControlDTO,
} from '@automagical/utilities';
import { BadRequestException } from '@nestjs/common';
import { isNumberString } from 'class-validator';
import dayjs from 'dayjs';

export function filtersToMongoQuery(
  query: ResultControlDTO,
): Map<string, unknown> {
  const out = new Map<string, unknown>();

  (query.filters ?? new Set()).forEach((filter) => {
    if (typeof filter.exists !== 'undefined') {
      out.set(
        `$${filter.field}`,
        ['true', '1'].includes(filter.value.toString()),
      );
      return;
    }
    resolve(filter);
    switch (filter.operation) {
      case 'regex':
        if (filter.value instanceof RegExp) {
          return out.set(filter.field, {
            $regex: filter.value,
          });
        }
        const regexParts = (filter.value as string).match(
          new RegExp('(?:/([^/]+))', 'gm'),
        );
        try {
          return out.set(filter.field, {
            $options: regexParts[2] || 'i',
            // eslint-disable-next-line security/detect-non-literal-regexp
            $regex: new RegExp(regexParts[1]),
          });
        } catch {
          // Invalid regex?
          return out.set(filter.field, {
            $options: regexParts[2] || 'i',
            $regex: null,
          });
        }
      case 'elem':
        return out.set(filter.field, {
          $elemMatch: filter.value,
        });
      case 'in':
      case 'nin':
        const value: FilterValueType[] = Array.isArray(filter.value)
          ? filter.value
          : filter.value.toString().split(',');
        return out.set(filter.field, {
          [`$${filter.operation}`]: value.map((v) => cast(filter.field, v)),
        });
      case 'gte':
      case 'lte':
      case 'gt':
      case 'lt':
      case 'eq':
      case 'ne':
        return out.set(filter.field, {
          [`$${filter.operation}`]: cast(filter.field, filter.value),
        });
      default:
        throw new BadRequestException(`Unknown operator: ${filter.operation}`);
    }
  });
  return out;
}

function cast(field: string, value) {
  switch (field) {
    case 'created':
    case 'updated':
      return dayjs(value).toDate();
  }
  return value;
}
/**
 * - default the operation to equals
 * - if numeric, change to in, array with string & number form
 *   - if 1 or 0, add in bool
 * - if 'y', 'n', 'true', 'false' add in bool
 */
function resolve(filter: FilterDTO) {
  filter.operation ??= FILTER_OPERATIONS.eq;
  if (isNumberString(filter.value)) {
    const value = Number(filter.value);
    filter.value = [filter.value as string, value];
    filter.operation = FILTER_OPERATIONS.in;
    if (value === 0) {
      filter.value.push(false);
    }
    if (value === 1) {
      filter.value.push(true);
    }
  } else if (
    typeof filter.value === 'string' &&
    ['y', 'true'].includes(filter.value.toLocaleLowerCase())
  ) {
    filter.value = [filter.value as string, true];
    filter.operation = FILTER_OPERATIONS.in;
  } else if (
    typeof filter.value === 'string' &&
    ['n', 'false'].includes(filter.value.toLowerCase())
  ) {
    filter.operation = FILTER_OPERATIONS.in;
    filter.value = [filter.value as string, false];
  }
}

// @Injectable()
// export class MongooseConnection {
//   // #region Public Static Methods

//   /* eslint-disable security/detect-non-literal-regexp, unicorn/no-null, radar/cognitive-complexity */
//   /**
//    * Convert standard filter query params into a mongo search object
//    *
//    * TODO: Break up function to reduce complexity
//    */
//   public static

//   // #endregion Public Static Methods

//   // #region Private Static Methods

//   // #endregion Private Static Methods

//   // #region Object Properties

//   private done: (argument) => void;

//   // #endregion Object Properties

//   // #region Public Methods

//   /* eslint-enable security/detect-non-literal-regexp, unicorn/no-null */
//   public async onModuleBootstrap(): Promise<void> {
//     return new Promise((done) => {
//       this.done = done;
//       return this.connect();
//     });
//   }

//   // #endregion Public Methods

//   // #region Private Methods

//   private async connect() {
//     const options = await this.getOptions();
//     /**
//      * TODO connection string as array
//      * - turns on high availability
//      * TODO ssl
//      */
//     await mongoose.connect(process.env.MONGO, options);

//     mongoose.set('useFindAndModify', false);
//     mongoose.set('useCreateIndex', true);
//   }

//   private async getOptions(): Promise<mongoose.ConnectOptions> {
//     return {
//       connectTimeoutMS: 300000,
//       keepAlive: true,
//       socketTimeoutMS: 300000,
//       useCreateIndex: true,
//       useNewUrlParser: true,
//     };
//   }

//   // #endregion Private Methods
// }
