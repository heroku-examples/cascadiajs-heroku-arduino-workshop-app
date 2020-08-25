require("dotenv").config()

const micro = require("micro")
const { createError, json } = micro
const handler = require("serve-handler")
const axios = require("axios")
const { router, get, post } = require("microrouter")
const IotApi = require("@arduino/arduino-iot-client")
const { ArduinoIoTCloud } = require("arduino-iot-js")
const WebSocket = require("ws")

const getToken = async () => {
  const resp = await axios.post(
    "https://api2.arduino.cc/iot/v1/clients/token",
    {
      grant_type: "client_credentials",
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      audience: "https://api2.arduino.cc/iot",
    }
  )
  IotApi.ApiClient.instance.authentications.oauth2.accessToken =
    resp.data.access_token
  console.log("Received access token")
}

const connectIoT = async () => {
  await ArduinoIoTCloud.connect({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    onDisconnect: (message) => console.error("IoT Disconnect", message),
  })
  console.log("IoT connected")
}

const getThing = async ({ retry = false } = {}) => {
  const devicesApi = new IotApi.DevicesV2Api(IotApi.ApiClient.instance)
  const thingsApi = new IotApi.ThingsV2Api(IotApi.ApiClient.instance)

  try {
    const device = await devicesApi
      .devicesV2List()
      .then(
        (devices) =>
          devices &&
          devices
            .sort((a, b) => b.last_activity_at - a.last_activity_at)
            .find((d) => d.type === "mkrwifi1010")
      )

    if (!device) {
      throw createError(500, "No compatible Device could be found")
    }

    const thing = await thingsApi
      .thingsV2List({
        deviceId: device.id,
        showProperties: true,
      })
      .then(
        (things) =>
          things && things.sort((a, b) => b.updated_at - a.updated_at)[0]
      )

    if (!thing) {
      throw createError(500, "No compatible Thing could be found")
    }

    return thing
  } catch (e) {
    if (
      !retry &&
      e.status === 401 &&
      e.body &&
      e.body.code === "unauthorized"
    ) {
      await getToken()
      return await getThing({ retry: true })
    }
    throw e
  }
}

const setProperties = async (req) => {
  const data = await json(req)
  const thing = await getThing()

  const properties = thing.properties.reduce((acc, property) => {
    acc[property.variable_name] = property.last_value
    return acc
  }, {})

  await Promise.all(
    Object.entries(data.properties).map(([name, value]) => {
      const current = properties[name]
      if (value !== current) {
        ArduinoIoTCloud.sendProperty(thing.id, name, value)
      }
    })
  )

  return getProperties()
}

const getProperties = async () => {
  const thing = await getThing()
  return {
    properties: thing.properties.reduce((acc, property) => {
      acc[property.variable_name] = property.last_value
      return acc
    }, {}),
  }
}

const main = async () => {
  await Promise.all([connectIoT(), getToken()])

  const thing = await getThing()
  console.log(`Found thing: ${thing.id}`)

  if (!thing.properties) {
    throw new Error("Thing has no properties. Those must be created first.")
  }

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

  const wsSend = (data) => {
    wsServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data))
      }
    })
  }

  await Promise.all(
    thing.properties.map(async (property) => {
      await ArduinoIoTCloud.onPropertyValue(
        thing.id,
        property.variable_name,
        (value) => {
          const data = { [property.variable_name]: value }
          console.log(`Updated property: ${JSON.stringify(data)}}`)
          wsSend({
            type: "update",
            data,
          })
        }
      )
      console.log(`Callback registered for ${property.variable_name}`)
    })
  )

  wsServer.on("connection", (ws) => {
    ws.on("message", (message) => {
      if (message === "ping") {
        ws.send(JSON.stringify({ type: "pong" }))
      }
    })
  })

  server.listen(process.env.PORT || 3001)
}

main()
  .then(() => {
    console.log("Server ready")
  })
  .catch((e) => {
    console.error("Server not started due to error")
    console.error(e)
  })
