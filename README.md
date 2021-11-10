# Pokemon

## Running instructions

### Dependencies

- Node.js 14.7
- NPM 6.14
- (Optional) Docker - I'm running version 20.10.7

If you want to run Node.js and don't have it installed, I recommend trying [nvm](https://github.com/nvm-sh/nvm).

### Run

- Install dependencies: `npm ci`

Then, either use Docker:

- Build: `docker build -t pokedex-thom .`
- Run: `docker run --rm pokedex-thom`

Or just Node.js directly:

- Run: `npm run start-ts`

### Test

Sanity check: `curl localhost:3000/pokemon/ditto` TODO:

Run the tests:

- unit tests: `npm run test:unit`
- API tests: `npm run test:api`

## Productionising

- better type safety
  - inputs should be validated and type checked
- health checks
- CI
- integration tests
  - start the service using Docker
  - test API calls work correctly
  - consider mocking third-party dependencies (pros and cons!)
- graceful shutdown
- observability
  - structured and correlated logging
  - metrics
  - tracing
- configuration
  - environment variables (and/or a `.env`, using `dotenv`)
  - validated and type checked (using `io-ts`)
  - should configure e.g. port, host to bind to, external API host names
- tests
  - the tests we want highly depend on what kind of code we're writing
- license checking
  - have we used any libraries with problematic GPL licenses?
- structure
  - if this was bigger, with more features and/or more non-HTTP business logic, then split up appropriately
- TODO: could build the application inside Docker so y'all don't need to install Node.js...
  - possibly using a multi-stage build
- cache responses from PokeAPI
- use client library?
  - has built in caching, but no types (yet!)
- better error handling!
- API documentation

## Notes

**Language:** TypeScript - currently the language I'm most familiar with
**HTTP server:** Express.js - probably the most popular HTTP server in Node.js land

I've adapted some of the standard boilerplate I've developed to use at Candide to get me started.

This includes:

- linting
- formatting
- unit tests
- API tests (start the service and test it, black box style)
- generating a version.json file containing the git short hash (useful for sanity checking!)

### Design decisions

- The [PokeAPI docs](https://pokeapi.co/docs/v2) do not specify which fields can be null, as far as I can see. `habitat` _can_ apparently be null, which is the only one I've noticed. TODO:
- Only returning the minimum information:
  - Generally I wouldn't include extra data surplus to requirements, unless I had good reason to believe it would be useful.
  - It's likely to be wasted effort, or worse: could be the wrong thing entirely. We might need to support the decision indefinitely for backwards-compatibility reasons.

### Testing

- minimal unit tests, most risk here is at the integration points
- the tests are more complicated than I'd like, but they gave me the confidence I'm after
- could consider some in-process HTTP testing using e.g. using [superagent](https://www.npmjs.com/package/supertest)
  - would be quicker, fewer moving parts, less complex
  - would arguably be nice to not need Docker as part of the main tests, and just have a single smoke test for it
  - but would give less confidence that the build Docker image worked correctly
  - building the Docker image every time is sloooooow, not a good DX
