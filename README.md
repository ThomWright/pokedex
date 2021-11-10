# Pokemon

## Running instructions

### Using Node.js

#### Required dependencies

- Node.js 14.7
- NPM 6.14

If you want to run Node.js and don't have it installed, I recommend trying [nvm](https://github.com/nvm-sh/nvm).

#### Running

- Install dependencies: `npm ci`
- Run: `npm run start-ts`

### Using Docker

#### Required dependencies

- Docker - I'm running version 20.10.7

#### Running

- Build: `docker build -t pokedex-thom .`
- Run: `docker run --rm pokedex-thom`

## Productionising

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
  - environment variables
  - validated and type checked (using `io-ts`)
- tests
  - the tests we want highly depend on what kind of code we're writing
- license checking
  - have we used any libraries with problematic GPL licenses?

## Notes

**Language:** TypeScript - currently the language I'm most familiar with
**HTTP server:** Express.js - probably the most popular HTTP server in Node.js land

I've gone with some of the standard boilerplate we use at Candide to get me started.
