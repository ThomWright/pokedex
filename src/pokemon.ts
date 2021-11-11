import {RequestHandler, Router} from "express"
import got from "got"

/**
 * References a named resource.
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

const GetPokemon: RequestHandler<
  {pokemon_name: string},
  PokemonResource,
  void
> = async (req, res) => {
  const requestedPokemonName = req.params.pokemon_name

  const pokemonResponse: PokemonSpeciesResponseBody = await got
    .get(POKE_API_BASE + "/pokemon-species/" + requestedPokemonName, {
      throwHttpErrors: true,
    })
    .json()

  const flavourTextEntry = pokemonResponse.flavor_text_entries.find(
    (entry) => entry.language.name === "en",
  )
  const description =
    flavourTextEntry != null
      ? replaceControlCharacters(flavourTextEntry.flavor_text)
      : null

  const responseBody: PokemonResource = {
    name: pokemonResponse.name,
    description,
    habitat: pokemonResponse.habitat?.name ?? null,
    isLegendary: pokemonResponse.is_legendary,
  }

  res.send(responseBody)
}

/**
 * Replaces any control characters with a single space.
 *
 * It seems some text coming from the PokeAPI includes strange control characters, including:
 * - Line Feed (U+000A)
 * - Form Feed (U+000C)
 *
 * Weird!
 */
export function replaceControlCharacters(string: string): string {
  return (
    string
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u001F\u007F-\u009F]+/g, " ")
  )
}

export function register(app: Router) {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  app.get("/pokemon/:pokemon_name", GetPokemon)
}
