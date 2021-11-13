# Pokemon

## Running instructions

### Dependencies

- Docker - I'm running version 20.10.7
- (Optional) Node.js 14.7
- (Optional) NPM 6.14

The optional dependencies are for developing and testing.

If you want to run Node.js and don't have it installed, I recommend trying [nvm](https://github.com/nvm-sh/nvm).

### Run

Using Docker:

- Build: `docker build -t pokedex .`
  - Or: `npm run build:docker` if you have NPM installed
- Run: `docker run --rm pokedex`

Or just using Node.js directly:

- Install dependencies: `npm ci`
- Run: `npm run start-ts`

### Test

Sanity check: `curl localhost:3000/pokemon/ditto` TODO:

Run the tests:

- Unit tests: `npm run test:unit`
- API tests: `npm run test:api`

## Productionising

A discussion of how I would prepare this for production, and also for future evolution (if necessary).

### Structure

Normally I favour structuring services by [separating by feature (as opposed to type or layer)](https://phauer.com/2020/package-by-feature/) at a high level, and within each feature having several layers:

- Transport - transport specific code and little else, e.g. defining HTTP APIs
- Business logic - reusable logic, no transport specific code here
- Persistence - Data storage code, e.g. SQL, transactions

In an app this small, I was tempted to keep minimal structure, since it keeps things concise and readable. A little structure felt appropriate though. It sets a direction for future evolution.

### Error handling

This is a big one I missed out. We should handle errors to the external APIs, including:

- network errors
- HTTP error status codes (especially HTTP 429 Too Many Requests from the translation API)

We should handle these in our logic, and return e.g. `Promise<Result<PokemonResource, SomeError>>`, where:

- `Result<S, E>` is either a success or error value
- `SomeError` contains enough information for the HTTP layer to return an appropriate status code

We should also better handle the case where we can't find an English `flavor_text`, or if other data coming from the API is null. It's easy to assume it'll always be there, but I don't know if it's guaranteed.

TODO:
For now, I just made the executive decision to just throw if any of these errors happen, catch them in the HTTP handlers and return 500.

### TODO: Document these things

- better type safety
  - inputs should be validated and type checked
- health checks
  - separate live/ready if necessary
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
  - unit, integration, E2E, contract, property...
- license checking
  - have we used any libraries with problematic GPL licenses?
- structure
  - if this was bigger, with more features and/or more non-HTTP business logic, then split up appropriately
- cache responses from PokeAPI
  - and responses from the translation API
  - decrease chance of rate limiting
  - assume data relatively static, long TTL
  - start in-process, then move to e.g. Redis
- use client library?
  - has built in caching, but no types (yet!)
- better error handling!
- documentation
  - API docs
  - internal docs, e.g. structure, purpose, how the tests work etc.

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
