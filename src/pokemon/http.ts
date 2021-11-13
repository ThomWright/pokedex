import {RequestHandler, Router} from "express"
import {getPokemonInfo, getTranslatedPokemonInfo} from "./logic"
import {PokemonResource} from "./types"

const GetAPokemon: RequestHandler<
  {pokemon_name: string},
  PokemonResource,
  void
> = async (req, res) => {
  try {
    const requestedPokemonName = req.params.pokemon_name

    const pokemon = await getPokemonInfo(requestedPokemonName)

    res.send(pokemon)
  } catch (error) {
    console.error("Error getting a pokemon", error)
    res.status(500).send()
  }
}

const GetATranslatedPokemon: RequestHandler<
  {pokemon_name: string},
  PokemonResource,
  void
> = async (req, res) => {
  try {
    const requestedPokemonName = req.params.pokemon_name

    const pokemon = await getTranslatedPokemonInfo(requestedPokemonName)

    res.send(pokemon)
  } catch (error) {
    console.error("Error getting a translated pokemon", error)
    res.status(500).send()
  }
}

export function register(app: Router) {
  app.get("/pokemon/:pokemon_name", GetAPokemon)
  app.get("/pokemon/translated/:pokemon_name", GetATranslatedPokemon)
}
