import {expect} from "chai"
import got from "got"
import {EXPOSED_PORT} from "./setup"

describe("GET /pokemon/:pokemon_name", () => {
  it("should return basic pokemon information", async () => {
    const testPokemon = "mewtwo"
    const responseBody = await got
      .get(`http://localhost:${EXPOSED_PORT}/pokemon/${testPokemon}`)
      .json()

    expect(responseBody).to.have.property("name", testPokemon)
    expect(responseBody).to.have.property("description")
    expect(responseBody).to.have.property("habitat")
    expect(responseBody).to.have.property("isLegendary")
  })
})
