import {RequestHandler, Router} from "express"
import {DefaultPokemonLogic} from "./logic"
import {PokemonResource} from "./types"

const GetAPokemon: RequestHandler<
  {pokemon_name: string},
  PokemonResource,
  void
> = async (req, res) => {
  const requestedPokemonName = req.params.pokemon_name
  try {
    const pokemon = await DefaultPokemonLogic.getPokemonInfo(
      requestedPokemonName,
    )

    if (pokemon == null) {
      res.status(404)
    }

    res.send(pokemon)
  } catch (error) {
    console.error(`Error getting a pokemon: ${requestedPokemonName}`, error)
    if (!res.headersSent) {
      res.status(500).send()
    }
  }
}

const GetATranslatedPokemon: RequestHandler<
  {pokemon_name: string},
  PokemonResource,
  void
> = async (req, res) => {
  const requestedPokemonName = req.params.pokemon_name
  try {
    const pokemon = await DefaultPokemonLogic.getTranslatedPokemonInfo(
      requestedPokemonName,
    )

    if (pokemon == null) {
      res.status(404)
    }

    res.send(pokemon)
  } catch (error) {
    console.error(
      `Error getting a translated pokemon: ${requestedPokemonName}`,
      error,
    )
    if (!res.headersSent) {
      res.status(500).send()
    }
  }
}

export function register(app: Router) {
  app.get("/pokemon/:pokemon_name", GetAPokemon)
  app.get("/pokemon/translated/:pokemon_name", GetATranslatedPokemon)
}
