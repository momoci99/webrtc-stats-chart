const initialState = {
  behavior: {
    call: true,
    hangUp: false,
  },
}

function callReducer(state = initialState, action) {
  switch (action.type) {
    case "CALL":
      return {
        behavior: {
          call: false,
          hangUp: true,
        },
      }
    case "HANGUP":
      return {
        behavior: {
          call: true,
          hangUp: false,
        },
      }
    default:
      return state
  }
}

export default callReducer
