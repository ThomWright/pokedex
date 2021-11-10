import * as express from "express"
import got from "got"

const app = express()
const port = 3000

const POKE_API_BASE = "https://pokeapi.co/api/v2"

app.get("/health/live", (req, res) => {
  res.status(200).send()
})

/**
 * References another resource.
 *
 * @see https://pokeapi.co/docs/v2#namedapiresource
 */
interface NamedApiResource {
  name: string
  url: string
}

/**
 * Not the full body, but the parts we care about.
 *
 * @see https://pokeapi.co/docs/v2#pokemon-species
 */
interface PokemonSpeciesResponseBody {
  id: number
  name: string
  is_legendary: boolean
  habitat: NamedApiResource | null
  flavor_text_entries: Array<{
    flavor_text: string
    language: NamedApiResource
    version: NamedApiResource
  }>
}

/**
 * Represents a Pokemon returned from our API.
 */
interface PokemonResource {
  name: string
  description: string | null
  habitat: string | null
  isLegendary: boolean
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.get("/pokemon/:pokemon_name", async (req, res) => {
  const requestedPokemonName = req.params.pokemon_name

  const pokemonResponse: PokemonSpeciesResponseBody = await got
    .get(POKE_API_BASE + "/pokemon-species/" + requestedPokemonName, {
      throwHttpErrors: true,
    })
    .json()

  // Get the first flavor text in English, from any version.
  // Assume this works as a "description".
  const description = pokemonResponse.flavor_text_entries.find(
    (entry) => entry.language.name === "en",
  )

  const responseBody: PokemonResource = {
    name: pokemonResponse.name,
    description: description?.flavor_text ?? null,
    habitat: pokemonResponse.habitat?.name ?? null,
    isLegendary: pokemonResponse.is_legendary,
  }

  res.send(responseBody)
})

app.listen(port, () => {
  console.log(`Pokedex app listening at http://localhost:${port}`)
})
