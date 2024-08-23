const inputStep = {
  "type": "perform",
  "action": "type_text",
  "args": {
    "query": "",
    "value": ""
  }
};
const clickStep = {
  "type": "perform",
  "action": "click",
  "args": {
    "query": ""
  }
};
const dragStep = {
  "type": "perform",
  "action": "drag_and_drop",
  "args": {
    "query": "",
    "target": "",
    "x": 0,
    "y": 0
  }
};
const process = {
  "id": "",
  "main": {
    "steps": {
      "start": {
        "type": "perform",
        "action": "navigate",
        "args": {
          "url": "${state.server}"
        },
        "next_step": "step_0"
      }
    }
  }
};
export {
  clickStep,
  dragStep,
  inputStep,
  process
};
