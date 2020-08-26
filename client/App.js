import React, { useState, useRef, Fragment, useEffect } from "react"
import useProperties from "./useArduinoProperties"

const App = ({ ws }) => {
  const { properties, setProperties, saveProperties } = useProperties({ ws })

  return (
    <div>
      {properties ? (
        <Fragment>
          <Form
            properties={properties}
            onChange={setProperties}
            onSubmit={saveProperties}
          />
          <Messages properties={properties} />
        </Fragment>
      ) : (
        "Loading..."
      )}
    </div>
  )
}

const Messages = ({ properties, saveProperties }) => {
  const pendingMessageRef = useRef()
  const [pendingMessage, setPendingMessage] = useState("")

  useEffect(() => {
    if (properties.pendingMessage !== pendingMessageRef.current) {
      setPendingMessage(properties[`button${properties.pendingMessage}`] || "")
      pendingMessageRef.current = properties.pendingMessage
    }
  }, [properties])

  return properties ? (
    <div>
      <h2>Message</h2>
      {pendingMessage ? (
        <div>
          <h3>{pendingMessage}</h3>
          <button
            onClick={(e) => {
              e.preventDefault()
              setPendingMessage("")
              saveProperties({ pendingMessage: 0 })
            }}
          >
            Clear Message
          </button>
        </div>
      ) : (
        "No message"
      )}
    </div>
  ) : (
    ""
  )
}

const Form = ({ properties, onChange, saveProperties }) => {
  return (
    <div>
      <h2>Update status/buttons</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          saveProperties(properties)
        }}
      >
        <PropertyInput
          label="Status"
          name="status"
          properties={properties}
          onChange={onChange}
        />
        <PropertyInput
          label="Button 1"
          name="button1"
          properties={properties}
          onChange={onChange}
        />
        <PropertyInput
          label="Button 2"
          name="button2"
          properties={properties}
          onChange={onChange}
        />
        <PropertyInput
          label="Button 3"
          name="button3"
          properties={properties}
          onChange={onChange}
        />
        <PropertyInput
          label="Button 4"
          name="button4"
          properties={properties}
          onChange={onChange}
        />
        <PropertyInput
          label="Button 5"
          name="button5"
          properties={properties}
          onChange={onChange}
        />
        <input type="submit" value="Submit" />
      </form>
    </div>
  )
}

const PropertyInput = ({ label, name, properties, onChange }) => {
  return (
    <Fragment>
      <label>{label}</label>
      <input
        type="text"
        name={name}
        value={properties[name]}
        onChange={(e) => {
          const value = e.target.value
          onChange({ [name]: value })
        }}
      />
      <br />
    </Fragment>
  )
}

export default App
