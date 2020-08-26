import { useState, useEffect } from "react"

const useArduinoProperties = ({ ws }) => {
  const [properties, _setProperties] = useState(null)
  const [updating, setUpdating] = useState(false)

  const setProperties = (properties) =>
    _setProperties((s) => ({ ...s, ...properties }))

  const saveProperties = (newProperties) => {
    setUpdating(true)
    fetch("/api/properties", {
      method: "POST",
      body: JSON.stringify({
        properties: newProperties,
      }),
    }).then(() => {
      setUpdating(false)
      console.log("save complete")
    })
  }

  useEffect(() => {
    let interval = null

    setUpdating(true)
    fetch("/api/properties")
      .then((resp) => resp.json())
      .then((data) => setProperties(data.properties))
      .then(() => {
        ws.onmessage = (e) => {
          const { type, data } = JSON.parse(e.data)
          if (type === "update") {
            console.log("ws update")
            setProperties(data)
          }
        }

        interval = setInterval(() => {
          ws.send("ping")
        }, 25 * 1000)
        setUpdating(false)
      })

    return () => {
      ws.close()
      clearInterval(interval)
    }
  }, [])

  return { properties, setProperties, saveProperties }
}

export default useArduinoProperties
