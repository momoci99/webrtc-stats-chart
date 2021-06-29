/**
 * Peer connection 객체 생성 및 반환
 * @returns {RTCPeerConnection} RTCPeerConnection 객체
 */
export const createPeerConnection = () => {
  const peer = new RTCPeerConnection({
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
  return peer
}

/**
 * ICE 후보 추가 성공 콜백 함수
 */
export const onAddIceCandidateSuccess = () => {
  console.log("AddIceCandidate success.")
}

/**
 * ICE 후보 추가 실패시 호출될 콜백 함수
 * @param {Error} error 에러 객체
 */
export const onAddIceCandidateError = (error) => {
  console.log("Failed to add ICE Candidate: " + error.toString())
}

/**
 * SDP 설정 실패 호출 콜백 함수
 * @param {Error} error 에러 객체
 */
export const onSetSessionDescriptionError = (error) => {
  console.log("Failed to set session description: " + error.toString())
}

/**
 *
 * @param {RTCPeerConnection} peer RTCPeerConnection 객체
 * @returns {RTCPeerConnection} 이벤트 콜백 리셋된 RTCPeerConnection 객체
 */
export const resetPeerCallBack = (peer) => {
  peer.ontrack = null
  peer.onremovetrack = null
  peer.onremovestream = null
  peer.onicecandidate = null
  peer.oniceconnectionstatechange = null
  peer.onsignalingstatechange = null
  peer.onicegatheringstatechange = null
  peer.onnegotiationneeded = null
  return peer
}
