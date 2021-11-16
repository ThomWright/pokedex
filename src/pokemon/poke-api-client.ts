import got, {Response} from "got"

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

export async function getPokemonSpecies(
  pokemonNameOrId: string | number,
): Promise<PokemonSpeciesResponseBody | undefined> {
  // See: https://github.com/sindresorhus/got/issues/1540
  // for why we can't use `got.get(...).json()` along with
  // `throwHttpErrors`.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const response = (await got.get(
    `${POKE_API_BASE}/pokemon-species/${pokemonNameOrId}`,
    {
      throwHttpErrors: false,
      responseType: "json",
    },
  )) as Response<PokemonSpeciesResponseBody>

  if (response.statusCode === 200) {
    return response.body
  }

  if (response.statusCode === 404) {
    return undefined
  }

  throw new Error(
    `Unexpected status code from the PokeAPI: ${response.statusCode} ${
      response.statusMessage ?? ""
    }`,
  )
}
