import "./style/app.scss"
import "./style/reset.scss"

import React from "react"
import { Line } from "react-chartjs-2"
import dayjs from "dayjs"

import Peer from "./components/Peer"
import Controls from "./components/Controls"

import { connect } from "react-redux"

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

class App extends React.Component {
  constructor(props) {
    super(props)

    this.barChartRef = React.createRef()

    this.pc1 = null
    this.pc2 = null

    this.offerOptions = {
      offerToReceiveAudio: 0,
      offerToReceiveVideo: 1,
    }

    this.state = {
      localStream: null,
      remoteStream: null,
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
    const socket = new WebSocket("ws://localhost:3030/")
    console.log(this.barChartRef.current.chartInstance.update)
    window.setInterval(() => {
      if (this.pc2 === null) {
        return
      }
      this.pc2.getStats().then((stats) => {
        stats.forEach((report) => {
          // console.log(`Report: ${report.type}`)
          // console.log(`ID:${report.id}`)
          // console.log(`Timestamp:${report.timestamp}`)
          if (report.type === "inbound-rtp") {
            // Now the statistics for this report; we intentially drop the ones we
            // sorted to the top above
            console.log("additional data")
            Object.keys(report).forEach((statName) => {
              if (
                statName !== "id" &&
                statName !== "timestamp" &&
                statName !== "type"
              ) {
                if (statName === "framesPerSecond") {
                  console.log(`${statName} : ${report[statName]}`)
                  data.datasets[0].data.unshift(report[statName])
                  data.datasets[0].data.pop()

                  data.labels.unshift(dayjs().format("HH:mm:ss"))
                  data.labels.pop()

                  this.barChartRef.current.chartInstance.update()
                }
              }
            })
          }
        })
        console.log("-------")
      })
    }, 20000)
  }

  call = () => {
    // this.setState({ callBtn: false })
    // bandwidthSelector.disabled = false
    // frameSelector.disabled = false

    console.log("Starting call")
    const servers = null
    this.pc1 = new RTCPeerConnection(servers)
    console.log("Created local peer connection object pc1")
    this.pc1.onicecandidate = this.onIceCandidate.bind(this.pc1)

    this.pc2 = new RTCPeerConnection(servers)
    console.log("Created remote peer connection object pc2")
    this.pc2.onicecandidate = this.onIceCandidate.bind(this.pc2)
    this.pc2.ontrack = this.gotRemoteStream

    console.log("Requesting local stream")
    navigator.mediaDevices
      .getUserMedia({
        // video: { frameRate: { ideal: 10, max: 15 } },
        video: true,
        audio: true,
        frameRate: {
          max: 30,
        },
      })
      .then(this.gotStream)
      .catch((e) => console.error(e))
  }

  gotDescription1 = (desc) => {
    console.log("Offer from pc1 \n" + desc.sdp)
    this.pc1.setLocalDescription(desc).then(() => {
      this.pc2
        .setRemoteDescription(desc)
        .then(
          () =>
            this.pc2
              .createAnswer()
              .then(this.gotDescription2, this.onCreateSessionDescriptionError),
          this.onSetSessionDescriptionError
        )
    }, this.onSetSessionDescriptionError)
  }

  gotDescription2 = (desc) => {
    this.pc2.setLocalDescription(desc).then(() => {
      console.log("Answer from pc2 \n" + desc.sdp)
      let p
      p = this.pc1.setRemoteDescription(desc)
      p.then(() => {}, this.onSetSessionDescriptionError)
    }, this.onSetSessionDescriptionError)
  }

  hangUp = () => {
    console.log("Ending call")
    this.state.localStream.getTracks().forEach((track) => track.stop())
    this.pc1.close()
    this.pc2.close()
    this.pc1 = null
    this.pc2 = null
    // this.setState({
    //   hangBtn: false,
    //   callBtn: false,
    // })

    // bandwidthSelector.disabled = true
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

  gotStream = (stream) => {
    // this.setState({ hangBtn: false })

    console.log("Received local stream")
    this.setState({ localStream: stream })

    this.state.localStream
      .getTracks()
      .forEach((track) => this.pc1.addTrack(track, this.state.localStream))
    console.log("Adding Local Stream to peer connection")

    this.pc1
      .createOffer(this.offerOptions)
      .then(this.gotDescription1, this.onCreateSessionDescriptionError)
  }

  gotRemoteStream = (e) => {
    if (this.state.remoteStream !== e.streams[0]) {
      this.setState({ remoteStream: e.streams[0] })
      console.log("Received remote stream")
    }
  }

  getOtherPc = (pc) => {
    return pc === this.pc1 ? this.pc2 : this.pc1
  }

  getName = (pc) => {
    return pc === this.pc1 ? "pc1" : "pc2"
  }

  render() {
    return (
      <div className="app">
        <section className="app__peer">
          <Peer stream={this.state.localStream} isMuted={true}></Peer>
          <Peer stream={this.state.remoteStream} isMuted={false}></Peer>
          <Controls></Controls>
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
