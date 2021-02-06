import React from "react"

class Controls extends React.Component {
  render() {
    return (
      <menu>
        controls
        <button disabled={this.state.callBtn} onClick={this.call}>
          CALL
        </button>
        <button disabled={this.state.hangBtn} onClick={this.hangUp}>
          HANG UP
        </button>
        {/* bitrate  */}
        {/* framerate  */}
        {/* 기타 컨트롤러 들어갈 예정 */}
      </menu>
    )
  }
}

export default Controls
