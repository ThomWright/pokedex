import * as express from "express"

const app = express()
const port = 3000

app.get("/pokemon/:pokemon_name", (req, res) => {
  res.send(`Hello ${req.params.pokemon_name}`)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
