import React, { useState, useRef, Fragment, useEffect } from "react"
import cx from "classnames"
import useProperties from "./useArduinoProperties"

const STATUSES = {
  off: "Off air",
  on: "On air",
}

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
      <Messages
        properties={properties}
        setProperties={setProperties}
        saveProperties={saveProperties}
      />
      <Form
        properties={properties}
        setProperties={setProperties}
        saveProperties={saveProperties}
      />
    </Fragment>
  )
}

const Messages = ({ properties, saveProperties }) => {
  const [pendingMessageId, setPendingMessageId] = useState(
    properties.pendingMessage
  )
  const pendingMessageRef = useRef(pendingMessageId)

  useEffect(() => {
    if (properties.pendingMessage !== pendingMessageRef.current) {
      setPendingMessageId(properties.pendingMessage)
      pendingMessageRef.current = properties.pendingMessage
    }
  }, [properties])

  const pendingMessage = properties[`button${pendingMessageId}`] || ""

  return properties ? (
    <div className="mb-8">
      <h2 className="text-lg font-medium mb-3">
        Receive messages from your device
      </h2>
      {pendingMessage ? (
        <div>
          <div className="flex flex-row justify-between border border-red-400 bg-red-200 text-red-800 rounded py-2 px-4 mb-2">
            <span>{pendingMessage}</span>
          </div>
          <h2 className="text-sm mb-1">
            Indicate that you've received the message by sending a sound to the
            device.
          </h2>
          <button
            className="border rounded p-2 bg-green-600 text-white block w-full"
            onClick={(e) => {
              e.preventDefault()
              setPendingMessageId(0)
              saveProperties({ pendingMessage: 0 })
            }}
          >
            Message received!
          </button>
        </div>
      ) : (
        <div className="border border-green-400 bg-green-200 text-green-900 rounded p-2">
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
        <h2 className="text-lg font-medium mb-3">Set your status</h2>
        <form>
          <div className="flex items-center mb-1">
            <input
              value={STATUSES.on}
              checked={properties.status === STATUSES.on}
              onChange={() => {
                setProperties({ status: STATUSES.on })
                saveProperties({ status: STATUSES.on })
              }}
              htmlFor="status-on-air"
              type="radio"
              name="status"
              className="appearance-none h-3 w-3 border border-gray-900 border-gray-400 rounded-full checked:bg-gray-900 focus:outline-none"
            />
            <label id="status-on-air" className="ml-1 block text-sm">
              On air
            </label>
          </div>
          <div className="flex items-center mb-1">
            <input
              value={STATUSES.off}
              checked={properties.status === STATUSES.off}
              onChange={() => {
                setProperties({ status: STATUSES.off })
                saveProperties({ status: STATUSES.off })
              }}
              htmlFor="status-off-air"
              type="radio"
              name="status"
              className="appearance-none h-3 w-3 border border-gray-900 rounded-full checked:bg-gray-900 focus:outline-none"
            />
            <label id="status-off-air" className="ml-1 block text-sm">
              Off air
            </label>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-3">
          Configure the button messages
        </h2>
        <ButtonForm
          label="Button 1"
          name="button1"
          placeholder="Lunch is ready"
          properties={properties}
          saveProperties={saveProperties}
          setProperties={setProperties}
        />
        <ButtonForm
          label="Button 2"
          name="button2"
          placeholder="I love you!"
          properties={properties}
          saveProperties={saveProperties}
          setProperties={setProperties}
        />
        <ButtonForm
          label="Button 3"
          name="button3"
          placeholder="See me when you're done"
          properties={properties}
          saveProperties={saveProperties}
          setProperties={setProperties}
        />
        <ButtonForm
          label="Button 4"
          name="button4"
          placeholder="Heading out"
          properties={properties}
          saveProperties={saveProperties}
          setProperties={setProperties}
        />
        <ButtonForm
          label="Button 5"
          name="button5"
          placeholder="Hi!"
          properties={properties}
          saveProperties={saveProperties}
          setProperties={setProperties}
        />
      </div>
    </div>
  )
}

const ButtonForm = ({
  label,
  name,
  placeholder,
  properties,
  saveProperties,
  setProperties,
}) => {
  const [value, setValue] = useState(properties[name])
  const canSubmit = value && value !== properties[name]

  return (
    <form
      className="m-0"
      onSubmit={(e) => {
        e.preventDefault()
        setProperties({ [name]: value })
        saveProperties({ [name]: value })
      }}
    >
      <label className="block text-sm mt-2 mb-1 font-medium">{label}</label>
      <div className="flex w-full md:w-auto">
        <input
          className="shadow-sm appearance-none border rounded focus:outline-none focus:shadow-outline px-2 py-1 text-sm flex-grow md:flex-grow-0 md:w-1/2"
          type="text"
          name={name}
          value={value}
          placeholder={placeholder}
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
