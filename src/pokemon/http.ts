import {RequestHandler, Router} from "express"
import {getPokemonInfo} from "./logic"
import {PokemonResource} from "./types"

const GetAPokemon: RequestHandler<
  {pokemon_name: string},
  PokemonResource,
  void
> = async (req, res) => {
  const requestedPokemonName = req.params.pokemon_name

  const responseBody = await getPokemonInfo(requestedPokemonName)

  res.send(responseBody)
}

export function register(app: Router) {
  app.get("/pokemon/:pokemon_name", GetAPokemon)
}
