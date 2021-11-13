import {RequestHandler, Router} from "express"
import {getPokemonInfo, getTranslatedPokemonInfo} from "./logic"
import {PokemonResource} from "./types"

const GetAPokemon: RequestHandler<
  {pokemon_name: string},
  PokemonResource,
  void
> = async (req, res) => {
  const requestedPokemonName = req.params.pokemon_name

  const pokemon = await getPokemonInfo(requestedPokemonName)

  res.send(pokemon)
}

const GetATranslatedPokemon: RequestHandler<
  {pokemon_name: string},
  PokemonResource,
  void
> = async (req, res) => {
  const requestedPokemonName = req.params.pokemon_name

  const pokemon = await getTranslatedPokemonInfo(requestedPokemonName)

  res.send(pokemon)
}

export function register(app: Router) {
  app.get("/pokemon/:pokemon_name", GetAPokemon)
  app.get("/pokemon/translated/:pokemon_name", GetATranslatedPokemon)
}
