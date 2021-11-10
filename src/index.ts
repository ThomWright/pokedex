import * as express from "express"
import {register as registerPokemonRoutes} from "./pokemon"

const app = express()
const port = 3000

app.get("/health/live", (req, res) => {
  res.status(200).send()
})

registerPokemonRoutes(app)

app.listen(port, () => {
  console.log(`Pokedex app listening at http://localhost:${port}`)
})
