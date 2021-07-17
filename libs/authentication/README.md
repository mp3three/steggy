# libs/authentication

## Responsibilities

- Add user / permission / session data to the ResponseLocals
- Calculate if a given set of roles / teams / headers is allowed to access a route based on metadata applied to the handler
- Add to a running list of flags that can describe the nature of the operations done during this request
  - Can be used to identifying if this request was sourced from an API key without loading this lib for example

## Auth pipeline intended workflow

Auth strategies + relevant metadata should be applied to the route handler so that each route may operate with different rules.
From the point of view of a consumer of this lib, a single decorator should be used per route to attach all needed metadata + guards.

The auth pipeline works in 3 phases:

### 1 - Data loading

Guards that extract data from headers, validate that it is valid, and append it to the reponse locals

### 2 - Calculation

Depending on the settings passed to the original decorator, different validation styles (project read / submission create / etc) will be run.
If any one of them succeeds, it will set a flag on the locals. All other auth guards will automatically return early to keep the authentication greedy.

### 3 - Final verdict

At the very end of the pipeline, a check is done to verify at least one of the previous guards set the authorized flag. If none gave a thumbs up, this guard will reject the request

## Configuration

Available properities
