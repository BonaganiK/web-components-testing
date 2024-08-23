import "./macro-recorder.js";
class MacroRecorderActions {
  static async show(step, context, process, item) {
    const instance = document.createElement("macro-recorder");
    document.body.appendChild(instance);
  }
  static async close(step, context, process, item) {
    const instance = document.querySelector("macro-recorder");
    instance?.remove();
  }
  static async save_process(step, context, process, item) {
    const name = await crs.process.getValue(step.args.name);
    const instance = document.querySelector("macro-recorder");
    return await instance.saveToProcess(name);
  }
}
crs.intent.macro_recorder = MacroRecorderActions;
export {
  MacroRecorderActions
};
