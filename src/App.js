import "./style/app.scss"

import React from "react"

import Peer from "./components/Peer"
import Controls from "./components/Controls"

import { connect } from "react-redux"

import Input from "@material-ui/core/Input"

import {
  createPeerConnection,
  onAddIceCandidateSuccess,
  onAddIceCandidateError,
  resetPeerCallBack,
} from "./utils/Connection"

let connection = null

const mediaConstraints = {
  audio: true,
  video: {
    aspectRatio: {
      ideal: 1.333333, // 3:2 aspect is preferred
    },
  },
}

let clientID = 0

class App extends React.Component {
  constructor(props) {
    super(props)

    this.offerOptions = {
      offerToReceiveAudio: 0,
      offerToReceiveVideo: 1,
    }

    this.state = {
      localStream: null,
      remoteStream: null,
      pc1: null,
      pc2: null,
      targetName: "",
      myName: "",
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.props.call === "PROGRESSING" && prevProps.call === "END") {
      this.call()
    } else if (this.props.call === "END" && prevProps.call === "PROGRESSING") {
      this.hangUp()
    }
  }

  call = () => {
    this.connect()
    const peer = this.createPeerConnection()
    this.setState({
      pc1: peer,
    })
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
        frameRate: {
          max: 30,
        },
      })
      .then((localStream) => {
        this.state.pc1.addStream(localStream)
      })
      .catch((e) => console.error(e))
  }

  hangUp = () => {
    console.log("Ending call")

    if (this.state.pc1) {
      if (this.state.remoteStream) {
        this.state.remoteStream.getTracks().forEach((track) => track.stop())
        this.setState({
          remoteStream: null,
        })
      }
      if (this.state.localStream) {
        this.state.localStream.getTracks().forEach((track) => track.stop())
        this.setState({
          localStream: null,
        })
      }
      this.state.pc1.close()
      this.setState({ pc1: null })
    }

    this.setState({
      targetName: "",
    })

    this.setState({
      hangBtn: false,
      callBtn: false,
    })
  }

  onIceCandidate = (event) => {
    this.getOtherPc(this)
      .addIceCandidate(event.candidate)
      .then(onAddIceCandidateSuccess)
      .catch(onAddIceCandidateError)

    console.log(
      `${this.getName(this)} ICE candidate:\n${
        event.candidate ? event.candidate.candidate : "(null)"
      }`
    )
  }

  gotRemoteStream = (e) => {
    if (this.state.remoteStream !== e.streams[0]) {
      this.setState({ remoteStream: e.streams[0] })
      console.log("Received remote stream")
    }
  }

  //자신의 peer connection 객체 생성
  createPeerConnection = () => {
    const myPeerConnection = createPeerConnection()
    this.setCallBack()

    return myPeerConnection
  }

  //peer connection 이벤트 콜백 함수 설정
  setCallBack = (myPeerConnection) => {
    myPeerConnection.onicecandidate = this.handleICECandidateEvent
    myPeerConnection.ontrack = this.handleTrackEvent
    myPeerConnection.onnegotiationneeded = this.handleNegotiationNeededEvent
    myPeerConnection.onremovetrack = this.handleRemoveTrackEvent
    myPeerConnection.oniceconnectionstatechange =
      this.handleICEConnectionStateChangeEvent
    myPeerConnection.onicegatheringstatechange =
      this.handleICEGatheringStateChangeEvent
    myPeerConnection.onsignalingstatechange =
      this.handleSignalingStateChangeEvent
  }

  handleGetUserMediaError(e) {
    switch (e.name) {
      case "NotFoundError":
        alert(
          "Unable to open your call because no camera and/or microphone" +
            "were found."
        )
        break
      case "SecurityError":
      case "PermissionDeniedError":
        // Do nothing; this is the same as the user canceling the call.
        break
      default:
        alert("Error opening your camera and/or microphone: " + e.message)
        break
    }

    // closeVideoCall();
    console.log("Error")
  }

  handleNegotiationNeededEvent = () => {
    this.state.pc1
      .createOffer()
      .then((offer) => {
        return this.state.pc1.setLocalDescription(offer)
      })
      .then(() => {
        this.sendToServer({
          name: this.state.myName,
          target: this.state.targetName,
          type: "video-offer",
          sdp: this.state.pc1.localDescription,
        })
      })
      .catch((error) => {
        console.log(error)
      })
  }

  handleVideoOfferMsg = (msg) => {
    let localStream = null

    this.setState({ targetName: msg.name })
    const peer = this.createPeerConnection()
    this.setState({
      pc1: peer,
    })

    const desc = new RTCSessionDescription(msg.sdp)

    console.log("setting remote description", desc)

    this.state.pc1
      .setRemoteDescription(desc)
      .then(() => {
        return navigator.mediaDevices.getUserMedia(mediaConstraints)
      })
      .then((stream) => {
        localStream = stream

        localStream
          .getTracks()
          .forEach((track) => this.state.pc1.addTrack(track, localStream))
      })
      .then(() => {
        return this.state.pc1.createAnswer()
      })
      .then((answer) => {
        return this.state.pc1.setLocalDescription(answer)
      })
      .then(() => {
        const msg = {
          name: this.state.myName,
          target: this.state.targetName,
          type: "video-answer",
          sdp: this.state.pc1.localDescription,
        }

        this.sendToServer(msg)
      })
      .catch(this.handleGetUserMediaError)
  }

  handleICECandidateEvent = (event) => {
    if (event.candidate) {
      this.sendToServer({
        type: "new-ice-candidate",
        target: this.state.targetName,
        candidate: event.candidate,
      })
    }
  }

  handleNewICECandidateMsg = async (msg) => {
    const candidate = new RTCIceCandidate(msg.candidate)

    console.log("candidate::", candidate)
    await this.state.pc1.addIceCandidate(candidate)
  }

  handleTrackEvent = (event) => {
    console.log(event)
    this.setState({ localStream: event.streams[0] })
  }

  handleRemoveTrackEvent = (event) => {
    const stream = document.getElementById("received_video").srcObject
    const trackList = stream.getTracks()

    if (trackList.length === 0) {
      this.closeVideoCall()
    }
  }

  hangUpCall = () => {
    this.closeVideoCall()
    this.sendToServer({
      name: this.state.myName,
      target: this.state.targetName,
      type: "hang-up",
    })
  }

  closeVideoCall = () => {
    let remoteVideo = document.getElementById("received_video")
    let localVideo = document.getElementById("local_video")

    if (this.state.pc1) {
      let pc1 = this.state.pc1
      pc1 = resetPeerCallBack(pc1)
      this.setState({ pc1: pc1 })

      if (remoteVideo.srcObject) {
        remoteVideo.srcObject.getTracks().forEach((track) => track.stop())
      }

      if (localVideo.srcObject) {
        localVideo.srcObject.getTracks().forEach((track) => track.stop())
      }

      this.state.pc1.close()
      this.setState({ pc1: null })
    }

    remoteVideo.removeAttribute("src")
    remoteVideo.removeAttribute("srcObject")
    localVideo.removeAttribute("src")
    remoteVideo.removeAttribute("srcObject")

    document.getElementById("hangup-button").disabled = true
    this.setState({ targetName: null })
  }

  handleICEConnectionStateChangeEvent = (event) => {
    switch (this.state.pc1.iceConnectionState) {
      case "closed":
      case "failed":
        this.closeVideoCall()
        break
      default:
        console.log("handleICEConnectionStateChangeEvent::undefined msg case")
    }
  }

  handleSignalingStateChangeEvent = (event) => {
    switch (this.state.pc1.signalingState) {
      case "closed":
        this.closeVideoCall()
        break
      default:
        console.log("handleSignalingStateChangeEvent::undefined msg case")
    }
  }

  handleICEGatheringStateChangeEvent = (event) => {
    // Our sample just logs information to console here,
    // but you can do whatever you need.
    console.log("handleICEGatheringStateChangeEvent::", event)
  }

  connect = () => {
    let serverUrl
    let scheme = "ws"

    // If this is an HTTPS connection, we have to use a secure WebSocket
    // connection too, so add another "s" to the scheme.

    if (document.location.protocol === "https:") {
      scheme += "s"
    }
    serverUrl = scheme + "://localhost:6503"

    console.log(`Connecting to server: ${serverUrl}`)
    connection = new WebSocket(serverUrl, "json")

    connection.onopen = (evt) => {
      console.log("connection onopen")
      // document.getElementById("text").disabled = false
      // document.getElementById("send").disabled = false
    }

    connection.onerror = (evt) => {
      console.dir(evt)
    }

    connection.onmessage = (evt) => {
      let chatBox = document.querySelector(".chatbox")
      let text = ""
      let msg = JSON.parse(evt.data)
      console.log("Message received: ")
      console.dir(msg)
      let time = new Date(msg.date)
      let timeStr = time.toLocaleTimeString()

      switch (msg.type) {
        case "id":
          clientID = msg.id
          this.setUsername()
          break

        case "username":
          text =
            "<b>User <em>" +
            msg.name +
            "</em> signed in at " +
            timeStr +
            "</b><br>"
          console.log(text)
          break

        case "message":
          text =
            "(" + timeStr + ") <b>" + msg.name + "</b>: " + msg.text + "<br>"
          break

        case "rejectusername":
          // myUsername = msg.name
          // text =
          //   "<b>Your username has been set to <em>" +
          //   myUsername +
          //   "</em> because the name you chose is in use.</b><br>"
          console.log("rejectusername")
          break

        case "video-offer": // Invitation and offer to chat
          this.handleVideoOfferMsg(msg)
          break

        case "video-answer": // Callee has answered our offer
          this.handleVideoAnswerMsg(msg)
          break

        case "new-ice-candidate": // A new ICE candidate has been received
          this.handleNewICECandidateMsg(msg)
          break

        case "hang-up": // The other peer has hung up the call
          this.handleHangUpMsg(msg)
          break

        // Unknown message; output to console for debugging.

        default:
          console.log("Unknown message received:")
          console.log(msg)
      }

      // If there's text to insert into the chat buffer, do so now, then
      // scroll the chat panel so that the new text is visible.

      if (text.length) {
        chatBox.innerHTML += text
        chatBox.scrollTop = chatBox.scrollHeight - chatBox.clientHeight
      }
    }
  }

  setUsername = () => {
    this.sendToServer({
      name: this.state.myName,
      date: Date.now(),
      id: clientID,
      type: "username",
    })
  }

  sendToServer = (msg) => {
    const msgJSON = JSON.stringify(msg)

    console.log("Sending '" + msg.type + "' message: " + msgJSON)
    connection.send(msgJSON)
  }

  handleVideoAnswerMsg = async (msg) => {
    console.log("*** Call recipient has accepted our call")

    // Configure the remote description, which is the SDP payload
    // in our "video-answer" message.

    const desc = new RTCSessionDescription(msg.sdp)
    await this.state.pc1
      .setRemoteDescription(desc)
      .catch((error) => console.log(error))
  }

  myNameChange = (event) => {
    this.setState({ myName: event.target.value })
  }

  targetNameChange = (event) => {
    this.setState({ targetName: event.target.value })
  }

  render() {
    return (
      <div className="app">
        <section className="app__peers">
          <div className="peers__panel">
            <Peer stream={this.state.localStream} isMuted={true}></Peer>
            <Input
              className="peers__name"
              value={this.state.myName}
              placeholder="My Name"
              inputProps={{ "aria-label": "description" }}
              onChange={this.myNameChange}
            />
          </div>
          <div className="peers__panel">
            <Peer stream={this.state.remoteStream} isMuted={false}></Peer>
            <Input
              className="peers__name"
              value={this.state.targetName}
              placeholder="Target Name"
              inputProps={{ "aria-label": "description" }}
              onChange={this.targetNameChange}
            />
          </div>
          <Controls></Controls>
        </section>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  call: state.call,
})

export default connect(mapStateToProps, null)(App)
