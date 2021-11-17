/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {expect} from "chai"
import * as sinon from "sinon"
import {createCache} from "../../cache"
import {createPokemonLogic} from "../logic"
import {PokeApiClient, PokemonSpeciesResponseBody} from "../poke-api-client"
import {PokemonResource} from "../types"

function createMockPokeApiClient(
  returns: PokemonSpeciesResponseBody | undefined | Error,
): PokeApiClient {
  return {
    getPokemonSpecies:
      returns instanceof Error
        ? sinon.fake.throws(returns)
        : sinon.fake.resolves(returns),
  }
}

describe("Pokemon logic", () => {
  describe("getPokemonInfo", () => {
    describe("caching", () => {
      it("should fetch exiting pokemon from the cache", async () => {
        const mockApi = createMockPokeApiClient(
          new Error("Shouldn't call the API"),
        )

        const translateTextFake = sinon.fake.throws(
          new Error("Shouldn't translate"),
        )

        const pokemonResponse = {
          id: 0,
          name: "test",
          flavor_text_entries: [
            {
              flavor_text: "Original",
              language: {name: "en", url: "some_url"},
              version: {name: "red", url: "some_url"},
            },
          ],
          habitat: {name: "test land", url: "some_url"},
          is_legendary: false,
        }
        const expectedPokemonResource: PokemonResource = {
          name: "test",
          description: "Original",
          habitat: "test land",
          isLegendary: false,
        }

        const cache = createCache<PokemonSpeciesResponseBody>()
        cache.set("test", pokemonResponse)

        const logic = createPokemonLogic({
          pokeApiClient: mockApi,
          translateText: translateTextFake,
          cache,
        })

        const pokemon = await logic.getPokemonInfo("test")

        expect(pokemon).to.deep.equal(expectedPokemonResource)
      })

      it("should save fetched pokemon to the cache", async () => {
        const mockApi = createMockPokeApiClient({
          id: 0,
          name: "test",
          flavor_text_entries: [
            {
              flavor_text: "Original",
              language: {name: "en", url: "some_url"},
              version: {name: "red", url: "some_url"},
            },
          ],
          habitat: {name: "cave", url: "some_url"},
          is_legendary: false,
        })

        const translateTextFake = sinon.fake.throws(
          new Error("Shouldn't translate"),
        )

        const cache = createCache<PokemonSpeciesResponseBody>()

        const logic = createPokemonLogic({
          pokeApiClient: mockApi,
          translateText: translateTextFake,
          cache,
        })

        await logic.getPokemonInfo("test")

        expect(cache.get("test"), "'test' key in cache").to.exist
      })
    })
  })

  describe("getTranslatedPokemonInfo", () => {
    describe("translation", () => {
      context("pokemon's habitat is cave", () => {
        it("should apply Yoda translation", async () => {
          const mockApi = createMockPokeApiClient({
            id: 0,
            name: "test",
            flavor_text_entries: [
              {
                flavor_text: "Original",
                language: {name: "en", url: "some_url"},
                version: {name: "red", url: "some_url"},
              },
            ],
            habitat: {name: "cave", url: "some_url"},
            is_legendary: false,
          })
          const translateTextFake = sinon.fake.returns("Translated")

          const logic = createPokemonLogic({
            pokeApiClient: mockApi,
            translateText: translateTextFake,
            cache: createCache(),
          })

          const pokemon = await logic.getTranslatedPokemonInfo("test")

          expect(
            translateTextFake.calledWith("Original", "yoda"),
            "using Yoda translation",
          ).to.be.true

          expect(pokemon).to.have.property("description", "Translated")
        })
      })

      context("pokemon is legendary", () => {
        it("should apply Yoda translation", async () => {
          const mockApi = createMockPokeApiClient({
            id: 0,
            name: "test",
            flavor_text_entries: [
              {
                flavor_text: "Original",
                language: {name: "en", url: "some_url"},
                version: {name: "red", url: "some_url"},
              },
            ],
            habitat: {name: "legendary", url: "some_url"},
            is_legendary: true,
          })
          const translateTextFake = sinon.fake.returns("Translated")

          const logic = createPokemonLogic({
            pokeApiClient: mockApi,
            translateText: translateTextFake,
            cache: createCache(),
          })

          const pokemon = await logic.getTranslatedPokemonInfo("test")

          expect(
            translateTextFake.calledWith("Original", "yoda"),
            "using Yoda translation",
          ).to.be.true

          expect(pokemon).to.have.property("description", "Translated")
        })
      })

      context("pokemon is neither legendary nor has a cave habitat", () => {
        it("should apply Shakespeare transation", async () => {
          const mockApi = createMockPokeApiClient({
            id: 0,
            name: "test",
            flavor_text_entries: [
              {
                flavor_text: "Original",
                language: {name: "en", url: "some_url"},
                version: {name: "red", url: "some_url"},
              },
            ],
            habitat: {name: "forest", url: "some_url"},
            is_legendary: false,
          })
          const translateTextFake = sinon.fake.returns("Translated")

          const logic = createPokemonLogic({
            pokeApiClient: mockApi,
            translateText: translateTextFake,
            cache: createCache(),
          })

          const pokemon = await logic.getTranslatedPokemonInfo("test")

          expect(
            translateTextFake.calledWith("Original", "shakespeare"),
            "using Yoda translation",
          ).to.be.true

          expect(pokemon).to.have.property("description", "Translated")
        })
      })

      context("translation fails", () => {
        it("should return the original description", async () => {
          const mockApi = createMockPokeApiClient({
            id: 0,
            name: "test",
            flavor_text_entries: [
              {
                flavor_text: "Original",
                language: {name: "en", url: "some_url"},
                version: {name: "red", url: "some_url"},
              },
            ],
            habitat: {name: "forest", url: "some_url"},
            is_legendary: false,
          })
          const translateTextFake = sinon.fake.throws(
            new Error("Unable to translate: intentional test failure"),
          )

          const logic = createPokemonLogic({
            pokeApiClient: mockApi,
            translateText: translateTextFake,
            cache: createCache(),
          })

          const pokemon = await logic.getTranslatedPokemonInfo("test")

          expect(pokemon).to.have.property("description", "Original")
        })
      })
    })
  })
})
