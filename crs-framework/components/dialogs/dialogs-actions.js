import "./crs-dialog/crs-dialog.js";
import "./crs-dialogs/dialogs.js";
class DialogsActions {
  /**
   * @method show - show a dialog
   * @param step {Object} - The step object
   * @param context {Object} - The binding context
   * @param process {Object} - The process object
   * @param item {Object} - The item object
   *
   * @returns {Promise<void>}
   *
   * @example <caption>javascript</caption>
   * await crs.call("dialogs", "show", {
   *     id: "my-dialog",
   *     context: {
   *         header: headerElement,
   *         main: mainElement,
   *         footer: footerElement
   *     },
   *     options: {
   *         modal: false, // I have access to what is behind me. (designer)
   *         auto_hide: false, // default true, to hide when a new dialog is shown.
   *         remember: true // default false, to remember the position of the dialog.
   *        ... options settings
   *     }
   * })
   */
  static async show(step, context, process, item) {
    const id = await crs.process.getValue(step.args.id, context, process, item);
    const content = await crs.process.getValue(step.args.content, context, process, item);
    const options = await crs.process.getValue(step.args.options, context, process, item);
    if (options?.relative_to != null) {
      options.relative_to = await crs.dom.get_element(options.relative_to, context, process, item);
      options.position = await crs.process.getValue(options.position ?? "left", context, process, item);
      options.anchor = await crs.process.getValue(options.anchor ?? "top", context, process, item);
      options.margin = await crs.process.getValue(options.margin ?? 0, context, process, item);
      options.maximized = await crs.process.getValue(options.maximized ?? false, context, process, item);
    }
    await crs.dialogs.showDialog(id, content, options, context);
  }
  /**
   * @method close - close an open dialog based on the id
   * @param step {Object} - The step object
   * @param context {Object} - The binding context
   * @param process {Object} - The process object
   * @param item {Object} - The item object
   *
   * @param {string} id - The id of the dialog to close
   *
   * @returns {Promise<void>}
   *
   * @example <caption>javascript</caption>
   * await crs.call("dialogs", "close", {
   *     id: "my-dialog"
   * })
   */
  static async close(step, context, process, item) {
    const id = await crs.process.getValue(step.args.id, context, process, item);
    if (id != null) {
      await crs.dialogs.closeDialog(id);
    }
    const element = await crs.dom.get_element(step.args.element, context, process, item);
    const closeId = getDialogId(element);
    if (closeId != null) {
      await crs.dialogs.closeDialog(closeId);
    }
  }
  /**
   * @method pin - used when you "Pin" the dialog in place
   * @param step {Object} - The step object
   * @param context {Object} - The binding context
   * @param process {Object} - The process object
   * @param item {Object} - The item object
   * @returns {Promise<void>}
   *
   * @example <caption>javascript</caption>
   * await crs.call("dialogs", "pin", {
   *     id: "my-dialog"
   * })
   */
  static async pin(step, context, process, item) {
    const id = await crs.process.getValue(step.args.id, context, process, item);
    await crs.dialogs.pin(id);
  }
  /**
   * @method unpin
   * @param step {Object} - The step object
   * @param context {Object} - The binding context
   * @param process {Object} - The process object
   * @param item {Object} - The item object
   * @returns {Promise<void>}
   *
   * @example <caption>javascript</caption>
   * await crs.call("dialogs", "unpin", {
   *     id: "my-dialog"
   * })
   */
  static async unpin(step, context, process, item) {
    const id = await crs.process.getValue(step.args.id, context, process, item);
    await crs.dialogs.unpin(id);
  }
}
function getDialogId(element) {
  if (element == null)
    return null;
  if (element.tagName == "CRS-DIALOG") {
    return element.dataset.id;
  }
  return getDialogId(element.parentElement);
}
crs.dialogs = document.createElement("crs-dialogs");
document.body.appendChild(crs.dialogs);
crs.intent.dialogs = DialogsActions;
