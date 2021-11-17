/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {expect} from "chai"
import * as sinon from "sinon"
import {createPokemonLogic} from "../logic"
import {PokeApiClient, PokemonSpeciesResponseBody} from "../poke-api-client"

function createMockPokeApiClient(
  returns: PokemonSpeciesResponseBody | undefined | Error,
): PokeApiClient {
  return {
    getPokemonSpecies:
      returns instanceof Error
        ? sinon.fake.throws(returns)
        : sinon.fake.resolves(returns),
    // async getPokemonSpecies() {
    //   if (returns instanceof Error) {
    //     throw returns
    //   }
    //   return returns
    // },
  }
}

describe("Pokemon logic", () => {
  describe("getTranslatedPokemonInfo", () => {
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
        const translateTextFake = sinon.fake.throws(new Error("oh no"))

        const logic = createPokemonLogic({
          pokeApiClient: mockApi,
          translateText: translateTextFake,
        })

        const pokemon = await logic.getTranslatedPokemonInfo("test")

        expect(pokemon).to.have.property("description", "Original")
      })
    })
  })
})
