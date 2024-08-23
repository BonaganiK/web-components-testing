import { get_file_name } from "./../../packages/crs-process-api/action-systems/files-actions.js";
class FileUploader extends HTMLElement {
  #file;
  #input;
  #dropBounds;
  #dragTarget;
  #mainLabel;
  #fileSizeLabel;
  #highlightActive;
  #clickHandler = this.#click.bind(this);
  #changeHandler = this.#change.bind(this);
  #dragEventHandler = this.#processDragEvent.bind(this);
  #states = Object.freeze({
    "UPLOAD": "upload",
    "UPLOADING": "uploading",
    "UPLOADED": "uploaded"
  });
  get html() {
    return import.meta.url.replace(".js", ".html");
  }
  get file() {
    return this.#file || this.#input.files[0];
  }
  set file(newValue) {
    this.#file = newValue;
  }
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  async connectedCallback() {
    this.shadowRoot.innerHTML = await fetch(this.html).then((result) => result.text());
    await crsbinding.translations.add(globalThis.translations.fileUploader, "fileUploader");
    await this.load();
  }
  async disconnectedCallback() {
    if (this.#dragTarget != null) {
      await this.#disableDropZone();
      this.#dragTarget = null;
    }
    this.removeEventListener("click", this.#clickHandler);
    this.#input?.removeEventListener("change", this.#changeHandler);
    this.#file = null;
    this.#input = null;
    this.#dropBounds = null;
    this.#mainLabel = null;
    this.#fileSizeLabel = null;
    this.#highlightActive = null;
    this.#clickHandler = null;
    this.#changeHandler = null;
    this.#dragEventHandler = null;
    this.#states = null;
  }
  async load() {
    this.dataset.state = this.#states.UPLOAD;
    this.shadowRoot.attributes = [];
    await crsbinding.translations.parseElement(this.shadowRoot);
    this.addEventListener("click", this.#clickHandler);
    this.#input = this.shadowRoot.querySelector("#inp-upload");
    this.#input.addEventListener("change", this.#changeHandler);
    this.dataset.isMobile = await crs.call("system", "is_mobile", {});
    if (this.dataset.isMobile === "true") {
      const element = this.shadowRoot.querySelector("#actions");
      element.innerHTML = `<button id="action-drop-down" class="icon" data-action="showActions">kabab-vert</button>`;
    }
    await crs.call("component", "notify_ready", { element: this });
  }
  async initialize(fileName, fileExtension, fileSize, dragTarget, context) {
    this.dataset.fileName = fileName || "";
    this.dataset.fileType = fileExtension || "";
    this.dataset.fileSize = fileSize || "";
    if (fileName != null) {
      this.dataset.state = this.#states.UPLOADED;
    } else {
      this.dataset.state = this.#states.UPLOAD;
      this.file = null;
    }
    await this.updateLabels();
    if (dragTarget != null) {
      this.#dragTarget = context.querySelector(dragTarget);
      this.#dragTarget && await this.#enableDropZone();
    }
  }
  /**
   * Click event handler - handles the click event on the component
   * If the click is on the upload button, then the upload process will be initiated
   * @param event {Event} - the click event
   * @returns {Promise<void>}
   */
  async #click(event) {
    const element = event.composedPath()[0];
    if (element.dataset.action && this[element.dataset.action]) {
      await this[element.dataset.action](event);
    }
  }
  /**
   * Change event handler - handles the change event on the input[type='file'] element which is triggered when the user
   * clicks on the btn-upload label and selects a file to be uploaded.
   * @returns {Promise<void>}
   */
  async #change() {
    const file = this.file;
    const fileDetails = await get_file_name(file.name);
    await this.upload({
      name: fileDetails.name,
      ext: fileDetails.ext,
      type: file.type,
      size: file.size,
      value: file
    });
  }
  /**
   * Enable the drop zone for the file to be dragged and dropped onto
   * @returns {Promise<void>}
   */
  async #enableDropZone() {
    const dropTemplate = this.shadowRoot.querySelector("#drop-template");
    await crs.call("files", "enable_dropzone", {
      element: this.#dragTarget,
      callback: this.#dragEventHandler,
      drop_template: dropTemplate,
      drop_classes: ["drop-area"]
    });
  }
  /**
   * Disables the drop zone and cleans up the animation layer
   * @returns {Promise<void>}
   */
  async #disableDropZone() {
    await crs.call("files", "disable_dropzone", {
      element: this.#dragTarget
    });
  }
  /**
   * Based on the event action (dragOver, dragLeave, drop) that comes back from the files action system,
   * the corresponding action will be called and processed.
   * @param args {Object} - the event action and the event results
   * @param args.action {String} - the action to be processed (dragOver, dragLeave, drop)
   * @param args.event {Event} - the event that has been triggered
   * @param args.results {Array} - the results of the event that has been triggered
   * @returns {Promise<void>}
   */
  async #processDragEvent(args) {
    if (args.action === "drop") {
      await this.#onDrop(args.results);
    }
  }
  /**
   * Drop event handler - handles the drop event on the drag target
   * If a file is dropped onto the drag target and there is no file associated with the input,
   * then the file will be uploaded.
   * If there is a file associated with the input,
   * then the file will be replaced
   * @param event {Array} - the event containing the file to be uploaded
   * @returns {Promise<void>}
   */
  async #onDrop(event) {
    if (this.dataset.fileName == null || this.dataset.fileName === "") {
      if (event.length > 0) {
        await this.upload(event[0]);
      }
    } else {
      await this.replace(event);
    }
  }
  /**
   * Util function to convert a file size into a human-readable format
   * @param size {Number} - the size of the file
   * @returns {string}
   */
  #fileToSize(size) {
    let divisor = 1024;
    let suffixes = ["Kb", "Mb", "Gb", "Tb"];
    let value = 1, suffix = "Kb";
    for (let i = 0; i < 4; i++) {
      if (size / divisor < 1)
        break;
      value = size / divisor;
      suffix = suffixes.shift();
      divisor *= 1024;
    }
    const fract = suffix == "Kb" ? 0 : 2;
    return `${value.toFixed(fract)}${suffix}`;
  }
  /**
   * Util function to compose the full file name based on the file name and file type parameters
   * @param fileName {String} - the name of the file
   * @param fileType {String} - the type(extension) of the file
   * @returns {string}
   */
  #getFileName(fileName, fileType) {
    if (fileType?.charAt(0) === ".") {
      return `${fileName}${fileType}`;
    } else {
      return `${fileName}.${fileType}`;
    }
  }
  /**
   * Upload action - initiates the upload process and updates associated properties and child elements accordingly
   * @param file {Object} - the file to be uploaded
   * @returns {Promise<void>}
   */
  async upload(file) {
    this.file = file;
    this.dispatchEvent(new CustomEvent("upload_file", { detail: {
      element: this,
      file
    } }));
    this.updateDatasetProperties(this.#states.UPLOADING, file.name, file.ext, file.size);
    await this.updateLabels();
  }
  async replace(event) {
    if (event.type != null && event.type === "click") {
      const result = await crs.call("files", "load", {
        dialog: true
      });
      this.file = result[0];
    } else if (Array.isArray(event)) {
      this.file = event[0];
    }
    this.dispatchEvent(new CustomEvent("replace_file", { detail: {
      element: this,
      file: this.file
    } }));
  }
  async uploaded() {
    this.dataset.state = this.#states.UPLOADED;
    this.file = null;
  }
  async delete() {
    this.dispatchEvent(new CustomEvent("delete_file", { detail: {
      element: this,
      file: this.file
    } }));
  }
  async deleted() {
    this.#input.value = null;
    this.file = null;
    this.dataset.state = this.#states.UPLOAD;
    this.dataset.fileName = "";
    this.dataset.fileType = "";
    this.dataset.fileSize = "";
    await this.updateLabels();
  }
  async download() {
    this.dispatchEvent(new CustomEvent("download_file", { detail: {
      element: this,
      file: this.file
    } }));
  }
  /**
   * Updates the corresponding dataset properties based on the state, name, extension, and size parameters
   * @param state {String} - the state of the element (upload, uploading, uploaded)
   * @param name {String} - the name of the file
   * @param extension {String} - the type(extension) of the file
   * @param size {Number} - the size of the file
   */
  updateDatasetProperties(state, name, extension, size) {
    this.dataset.state = state;
    this.dataset.fileName = name;
    this.dataset.fileType = extension;
    this.dataset.fileSize = size;
  }
  /**
   * Updates the file name and size labels
   */
  async updateLabels() {
    this.#mainLabel = this.#mainLabel || this.shadowRoot.querySelector("#lbl-main");
    this.#fileSizeLabel = this.#fileSizeLabel || this.shadowRoot.querySelector("#lbl-file-size");
    if (this.dataset.state === this.#states.UPLOAD) {
      this.#mainLabel.innerText = await crsbinding.translations.get("fileUploader.dragDrop");
      this.#fileSizeLabel.innerText = "";
    } else {
      this.#mainLabel.innerText = this.#getFileName(this.dataset.fileName, this.dataset.fileType);
      this.#fileSizeLabel.innerText = this.#fileToSize(this.dataset.fileSize);
    }
  }
  /**
   * @method showActions - shows the actions dialog
   * @param event {Event} - the event that has been triggered
   * @return {Promise<void>}
   */
  async showActions(event) {
    const instance = this.shadowRoot.querySelector("#dialog-content").content.cloneNode(true);
    instance.attributes = [];
    await crsbinding.translations.parseElement(instance);
    await crs.call("dialog", "show", {
      main: instance,
      target: event.target,
      position: "bottom",
      anchor: "right",
      margin: 0.5,
      parent: "main",
      min_width: "2.5rem",
      show_header: false,
      auto_close: true,
      callback: async (args) => {
        const element = args.event?.composedPath()[0];
        if (element?.dataset.action == null && this[element?.dataset.action] == null)
          return;
        await this[element.dataset.action](event);
        dialog?.close();
      }
    });
  }
}
customElements.define("file-uploader", FileUploader);
export {
  FileUploader
};
