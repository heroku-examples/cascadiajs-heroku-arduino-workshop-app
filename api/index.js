require("dotenv").config()

const micro = require("micro")
const handler = require("serve-handler")
const { router, get, post } = require("microrouter")
const WebSocket = require("ws")

const {
  setProperties,
  getProperties,
  init,
  onPropertyUpdate,
} = require("./arduino")

const { PORT = 3001 } = process.env

const main = async () => {
  await init()
  console.log("Successfully connected to Arduino")

  const thing = await getProperties()
  const properties = Object.entries(thing.properties)
  console.log(`Thing: ${thing.id}`)
  console.log(
    `Properties:\n${properties.map(([k, v]) => `${k}:${v}`).join("\n")}`
  )

  const server = micro(
    router(
      post("/api/properties", setProperties),
      get("/api/properties", getProperties),
      get("/*", (req, res) =>
        handler(req, res, {
          public: "client",
        })
      )
    )
  )

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

  server.listen(PORT)
}

main()
  .then(() => {
    console.log(`Server ready: https://localhost:${PORT}`)
  })
  .catch((e) => {
    console.error("Server not started due to error")
    console.error(e)
  })
