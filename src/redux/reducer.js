const initialState = {
  call: "END", //END, PROGRESSING
}

function callReducer(state = initialState, action) {
  switch (action.type) {
    case "CALL":
      return {
        call: "PROGRESSING",
      }
    case "HANGUP":
      return {
        call: "END",
      }
    default:
      return state
  }
}

export default callReducer
