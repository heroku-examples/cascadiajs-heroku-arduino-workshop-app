const { createElement: e, useEffect, useState, Fragment, useRef } = React

const wsUrl = `ws${window.location.href.match(/^http(s?:\/\/.*)\/.*$/)[1]}`
const ws = new WebSocket(wsUrl)

const App = () => {
  const [properties, setProperties] = useState(null)
  const mergeProperties = (properties) =>
    setProperties((s) => ({ ...s, ...properties }))

  useEffect(() => {
    let interval = null

    fetch("/api/properties")
      .then((resp) => resp.json())
      .then((data) => setProperties(data.properties))
      .then(() => {
        ws.onmessage = (e) => {
          const { type, data } = JSON.parse(e.data)
          if (type === "update") {
            mergeProperties(data)
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

  return e(
    "div",
    {},
    properties
      ? e(
          Fragment,
          null,
          e(Form, { properties, onChange: mergeProperties }),
          e(Messages, { properties })
        )
      : "Loading..."
  )
}

const Messages = ({ properties }) => {
  const pendingMessageRef = useRef()
  const [pendingMessage, setPendingMessage] = useState("")

  useEffect(() => {
    if (properties.pendingMessage === pendingMessageRef.current) {
      return
    }
    setPendingMessage(properties[`button${properties.pendingMessage}`] || "")
    pendingMessageRef.current = properties.pendingMessage
  }, [properties])

  return properties
    ? e(
        "div",
        null,
        e("h2", null, "Message"),
        pendingMessage
          ? e(
              "div",
              null,
              e("h3", null, pendingMessage),
              e(
                "button",
                {
                  onClick: (e) => {
                    e.preventDefault()
                    setPendingMessage("")
                    fetch("/api/properties", {
                      method: "POST",
                      body: JSON.stringify({
                        properties: { pendingMessage: 0 },
                      }),
                    })
                  },
                },
                "Clear Message"
              )
            )
          : "No message"
      )
    : ""
}

const Form = ({ properties, onChange }) => {
  return e(
    "div",
    null,
    e("h2", null, "Update status/buttons"),
    e(
      "form",
      {
        onSubmit: (e) => {
          e.preventDefault()
          fetch("/api/properties", {
            method: "POST",
            body: JSON.stringify({ properties }),
          })
        },
      },
      e(PropertyInput, {
        label: "Status",
        name: "status",
        properties,
        onChange,
      }),
      e(PropertyInput, {
        label: "Button 1",
        name: "button1",
        properties,
        onChange,
      }),
      e(PropertyInput, {
        label: "Button 2",
        name: "button2",
        properties,
        onChange,
      }),
      e(PropertyInput, {
        label: "Button 3",
        name: "button3",
        properties,
        onChange,
      }),
      e(PropertyInput, {
        label: "Button 4",
        name: "button4",
        properties,
        onChange,
      }),
      e(PropertyInput, {
        label: "Button 5",
        name: "button5",
        properties,
        onChange,
      }),
      e("input", { type: "submit", value: "Submit" })
    )
  )
}

const PropertyInput = ({ label, name, properties, onChange }) => {
  return e(
    Fragment,
    null,
    e("label", null, label),
    e("input", {
      type: "text",
      name,
      value: properties[name],
      onChange: (e) => {
        const value = e.target.value
        onChange({ [name]: value })
      },
    }),
    e("br")
  )
}

ReactDOM.render(e(App), document.getElementById("root"))
