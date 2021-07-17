import {
  APP_API_SERVER,
  APP_LICENSE_SERVER,
  APP_SQL_CONNECTOR,
} from '@formio/contracts/constants';

export enum MULTICONTAINERS {
  submissionServer = 'submission-erver',
  submissionServerGov = 'submission-server-gov',
  livingDocs = 'living-docs',
  sqlConnector = 'sql-connector',
}

export const MulticontainerMap = new Map(
  Object.entries({
    [APP_API_SERVER.description]: [
      MULTICONTAINERS.submissionServer,
      MULTICONTAINERS.submissionServerGov,
    ],
    [APP_SQL_CONNECTOR.description]: [MULTICONTAINERS.sqlConnector],
    [APP_LICENSE_SERVER.description]: [MULTICONTAINERS.livingDocs],
  }),
);

export const MULTICONTAINER_ROOT = new Map(
  Object.entries({
    [MULTICONTAINERS.livingDocs]: 'apps/living-docs/deployments/aws',
    [MULTICONTAINERS.sqlConnector]: 'apps/sql-connector/deployments/aws',
    [MULTICONTAINERS.submissionServer]:
      'apps/api-server/deployments/submission-server/aws',
    [MULTICONTAINERS.submissionServerGov]:
      'apps/api-server/deployments/submission-server-gov/aws',
  }),
);
