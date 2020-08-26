import React from "react"
import ReactDOM from "react-dom"
import App from "./App"
import { wsUrl } from "./config"
import "./tailwind.css"

const ws = new WebSocket(wsUrl)

ReactDOM.render(<App ws={ws} />, document.getElementById("root"))
