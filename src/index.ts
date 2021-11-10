import * as express from "express"

const app = express()
const port = 3000

app.get("/health/live", (req, res) => {
  res.status(200).send()
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.get("/pokemon/:pokemon_name", async (req, res) => {
  res.send({
    name: "not mewtwo",
  })
})

app.listen(port, () => {
  console.log(`Pokedex app listening at http://localhost:${port}`)
})
