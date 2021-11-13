/**
 * Represents a Pokemon returned from our API.
 */
export interface PokemonResource {
  name: string
  description: string
  habitat: string | null
  isLegendary: boolean
}
