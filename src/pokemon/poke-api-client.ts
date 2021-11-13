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

const POKE_API_BASE = "https://pokeapi.co/api/v2"

export function getPokemonSpecies(
  pokemonNameOrId: string | number,
): Promise<PokemonSpeciesResponseBody> {
  return got
    .get(`${POKE_API_BASE}/pokemon-species/${pokemonNameOrId}`, {
      throwHttpErrors: true,
    })
    .json()
}
