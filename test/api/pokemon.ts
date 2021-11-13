import {expect} from "chai"
import got from "got"
import {EXPOSED_PORT} from "./setup"

describe("GET /pokemon/:pokemon_name", () => {
  it("should return basic pokemon information", async () => {
    const testPokemon = "mewtwo"
    const responseBody = await got
      .get(`http://localhost:${EXPOSED_PORT}/pokemon/${testPokemon}`)
      .json()

    expect(responseBody, "response body").to.have.property("name", testPokemon)
    expect(responseBody, "response body").to.have.property(
      "description",
      "It was created by a scientist after years of horrific gene splicing and DNA engineering experiments.",
    )
    expect(responseBody, "response body").to.have.property("habitat", "rare")
    expect(responseBody, "response body").to.have.property("isLegendary", true)
  })
})

describe("GET /pokemon/translated/:pokemon_name", () => {
  it("should return basic pokemon information with a translated description", async () => {
    const testPokemon = "mewtwo"
    const responseBody = await got
      .get(`http://localhost:${EXPOSED_PORT}/pokemon/translated/${testPokemon}`)
      .json()

    expect(responseBody, "response body").to.have.property("name", testPokemon)
    expect(responseBody, "response body").to.have.property(
      "description",
      // Why are there two spaces after punctuation? Whhhyyy?
      "Created by a scientist after years of horrific gene splicing and dna engineering experiments,  it was.",
    )
    expect(responseBody, "response body").to.have.property("habitat", "rare")
    expect(responseBody, "response body").to.have.property("isLegendary", true)
  })
})
