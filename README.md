# Pokemon

A simple service which serves up information about Pokemon, included translated descriptions.

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

Sanity check: `curl localhost:3000/pokemon/ditto`

Run the tests:

- Unit tests: `npm run test:unit`
- API tests: `npm run test:api`

## Design decisions

**Language:** TypeScript - currently the language I'm most familiar with \
**HTTP server:** Express.js - probably the most popular HTTP server in Node.js land

I've adapted some of the standard boilerplate I've developed to use at Candide to get me started.

This includes:

- linting
- formatting
- unit tests
- generating a version.json file containing the git short hash (useful for sanity checking!)

### Structure

Normally I favour structuring services by [separating by feature (as opposed to type or layer)](https://phauer.com/2020/package-by-feature/) at a high level, and within each feature having several layers:

- Transport - transport specific code and little else, e.g. defining HTTP APIs
- Business logic - reusable logic, no transport specific code here
- Persistence - Data storage code, e.g. SQL, transactions

In an app this small, I was tempted to keep minimal structure, since it keeps things concise and readable. A little structure felt appropriate though. It sets a direction for future evolution.

### Returning minimum data

Generally I wouldn't include extra data surplus to requirements, unless I had good reason to believe it would be useful. It's likely to be wasted effort, or worse: could be the wrong thing entirely. We might end up needing to support the decision indefinitely for backwards-compatibility reasons.

### Not using an open source client library

I had a look, and it might have been worth using, but since it doesn't yet support TypeScript I think I wouldn't have found enough benefit from it. Normally I'd opt to use existing libraries if they're good enough quality (whatever "good enough" means in a given context!).

### PokeAPI response types

The [PokeAPI docs](https://pokeapi.co/docs/v2) do not specify which fields can be null, as far as I can see. `habitat` _can_ apparently be null, which is the only one I've observered.

### Testing

I started with minimal unit tests, since I figured the most risk here is at the integration points:

- our own exposed HTTP APIs
- integrating with the external APIs
- making sure the thing runs at all!

So I decided spending some time setting up some API tests (or integration tests, I'm using the terms interchangably) was a worthwhile investment of my time.

Later, as I wrote more logic, I decided I wanted more unit tests. I wanted a quicker feedback cycle and less reliance on external dependencies. I refactored to make this easier.

### Caching

I'm using a simple in-memory cache to store responses from the external APIs.

Since the descriptions we're translating are small, I didn't bother hashing the input for the cache keys.

I'm assuming the Pokemon data is fairly static, and translations are unlikely to change significantly (if at all), so I set a fairly long TTL of 24 hours. It can be difficult to set these things without real world traffic informing the decision!

### Health checks

I included a simple liveness health check to help with the integration tests.

I see the intended semantics matching that of the Kubernetes liveness probes. If deploying into a Kubernetes environment and there was a difference between live and ready, I would implement a readiness health check as well.

Having worked largely with Kubernetes in the recent past, I'm not familiar with how other similar systems would expect health checks to work, but this seems like a good start.

## Productionising

A discussion of what I would consider when preparing this for production. Some of these assume the project will keep growing and evolving.

### Error handling

This is a big one I intentionally glossed over. Errors from the external APIs should probably be better handled, including:

- network errors
- HTTP error status codes (especially HTTP 429 Too Many Requests from the translation API)

I'd handle these in the logic, which could return e.g. `Promise<Result<PokemonResource, SomeError>>`, where:

- `Result<S, E>` is either a success or error value
- `SomeError` contains enough information for the HTTP layer to return an appropriate status code

We could also better handle the case where we can't find an English `flavor_text`, or if other data coming from the API is null. It's easy to assume it'll always be there, but I don't know if it's guaranteed.

For now, I made the decision to just throw if any of these errors happen, catch them in the HTTP handlers and return 500. I'm actually tempted to say this is maybe OK here, but happy to discuss!

### Testing

Given more time I would consider investigating writing some in-process HTTP tests using e.g. [superagent](https://www.npmjs.com/package/supertest), which could give good end-to-end internal coverage. I haven't used this for a long time, but curious to give it another go.

I'd also look at mocking/stubbing the external HTTP dependencies. I'd prefer to not rely on them, particularly for CI, and especially given the fairly strict rate limiting on the translation API.

### Caching

For production I'd probably choose to use an external caching service e.g. Redis. In-process caching is fine for a quick prototype or PoC, but won't survive restarts and would be less suitable when running multiple replicas in production.

### Type Safety

I would generally do type-checking/validation on input types (or any data from an external system). This includes inputs to HTTP request handlers, configuration from environment variables, as well as responses from the external APIs.

### CI

There's no CI here. Some kind of build/test/deploy pipeline would be a prerequisite for production, whatever form that might take.

### Graceful shutdown

I believe application code is needed to ensure the Express server shuts down gracefully, so that it stops accepting new connections and lets in-flight requests finish before shutting down.

### Observability

I'd want the service to be observable, including:

- structured and correlated logging
- metrics, including:
  - request rate
  - request duration
  - error rate
- tracing

Note: I should probably fix all the lint warnings about using `console.log`, but I figured I'd choose to remove these at some point anyway!

### Documentation

Some API docs would be nice, using something like Swagger, but probably not essential.

### Configuration

I'd like to add type checked configuration (possibly using e.g. `io-ts`), probably using environment variables.

The most obvious bits of configation for what's there so far would be:

- the port to bind to
- external API host names (useful for testing)
