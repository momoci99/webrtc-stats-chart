import React from "react"
import ReactDOM from "react-dom"
import "./style/reset.scss"
import "./style/layout.scss"
// import { createStore } from "redux"
import App from "./App"
import reportWebVitals from "./reportWebVitals"

import { Provider } from "react-redux"

import store from "./redux/store"

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("layout")
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
