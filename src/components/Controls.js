import React from "react"
import { connect } from "react-redux"

import "../style/controls.scss"

import CallIcon from "@material-ui/icons/Call"
import CallEndIcon from "@material-ui/icons/CallEnd"
class Controls extends React.Component {
  render() {
    return (
      <menu>
        <button
          className={`control__call start ${
            this.props.call !== "END" ? "disabled" : ""
          }`}
          disabled={this.props.call !== "END"}
          onClick={this.props.callPeer}
        >
          <CallIcon fontSize="large"></CallIcon>
        </button>
        <button
          className={`
            control__call hangup ${
              this.props.call !== "PROGRESSING" ? "disabled" : ""
            }
          `}
          disabled={this.props.call !== "PROGRESSING"}
          onClick={this.props.hangUp}
        >
          <CallEndIcon fontSize="large"></CallEndIcon>
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
