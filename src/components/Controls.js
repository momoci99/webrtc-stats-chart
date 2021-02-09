import React from "react"
import store from "../redux/store"

class Controls extends React.Component {
  call = () => {
    store.dispatch({ type: "CALL" })
    console.log(store.getState())
  }
  hangUp = () => {
    store.dispatch({ type: "HANGUP" })
    console.log(store.getState())
  }

  render() {
    return (
      <menu>
        controls
        <button onClick={this.call}>CALL</button>
        <button onClick={this.hangUp}>HANG UP</button>
        {/* bitrate  */}
        {/* framerate  */}
        {/* 기타 컨트롤러 들어갈 예정 */}
      </menu>
    )
  }
}

export default Controls
