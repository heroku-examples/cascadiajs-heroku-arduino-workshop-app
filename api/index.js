require("dotenv").config()

const express = require("express")
const cors = require("cors")
const WebSocket = require("ws")
const http = require("http")
const bodyParser = require("body-parser")
const {
  setProperties,
  getProperties,
  init,
  onPropertyUpdate,
} = require("./arduino")

const { PORT = 3001, NODE_ENV } = process.env
const PRODUCTION = NODE_ENV === "production"

const main = async () => {
  await init()
  console.log("Successfully connected to Arduino")

  const thing = await getProperties()
  const properties = Object.entries(thing.properties)
  console.log(`Thing: ${thing.id}`)
  console.log(
    `Properties:\n${properties.map(([k, v]) => `${k}:${v}`).join("\n")}`
  )

  const app = express()
  const server = http.createServer(app)

  app.use(cors())

  app.get("/api/properties", async (req, res) => {
    res.json(await getProperties())
  })

  app.post("/api/properties", bodyParser.json(), async (req, res) => {
    await setProperties(req.body)
    res.json({})
  })

  if (PRODUCTION) {
    app.use(express.static("build"))
  }

  const wsServer = new WebSocket.Server({ server })

  wsServer.on("connection", (ws) => {
    ws.on("message", (message) => {
      if (message === "ping") {
        ws.send(JSON.stringify({ type: "pong" }))
      }
    })
  })

  await Promise.all(
    properties.map(async ([property]) => {
      await onPropertyUpdate(thing.id, property, (data) => {
        console.log(`Updated property: ${JSON.stringify(data)}}`)

        wsServer.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "update",
                data,
              })
            )
          }
        })
      })

      console.log(`Callback registered for ${property}`)
    })
  )

  return new Promise((resolve) => server.listen(PORT, resolve))
}

main()
  .then(() => {
    console.log(`Server ready: http://localhost:${PORT}`)
  })
  .catch((e) => {
    console.error(`Server not started due to error: ${e}`)
  })
