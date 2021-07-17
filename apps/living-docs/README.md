# Automagical Living Docs

This page exists to provide technical notes and detailed api documentation on projects associated with this monorepo.
It is formed from a combination of typescript type information, tsdoc comments, and markdown files documenting adjacent code.

## Applications

| Application | Description |
| --- | --- |
| [API Server](/additional-documentation/docker-images/api-server.html) | [Submission Server](/additional-documentation/docker-images/api-server/submission-server.html) |
| [SQL Connector](/additional-documentation/docker-images/sql-connector.html) | Microservice to power the 7.x sqlconnector action |
| [Living Docs](/additional-documentation/docker-images/documentation.html) | Coordinator between compodoc and the repository |

## Libraries

| Library | Description |
| --- | --- |
| [Action](/additional-documentation/internal-libraries/action.html) | Logic for driving form actions |
| [Authentication](/additional-documentation/internal-libraries/authentication.html) | All things session and permission related |
| [Configuration](/additional-documentation/developer-notes/configuration.html) | Code for filling in configuration data at boot, and provides symbols / definitions for loading |
| [Contracts](/additional-documentation/internal-libraries/contracts.html) | Contains all object, constant, enum definitions. If a symbol could be needed outside of a single lib / app, then it probably is defined here |
| [Emailer](/additional-documentation/internal-libraries/email.html) | Emailer code for the email action |
| [Fetch](/additional-documentation/internal-libraries/fetch.html) | node-fetch with extra features tuned to form.io use cases |
| [Formio SDK](/additional-documentation/internal-libraries/formio-sdk.html) | Tools for interacting with the form.io api via rest calls |
| [Licenses](/additional-documentation/internal-libraries/licenses.html) | Tools for images to consume licenses with. |
| [Persistence](/additional-documentation/internal-libraries/persistence.html) | CRUD definitions for all mongo compat interfaces |
| [Proxy](/additional-documentation/internal-libraries/proxy.html) | Tools for proxying requests |
| [Server](/additional-documentation/internal-libraries/server.html) | Provides all the basic middleware and annotations that power servers that doesn't belong to another lib |
| [Utilities](/additional-documentation/internal-libraries/utilities.html) | Misc tools |
| [Validation](/additional-documentation/internal-libraries/validation.html) | Submission validation logic |
| [Wrapper](/additional-documentation/internal-libraries/wrapper.html) | Import wrappers around some node modules that need a bit of help |
