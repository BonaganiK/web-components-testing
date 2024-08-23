class FileUploaderActions {
  static async perform(step, context, process, item) {
    await this[step.action](step, context, process, item);
  }
  /**
   * @function initialize - initializes the file-uploader component with the specified file name, file extension, file size, and drag target.
   *
   * @param step {Object} - The step object in the process.
   * @param context {Object} - The context of the current process.
   * @param process {Object} - The currently running process.
   * @param item {Object} - The item object if we are using a loop
   *
   * @param step.args.element {String || HTMLElement} - The element to get the file from.
   * @param step.args.file_name {String} - The name of the file to initialize the component with.
   * @param step.args.file_extension {String} - The extension of the file to initialize the component with.
   * @param step.args.file_size {Number} - The size of the file to initialize the component with.
   * @param step.args.drag_target {String} - The target to set the file to.
   *
   * @returns {Promise<void>}
   */
  static async initialize(step, context, process, item) {
    const element = await getElement(step, context, process, item);
    const fileName = await crs.process.getValue(step.args.file_name, context, process, item);
    const fileExtension = await crs.process.getValue(step.args.file_extension, context, process, item);
    const fileSize = await crs.process.getValue(step.args.file_size, context, process, item);
    const dragTarget = await crs.process.getValue(step.args.drag_target, context, process, item) || null;
    element.initialize(fileName, fileExtension, fileSize, dragTarget, context);
  }
  /**
   * @function get_file - retrieves the file off the file-uploader component
   *
   * @param step {Object} - The step object in the process.
   * @param context {Object} - The context of the current process.
   * @param process {Object} - The currently running process.
   * @param item {Object} - The item object if we are using a loop.
   *
   * @param step.args.element {String || HTMLElement} - The element to get the file from.
   * @param step.args.target {String} - The target to set the file to.
   *
   * @returns {Promise<*>}
   */
  static async get_file(step, context, process, item) {
    const element = await getElement(step, context, process, item);
    const file = element?.file;
    if (step.args.target != null) {
      await crs.process.setValue(step.args.target, file, context, process, item);
    }
    return file;
  }
  /**
   * @function file_uploaded - calls upon the uploaded function on the element to notify the component the file has been uploaded
   *
   * @param step {Object} - The step object from the process definition
   * @param context {Object} - The context of the current process.
   * @param process {Object} - The process object that is currently running.
   * @param item {Object} - The item that is being processed.
   *
   * @param step.args.element {String || HTMLElement} - The element to call the uploaded function on.
   *
   * @returns {Promise<void>}
   */
  static async file_uploaded(step, context, process, item) {
    const element = await getElement(step, context, process, item);
    await element.uploaded();
  }
  /**
   * @function file_deleted - calls upon the deleted function on the element to notify the component the file has been deleted
   *
   * @param step {Object} - The step object from the process definition
   * @param context {Object} - The context of the current process.
   * @param process {Object} - The process object that is currently running.
   * @param item {Object} - The item that is being processed.
   *
   * @param step.args.element {String || HTMLElement} - The element to call the uploaded function on.
   *
   * @returns {Promise<void>}
   */
  static async file_deleted(step, context, process, item) {
    const element = await getElement(step, context, process, item);
    await element.deleted();
  }
  /**
   * @function replace_file - request to the component to replace the current file associated to the component.
   * Updates the fileName and fileExtension properties on the element if specified.
   *
   * @param step {Object} - The step object from the process definition
   * @param context {Object} - The context of the current process.
   * @param process {Object} - The process object that is currently running.
   * @param item {Object} - The item that is being processed.
   *
   * @param step.args.element {String || HTMLElement} - The element to call the uploaded function on.
   * @param step.args.file {File} - The file to replace the current file with.
   * @param step.args.file_name {String} - The name of the file to update the component with.
   * @param step.args.file_extension {String} - The extension of the file to update the component with.
   *
   * @returns {Promise<void>}
   */
  static async uploading_file(step, context, process, item) {
    const element = await getElement(step, context, process, item);
    const fileName = await crs.process.getValue(step.args.file_name, context, process, item) || element.dataset.fileName;
    const fileExtension = await crs.process.getValue(step.args.file_extension, context, process, item) || element.dataset.fileType;
    const file = await crs.process.getValue(step.args.file, context, process, item);
    await element.updateDatasetProperties("uploading", fileName, fileExtension, file.size);
    await element.updateLabels();
  }
  /**
   * @function file_replaced - calls upon the uploaded function on the element to notify the component the file has been replaced
   *
   * @param step {Object} - The step object from the process definition
   * @param context {Object} - The context of the current process.
   * @param process {Object} - The process object that is currently running.
   * @param item {Object} - The item that is being processed.
   *
   * @param step.args.element {String || HTMLElement} - The element to call the uploaded function on.
   * @param step.args.file {File} - The file to replace the current file with.
   *
   * @returns {Promise<void>}
   */
  static async file_replaced(step, context, process, item) {
    const element = await getElement(step, context, process, item);
    await element.uploaded();
  }
}
crs.intent.file_uploader_component = FileUploaderActions;
async function getElement(step, context, process, item) {
  step.args.element = await crs.process.getValue(step.args.parent_element, context, process, item);
  const parentElement = await crs.dom.get_element(step, context, process, item);
  return parentElement.querySelector("file-uploader");
}
export {
  FileUploaderActions
};
