import React from "react"
// import store from "../redux/store"
import { connect } from "react-redux"

class Controls extends React.Component {
  render() {
    return (
      <menu>
        controls
        <button
          disabled={this.props.call !== "END"}
          onClick={this.props.callPeer}
        >
          CALL
        </button>
        <button
          disabled={this.props.call !== "PROGRESSING"}
          onClick={this.props.hangUp}
        >
          HANG UP
        </button>
        {/* bitrate  */}
        {/* framerate  */}
        {/* 기타 컨트롤러 들어갈 예정 */}
      </menu>
    )
  }
}
const mapStateToProps = (state) => ({
  call: state.call,
})

const mapDispatchToProps = (dispatch) => {
  return {
    callPeer: () => dispatch({ type: "CALL" }),
    hangUp: () => dispatch({ type: "HANGUP" }),
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Controls)
