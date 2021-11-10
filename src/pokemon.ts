import {RequestHandler, Router} from "express"
import got from "got"

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

const POKE_API_BASE = "https://pokeapi.co/api/v2"

const GetPokemon: RequestHandler = async (req, res) => {
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
}

export function register(app: Router) {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  app.get("/pokemon/:pokemon_name", GetPokemon)
}
