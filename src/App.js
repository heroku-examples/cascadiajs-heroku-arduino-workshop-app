import React, { useState, useRef, Fragment, useEffect } from "react"
import cx from "classnames"
import useProperties from "./useArduinoProperties"

const App = ({ ws }) => {
  const { properties, setProperties, saveProperties } = useProperties({ ws })

  return (
    <div className="max-w-screen-md mx-auto">
      <div className="p-4 md:px-16 md:py-8 md:border md:border-gray-300 md:rounded md:shadow-lg md:mt-4 md:mx-4">
        {properties ? (
          <Properties
            properties={properties}
            setProperties={setProperties}
            saveProperties={saveProperties}
          />
        ) : (
          <h1 className="text-xl text-center">Loading...</h1>
        )}
      </div>
    </div>
  )
}

const Properties = ({ properties, setProperties, saveProperties }) => {
  return (
    <Fragment>
      <Messages properties={properties} />
      <Form
        properties={properties}
        setProperties={setProperties}
        saveProperties={saveProperties}
      />
    </Fragment>
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
    <div className="mb-8">
      <h2 className="text-xl font-medium mb-2">
        Receive messages from your device
      </h2>
      {pendingMessage ? (
        <div>
          <div className="border border-red-400 bg-red-200 text-red-800 rounded py-2 px-4 mb-2">
            {pendingMessage}
          </div>
          <h2 className="text-sm mb-1">
            Indicate that you've received the message by sending a sound to the
            device.
          </h2>
          <button
            className="border rounded p-2 bg-green-400 block w-full"
            onClick={(e) => {
              e.preventDefault()
              setPendingMessage("")
              saveProperties({ pendingMessage: 0 })
            }}
          >
            Message received!
          </button>
        </div>
      ) : (
        <div className="border border-green-400 bg-green-200 text-green-900 rounded-sm p-2">
          No new messages
        </div>
      )}
    </div>
  ) : (
    ""
  )
}

const Form = ({ properties, setProperties, saveProperties }) => {
  return (
    <div>
      <div className="mb-8">
        <h2 className="font-medium mb-2">Set your status</h2>
        <form>
          <div className="flex items-center mb-1">
            <input
              value="OnAir"
              checked={properties.status === "OnAir"}
              onChange={() => setProperties({ status: "OnAir" })}
              htmlFor="status-on-air"
              type="radio"
              name="status"
              className="appearance-none h-3 w-3 border border-gray-900 border-gray-400 rounded-full checked:bg-gray-900 focus:outline-none"
            />
            <label id="status-on-air" className="ml-1 block text-sm">
              On Air
            </label>
          </div>
          <div className="flex items-center mb-1">
            <input
              value="OffAir"
              checked={properties.status === "OffAir"}
              onChange={() => setProperties({ status: "OffAir" })}
              htmlFor="status-off-air"
              type="radio"
              name="status"
              className="appearance-none h-3 w-3 border border-gray-900 rounded-full checked:bg-gray-900 focus:outline-none"
            />
            <label id="status-off-air" className="ml-1 block text-sm">
              Off Air
            </label>
          </div>
        </form>
      </div>

      <div>
        <h2 className="font-medium">Configure the button messages</h2>
        <ButtonForm
          label="Button 1"
          name="button1"
          properties={properties}
          saveProperties={saveProperties}
        />
        <ButtonForm
          label="Button 2"
          name="button2"
          properties={properties}
          saveProperties={saveProperties}
        />
        <ButtonForm
          label="Button 3"
          name="button3"
          properties={properties}
          saveProperties={saveProperties}
        />
        <ButtonForm
          label="Button 4"
          name="button4"
          properties={properties}
          saveProperties={saveProperties}
        />
        <ButtonForm
          label="Button 5"
          name="button5"
          properties={properties}
          saveProperties={saveProperties}
        />
      </div>
    </div>
  )
}

const ButtonForm = ({ label, name, properties, saveProperties }) => {
  const [value, setValue] = useState(properties[name])
  const canSubmit = value && value !== properties[name]

  return (
    <form
      className="m-0"
      onSubmit={(e) => {
        e.preventDefault()
        saveProperties({ [name]: value })
      }}
    >
      <label className="block text-sm mt-4 mb-1 font-medium">{label}</label>
      <div className="flex">
        <input
          className="shadow-sm appearance-none border rounded focus:outline-none focus:shadow-outline px-2 py-1 text-sm"
          type="text"
          name={name}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
          }}
        />
        <input
          type="submit"
          value="Set"
          disabled={!canSubmit}
          className={cx(
            "ml-1 rounded px-4 py-1 text-sm",
            "bg-green-600 text-white cursor-pointer",
            "disabled:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        />
      </div>
    </form>
  )
}

export default App
