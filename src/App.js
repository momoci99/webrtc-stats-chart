import "./style/app.scss"
import "./style/reset.scss"

import React from "react"
import { Line } from "react-chartjs-2"
import dayjs from "dayjs"

import Peer from "./components/Peer"
import Controls from "./components/Controls"

import { connect } from "react-redux"

let connection = null

const mediaConstraints = {
  audio: true, // We want an audio track
  video: {
    aspectRatio: {
      ideal: 1.333333, // 3:2 aspect is preferred
    },
  },
}

const data = {
  labels: ["", "", "", "", "", ""],
  datasets: [
    {
      label: "# per frame",
      data: [0, 0, 0, 0, 0, 0],
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(255, 159, 64, 0.2)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
      ],
      borderWidth: 1,
    },
  ],
}

let clientID = 0

class App extends React.Component {
  constructor(props) {
    super(props)

    this.barChartRef = React.createRef()

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
  componentDidMount() {
    // const socket = new WebSocket("ws://localhost:3030/")
    // socket.send()
    this.connect()
    console.log(this.barChartRef.current.chartInstance.update)
    // window.setInterval(() => {
    //   if (this.pc2 === null) {
    //     return
    //   }
    //   this.pc2.getStats().then((stats) => {
    //     stats.forEach((report) => {
    //       // console.log(`Report: ${report.type}`)
    //       // console.log(`ID:${report.id}`)
    //       // console.log(`Timestamp:${report.timestamp}`)
    //       if (report.type === "inbound-rtp") {
    //         // Now the statistics for this report; we intentially drop the ones we
    //         // sorted to the top above
    //         console.log("additional data")
    //         Object.keys(report).forEach((statName) => {
    //           if (
    //             statName !== "id" &&
    //             statName !== "timestamp" &&
    //             statName !== "type"
    //           ) {
    //             if (statName === "framesPerSecond") {
    //               console.log(`${statName} : ${report[statName]}`)
    //               data.datasets[0].data.unshift(report[statName])
    //               data.datasets[0].data.pop()

    //               data.labels.unshift(dayjs().format("HH:mm:ss"))
    //               data.labels.pop()

    //               this.barChartRef.current.chartInstance.update()
    //             }
    //           }
    //         })
    //       }
    //     })
    //     console.log("-------")
    //   })
    // }, 20000)
  }

  call = () => {
    // this.setState({ callBtn: false })
    // bandwidthSelector.disabled = false
    // frameSelector.disabled = false

    // console.log("Starting call")
    // const servers = null
    // this.pc1 = new RTCPeerConnection(servers)
    // console.log("Created local peer connection object pc1")
    // this.pc1.onicecandidate = this.onIceCandidate.bind(this.pc1)

    // this.pc2 = new RTCPeerConnection(servers)
    // console.log("Created remote peer connection object pc2")
    // this.pc2.onicecandidate = this.onIceCandidate.bind(this.pc2)
    // this.pc2.ontrack = this.gotRemoteStream

    // console.log("Requesting local stream")
    const peer = this.createPeerConnection()
    this.setState({
      pc1: peer,
    })
    navigator.mediaDevices
      .getUserMedia({
        // video: { frameRate: { ideal: 10, max: 15 } },
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

  // gotDescription1 = (desc) => {
  //   console.log("Offer from pc1 \n" + desc.sdp)
  //   this.state.pc1.setLocalDescription(desc).then(() => {
  //     this.pc2
  //       .setRemoteDescription(desc)
  //       .then(
  //         () =>
  //           this.pc2
  //             .createAnswer()
  //             .then(this.gotDescription2, this.onCreateSessionDescriptionError),
  //         this.onSetSessionDescriptionError
  //       )
  //   }, this.onSetSessionDescriptionError)
  // }

  // gotDescription2 = (desc) => {
  //   this.pc2.setLocalDescription(desc).then(() => {
  //     console.log("Answer from pc2 \n" + desc.sdp)
  //     let p
  //     p = this.pc1.setRemoteDescription(desc)
  //     p.then(() => {}, this.onSetSessionDescriptionError)
  //   }, this.onSetSessionDescriptionError)
  // }

  hangUp = () => {
    console.log("Ending call")
    // this.state.localStream.getTracks().forEach((track) => track.stop())
    // this.pc1.close()
    // this.pc2.close()
    // this.pc1 = null
    // this.pc2 = null
    // this.setState({
    //   hangBtn: false,
    //   callBtn: false,
    // })

    // bandwidthSelector.disabled = true
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
      .then(this.onAddIceCandidateSuccess)
      .catch(this.onAddIceCandidateError)

    console.log(
      `${this.getName(this)} ICE candidate:\n${
        event.candidate ? event.candidate.candidate : "(null)"
      }`
    )
  }

  onAddIceCandidateSuccess = () => {
    console.log("AddIceCandidate success.")
  }

  onAddIceCandidateError = (error) => {
    console.log("Failed to add ICE Candidate: " + error.toString())
  }

  onSetSessionDescriptionError = (error) => {
    console.log("Failed to set session description: " + error.toString())
  }

  // gotStream = (stream) => {
  //   // this.setState({ hangBtn: false })

  //   console.log("Received local stream")
  //   this.setState({ localStream: stream })

  //   this.state.localStream
  //     .getTracks()
  //     .forEach((track) => this.pc1.addTrack(track, this.state.localStream))
  //   console.log("Adding Local Stream to peer connection")

  //   this.pc1
  //     .createOffer(this.offerOptions)
  //     .then(this.gotDescription1, this.onCreateSessionDescriptionError)
  // }

  gotRemoteStream = (e) => {
    if (this.state.remoteStream !== e.streams[0]) {
      this.setState({ remoteStream: e.streams[0] })
      console.log("Received remote stream")
    }
  }

  // getOtherPc = (pc) => {
  //   return pc === this.pc1 ? this.pc2 : this.pc1
  // }

  // getName = (pc) => {
  //   return pc === this.pc1 ? "pc1" : "pc2"
  // }

  createPeerConnection = () => {
    const myPeerConnection = new RTCPeerConnection({
      iceServers: [
        // Information about ICE servers - Use your own!
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
            "stun:stun3.l.google.com:19302",
            "stun:stun4.l.google.com:19302",
          ],
        },
      ],
    })

    myPeerConnection.onicecandidate = this.handleICECandidateEvent
    myPeerConnection.ontrack = this.handleTrackEvent
    myPeerConnection.onnegotiationneeded = this.handleNegotiationNeededEvent
    myPeerConnection.onremovetrack = this.handleRemoveTrackEvent
    myPeerConnection.oniceconnectionstatechange = this.handleICEConnectionStateChangeEvent
    myPeerConnection.onicegatheringstatechange = this.handleICEGatheringStateChangeEvent
    myPeerConnection.onsignalingstatechange = this.handleSignalingStateChangeEvent

    return myPeerConnection
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
          name: "aaa", //수정 필요함.
          target: "bbb", //수정 필요함.
          type: "video-offer",
          sdp: this.state.pc1.localDescription,
        })
      })
      .catch((error) => {
        console.log(error)
      })
  }

  handleVideoOfferMsg = (msg) => {
    var localStream = null

    this.setState({ targetName: msg.name })
    this.createPeerConnection()

    var desc = new RTCSessionDescription(msg.sdp)

    this.pc1
      .setRemoteDescription(desc)
      .then(() => {
        return navigator.mediaDevices.getUserMedia(mediaConstraints)
      })
      .then((stream) => {
        localStream = stream
        document.getElementById("local_video").srcObject = localStream

        localStream
          .getTracks()
          .forEach((track) => this.pc1.addTrack(track, localStream))
      })
      .then(() => {
        return this.pc1.createAnswer()
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

  handleNewICECandidateMsg = (msg) => {
    var candidate = new RTCIceCandidate(msg.candidate)

    this.state.pc1.addIceCandidate(candidate).catch((error) => {
      console.log(error)
    })
  }

  handleTrackEvent = (event) => {
    document.getElementById("received_video").srcObject = event.streams[0]
    document.getElementById("hangup-button").disabled = false
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
    var remoteVideo = document.getElementById("received_video")
    var localVideo = document.getElementById("local_video")

    if (this.state.pc1) {
      const pc1 = this.state.pc1
      pc1.ontrack = null
      pc1.onremovetrack = null
      pc1.onremovestream = null
      pc1.onicecandidate = null
      pc1.oniceconnectionstatechange = null
      pc1.onsignalingstatechange = null
      pc1.onicegatheringstatechange = null
      pc1.onnegotiationneeded = null
      this.setState({ pc1: pc1 })

      if (remoteVideo.srcObject) {
        remoteVideo.srcObject.getTracks().forEach((track) => track.stop())
      }

      if (localVideo.srcObject) {
        localVideo.srcObject.getTracks().forEach((track) => track.stop())
      }

      this.setState.close()
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

        case "userlist": // Received an updated user list
          this.handleUserlistMsg(msg)
          break

        // Signaling messages: these messages are used to trade WebRTC
        // signaling information during negotiations leading up to a video
        // call.

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

  handleUserlistMsg = (msg) => {
    var i
    // var listElem = document.querySelector(".userlistbox")

    // // Remove all current list members. We could do this smarter,
    // // by adding and updating users instead of rebuilding from
    // // scratch but this will do for this sample.

    // while (listElem.firstChild) {
    //   listElem.removeChild(listElem.firstChild)
    // }

    // // Add member names from the received list.

    // msg.users.forEach(function (username) {
    //   var item = document.createElement("li")
    //   item.appendChild(document.createTextNode(username))
    //   item.addEventListener("click", invite, false)

    //   listElem.appendChild(item)
    // })
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
        <section className="app__peer">
          <Peer stream={this.state.localStream} isMuted={true}></Peer>
          <Peer stream={this.state.remoteStream} isMuted={false}></Peer>
          <Controls></Controls>
          <textarea
            value={this.state.myName}
            onChange={this.myNameChange}
          ></textarea>
          <textarea
            value={this.state.targetName}
            onChange={this.targetNameChange}
          ></textarea>
        </section>

        <section className="app__chart">
          <Line
            ref={this.barChartRef}
            data={data}
            width={300}
            height={200}
          ></Line>
        </section>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  call: state.call,
})

export default connect(mapStateToProps, null)(App)
