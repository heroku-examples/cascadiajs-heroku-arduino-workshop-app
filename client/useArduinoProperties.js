import { useState, useEffect } from "react"

const useArduinoProperties = ({ ws }) => {
  const [properties, _setProperties] = useState(null)

  const setProperties = (properties) =>
    _setProperties((s) => ({ ...s, ...properties }))

  const saveProperties = (newProperties) =>
    fetch("/api/properties", {
      method: "POST",
      body: JSON.stringify({
        properties: newProperties,
      }),
    })

  useEffect(() => {
    let interval = null

    fetch("/api/properties")
      .then((resp) => resp.json())
      .then((data) => setProperties(data.properties))
      .then(() => {
        ws.onmessage = (e) => {
          const { type, data } = JSON.parse(e.data)
          if (type === "update") {
            setProperties(data)
          }
        }

        interval = setInterval(() => {
          ws.send("ping")
        }, 25 * 1000)
      })

    return () => {
      ws.close()
      clearInterval(interval)
    }
  }, [])

  return { properties, setProperties, saveProperties }
}

export default useArduinoProperties
