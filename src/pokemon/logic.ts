import {Language, translateText} from "../translation-api-client"
import {getPokemonSpecies} from "./poke-api-client"
import {PokemonResource} from "./types"

export async function getPokemonInfo(
  pokemonName: string,
): Promise<PokemonResource> {
  const pokemonResponse = await getPokemonSpecies(pokemonName)

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

export async function getTranslatedPokemonInfo(
  pokemonName: string,
): Promise<PokemonResource> {
  const pokemon = await getPokemonInfo(pokemonName)

  const language: Language =
    pokemon.habitat === "cave" || pokemon.isLegendary ? "yoda" : "shakespeare"

  try {
    const translatedText = await translateText(pokemon.description, language)
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
