import React from "react"
import ReactDOM from "react-dom"
import App from "./App"
import "./tailwind.css"

const wsUrl = `ws${window.location.href.match(/^http(s?:\/\/.*)\/.*$/)[1]}`
const ws = new WebSocket(wsUrl)

ReactDOM.render(<App ws={ws} />, document.getElementById("root"))
