import {Cache, createCache} from "../cache"
import {Language, translateText} from "../translation-api-client"
import {PokeApiClient, PokemonSpeciesResponseBody} from "./poke-api-client"
import {PokemonResource} from "./types"

export interface PokemonLogic {
  getPokemonInfo(pokemonName: string): Promise<PokemonResource | undefined>

  getTranslatedPokemonInfo(
    pokemonName: string,
  ): Promise<PokemonResource | undefined>
}

const GlobalPokemonCache = createCache<PokemonSpeciesResponseBody>()
const GlobalTranslationCache = createCache<string>()

/**
 * A singleton with global caches, for convenience.
 */
export const DefaultPokemonLogic = createPokemonLogic({
  pokeApiClient: PokeApiClient,
  pokemonCache: GlobalPokemonCache,
  translateText,
  translationCache: GlobalTranslationCache,
})

export function createPokemonLogic({
  pokeApiClient,
  pokemonCache,
  translateText,
  translationCache,
}: {
  pokeApiClient: PokeApiClient
  pokemonCache: Cache<PokemonSpeciesResponseBody | undefined>
  translateText: (text: string, language: Language) => Promise<string>
  translationCache: Cache<string>
}): PokemonLogic {
  async function getPokemonInfo(
    pokemonName: string,
  ): Promise<PokemonResource | undefined> {
    const pokemonResponse =
      pokemonCache.get(pokemonName) ||
      (await pokeApiClient.getPokemonSpecies(pokemonName))

    // Deliberately cache empty responses, since those are 404s
    pokemonCache.set(pokemonName, pokemonResponse)

    if (pokemonResponse == null) {
      return undefined
    }

    const flavourTextEntry = pokemonResponse.flavor_text_entries.find(
      (entry) => entry.language.name === "en",
    )

    if (flavourTextEntry == null) {
      // TODO: handle this better
      throw new Error("No English flavor text found")
    }

    const description = onSingleLine(flavourTextEntry.flavor_text)

    return {
      name: pokemonResponse.name,
      description,
      habitat: pokemonResponse.habitat?.name ?? null,
      isLegendary: pokemonResponse.is_legendary,
    }
  }

  async function getTranslatedPokemonInfo(
    pokemonName: string,
  ): Promise<PokemonResource | undefined> {
    const pokemon = await getPokemonInfo(pokemonName)

    if (pokemon == null) {
      return undefined
    }

    const language: Language =
      pokemon.habitat === "cave" || pokemon.isLegendary ? "yoda" : "shakespeare"

    try {
      const translatedText =
        translationCache.get(pokemon.description) ||
        (await translateText(pokemon.description, language))
      translationCache.set(pokemon.description, translatedText)

      return {
        ...pokemon,
        description: translatedText,
      }
    } catch (error) {
      console.error("Unable to translate", error)
      // Return original description if we were unable to translate the text
      return pokemon
    }
  }

  return {
    getPokemonInfo,
    getTranslatedPokemonInfo,
  }
}

/**
 * Replaces any "newline" characters with a single space.
 *
 * It seems some text coming from the PokeAPI includes "new line", including:
 * - Line Feed (U+000A) (\n)
 * - Form Feed (U+000C) (\f)
 *
 * Weird!
 *
 * Carriage return (U+000D) (\r) has also been included here, for completeness, in case Windows-style
 * new lines ever appear.
 */
export function onSingleLine(string: string): string {
  return (
    string
      // eslint-disable-next-line no-control-regex
      .replace(/[\f\r\n]+/g, " ")
  )
}
