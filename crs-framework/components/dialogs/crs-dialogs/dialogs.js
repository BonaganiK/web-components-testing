class Dialogs extends crs.classes.BindableElement {
  #dialogs = {};
  #transforms = {};
  #clickHandler = this.#click.bind(this);
  get html() {
    return import.meta.url.replace(".js", ".html");
  }
  get shadowDom() {
    return false;
  }
  async load() {
    this.registerEvent(this, "click", this.#clickHandler);
  }
  async disconnectedCallback() {
    this.unregisterEvent(this, "click", this.#clickHandler);
    super.disconnectedCallback();
  }
  async #click(event) {
    event.preventDefault();
    event.stopPropagation();
    const target = event.composedPath()[0];
    if (target.tagName === "CRS-MODALS") {
      if (target.lastElementChild?.dataset.autoclose === "true") {
        await this.closeDialog(target.lastElementChild.dataset.id);
      }
    }
  }
  async #swapBackDialogs(dialog) {
    const previousDialog = dialog.previousElementSibling;
    const transition = previousDialog.style.transition;
    previousDialog.style.transition = "";
    previousDialog.removeAttribute("aria-hidden");
    previousDialog.style.transition = transition;
    requestAnimationFrame(async () => {
      await this.#changeOpacity(dialog, 0, () => {
        dialog.remove();
      });
    });
  }
  async #changeOpacity(element, opacity, callback) {
    element.style.opacity = opacity;
    requestAnimationFrame(() => {
      const timeout = setTimeout(() => {
        clearTimeout(timeout);
        callback();
      }, 300);
    });
  }
  /**
   * @method showDialog - show a dialog
   * @param id {string} - The id of the dialog
   * @param content {string} - The header, main and footer of the dialog
   * @param options {Object} - The options for the dialog
   * @param context {Object} - The binding context
   * @returns {Promise<void>}
   */
  async showDialog(id, content, options, context) {
    const dialog = this.#dialogs[id];
    if (await dialog?.canClose()) {
      await this.closeDialog(dialog.dataset.id);
    }
    let parent = this;
    const modal = options?.modal;
    if (modal !== false) {
      parent = this.querySelector("crs-modals");
    }
    const newDialog = this.#dialogs[id] = document.createElement("crs-dialog");
    newDialog.style.opacity = "0";
    newDialog.style.transition = "opacity 0.3s ease-in-out";
    newDialog.dataset.id = id;
    parent.appendChild(newDialog);
    let maximize = options?.maximize;
    if (options?.remember === true) {
      newDialog.dataset.remember = "true";
      const transform = this.#transforms[id];
      if (transform != null && transform.fullscreen != "true") {
        options.transform = transform;
      }
      if (transform?.fullscreen === "true") {
        maximize = true;
      }
    }
    if (modal !== false) {
      await this.#changeOpacity(newDialog, 0, () => {
        newDialog.previousElementSibling?.setAttribute("aria-hidden", "true");
      });
    }
    await newDialog.initialize(content, options, context);
    if (maximize === true) {
      newDialog.dataset.maximized = "true";
      await crs.call("component", "on_ready", {
        element: newDialog,
        callback: newDialog.toggleFullscreen,
        caller: newDialog
      });
    }
  }
  /**
   * @method closeDialog - close a dialog
   * @param id {string} - The id of the dialog
   * @returns {Promise<void>}
   */
  async closeDialog(id) {
    const dialog = this.#dialogs[id];
    if (dialog == null)
      return;
    if (dialog.dataset.remember === "true") {
      const transform = this.#transforms[id] ||= {};
      const aabb = dialog.getBoundingClientRect();
      transform.fullscreen = dialog.dataset.fullscreen || false;
      transform.x = Math.round(aabb.x);
      transform.y = Math.round(aabb.y);
      transform.width = Math.round(aabb.width);
      transform.height = Math.round(aabb.height);
    }
    if (await dialog.canClose()) {
      delete this.#dialogs[id];
      if (dialog.previousElementSibling != null) {
        return await this.#swapBackDialogs(dialog);
      }
      await this.#changeOpacity(dialog, 0, () => {
        dialog.remove();
      });
    }
  }
  /**
   * @method pin - pin a dialog
   * @param id
   * @returns {Promise<void>}
   */
  async pin(id) {
    const dialog = this.#dialogs[id];
    if (dialog == null)
      return;
    dialog.pinned = true;
    const aabb = dialog.getBoundingClientRect();
    this.#transforms[id] = {
      x: Math.round(aabb.x),
      y: Math.round(aabb.y),
      width: Math.round(aabb.width),
      height: Math.round(aabb.height)
    };
  }
  /**
   * @method unpin - unpin a dialog
   * @param id {string} - The id of the dialog
   * @returns {Promise<void>}
   */
  async unpin(id) {
    const dialog = this.#dialogs[id];
    if (dialog == null)
      return;
    dialog.pinned = false;
    delete this.#transforms[id];
  }
}
customElements.define("crs-dialogs", Dialogs);
