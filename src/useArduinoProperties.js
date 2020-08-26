import { useState, useEffect } from "react"
import axios from "axios"
import { apiUrl } from "./config"

const useArduinoProperties = ({ ws }) => {
  const [properties, _setProperties] = useState(null)
  const [isUpdating, setUpdating] = useState(false)
  const [error, setError] = useState(null)

  const setProperties = (properties) =>
    _setProperties((s) => ({ ...s, ...properties }))

  const saveProperties = (newProperties) => {
    setUpdating(true)
    setError(null)

    axios
      .post(`${apiUrl}api/properties`, {
        properties: newProperties,
      })
      .then(() => {
        setUpdating(false)
        setError(null)
      })
      .catch((e) => setError(e))
  }

  useEffect(() => {
    let interval = null

    setUpdating(true)
    setError(null)

    axios
      .get(`${apiUrl}api/properties`)
      .then((resp) => {
        setUpdating(false)
        setError(null)
        setProperties(resp.data.properties)
      })
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
      .catch((e) => setError(e))

    return () => {
      ws.close()
      clearInterval(interval)
    }
  }, [ws])

  return { properties, error, isUpdating, setProperties, saveProperties }
}

export default useArduinoProperties
