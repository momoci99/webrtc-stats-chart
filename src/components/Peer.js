import React from "react"
import "../style/peer.scss"

class Peer extends React.Component {
  constructor(props) {
    super(props)
    this.videoRef = React.createRef()
  }

  componentDidMount() {
    this.updateVideoStream()
  }

  componentDidUpdate() {
    this.updateVideoStream()
  }

  updateVideoStream() {
    if (this.videoRef.current.srcObject !== this.props.stream) {
      this.videoRef.current.srcObject = this.props.stream
    }
  }

  render() {
    return (
      <video
        className="peer"
        ref={this.videoRef}
        src={this.props.stream}
        playsInline
        autoPlay
        muted={this.props.isMuted}
      ></video>
    )
  }
}
export default Peer
