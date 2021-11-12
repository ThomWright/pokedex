import got from "got"
import {PokemonResource} from "./types"

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

const POKE_API_BASE = "https://pokeapi.co/api/v2"

export async function getPokemonInfo(
  pokemonName: string,
): Promise<PokemonResource> {
  const pokemonResponse: PokemonSpeciesResponseBody = await got
    .get(POKE_API_BASE + "/pokemon-species/" + pokemonName, {
      throwHttpErrors: true,
    })
    .json()

  const flavourTextEntry = pokemonResponse.flavor_text_entries.find(
    (entry) => entry.language.name === "en",
  )
  const description =
    flavourTextEntry != null ? onSingleLine(flavourTextEntry.flavor_text) : null

  return {
    name: pokemonResponse.name,
    description,
    habitat: pokemonResponse.habitat?.name ?? null,
    isLegendary: pokemonResponse.is_legendary,
  }
}

/**
 * Replaces any "newline" characters with a single space.
 *
 * It seems some text coming from the PokeAPI includes strange control characters, including:
 * - Line Feed (U+000A)
 * - Form Feed (U+000C)
 *
 * Weird!
 *
 * Carriage return (U+000D) has also been included here, for completeness, in case Windows-style
 * new lines ever appear.
 */
export function onSingleLine(string: string): string {
  return (
    string
      // eslint-disable-next-line no-control-regex
      .replace(/[\f\r\n]+/g, " ")
  )
}
