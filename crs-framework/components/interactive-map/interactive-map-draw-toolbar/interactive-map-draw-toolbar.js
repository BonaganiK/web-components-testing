import { getShapeProperty } from "../interactive-map-utils.js";
import { CHANGE_TYPES } from "../../../src/managers/data-manager/data-manager-types.js";
class InteractiveMapDrawToolbar extends crsbinding.classes.BindableElement {
  #instance = null;
  #modeChangedEventHandler = this.onModeChanged.bind(this);
  #dataManagerChangedHandler = this.#dataManagerChanged.bind(this);
  #changeEventMap = {
    [CHANGE_TYPES.add]: this.#setMaxReached,
    [CHANGE_TYPES.refresh]: this.#setMaxReached,
    [CHANGE_TYPES.selected]: this.#onSelectionChanged
  };
  #createModes = ["draw-point", "draw-polyline", "draw-polygon"];
  get html() {
    return import.meta.url.replace(".js", ".html");
  }
  get shadowDom() {
    return true;
  }
  async connectedCallback() {
    this.setProperty("mode", "none");
    await super.connectedCallback();
  }
  async disconnectedCallback() {
    this.#instance.removeEventListener("mode-changed", this.#modeChangedEventHandler);
    this.#modeChangedEventHandler = null;
    this.#instance = null;
    await super.disconnectedCallback();
  }
  async setInstance(instance) {
    this.#instance = instance;
    this.#instance.addEventListener("mode-changed", this.#modeChangedEventHandler);
    await this.#hookDataManager();
  }
  async onModeChanged(event) {
    if (event.detail == null)
      return;
    this.setProperty("mode", event.detail.mode);
    await this.#setMaxReached();
  }
  async #hookDataManager() {
    await crs.call("data_manager", "on_change", {
      manager: this.#instance.dataset.manager,
      callback: this.#dataManagerChangedHandler
    });
  }
  async #dataManagerChanged(args) {
    await this.#changeEventMap[args.action]?.call(this, args);
  }
  async #onSelectionChanged(args) {
    const index = args.changes ? args.index[0] : null;
    this.setProperty("selectedIndex", index);
  }
  async #setMaxReached() {
    if (this.#instance.maxShapes > 0) {
      const maxReached = await this.#evaluateIfMaxShapesReached();
      maxReached ? this.classList.add("max-reached") : this.classList.remove("max-reached");
    }
  }
  async setMode(mode) {
    if (this.#instance == null)
      return;
    if (this.#instance.maxShapes > 0 && this.#createModes.indexOf(mode) !== -1) {
      const maxReached = await this.#evaluateIfMaxShapesReached();
      if (maxReached === true) {
        await crsbinding.events.emitter.emit("toast", { type: "error", message: await crsbinding.translations.get("interactiveMap.maxShapesReached") });
        return;
      }
    }
    await crs.call("interactive_map", "set_mode", {
      element: this.#instance,
      mode
    });
  }
  async removeSelected(event) {
    const footerTemplate = await crs.call("dom", "create_element", {
      tag_name: "template",
      children: [
        {
          tag_name: "button",
          classes: ["secondary"],
          text_content: globalThis.translations.labels.cancel,
          attributes: {
            "data-action": "close"
          }
        },
        {
          tag_name: "button",
          classes: ["primary"],
          text_content: globalThis.translations.labels.accept,
          attributes: {
            "data-action": "accept"
          }
        }
      ]
    });
    const dialog = await crs.call("dialog", "show", {
      title: globalThis.translations.interactiveMap.header,
      main: globalThis.translations.interactiveMap.content,
      severity: "warning",
      footer: footerTemplate.content.cloneNode(true),
      allow_resize: false,
      target: event.target,
      position: "bottom",
      anchor: "right",
      margin: 10,
      callback: async (option) => {
        if (option.action === "close")
          return;
        if (option.action === "accept") {
          const index = this.getProperty("selectedIndex");
          if (this.#instance == null)
            return;
          await crs.call("data_manager", "remove", {
            manager: this.#instance.dataset.manager,
            indexes: [index]
          });
          await crs.call("interactive_map", "set_mode", {
            element: this.#instance,
            mode: "none"
          });
          this.setProperty("selectedIndex", null);
          dialog.close();
        }
      }
    });
  }
  async discard() {
    if (this.#instance == null)
      return;
    await crs.call("interactive_map", "cancel_mode", {
      element: this.#instance
    });
  }
  async accept() {
    if (this.#instance == null)
      return;
    await crs.call("interactive_map", "accept_mode", {
      element: this.#instance
    });
  }
  async #evaluateIfMaxShapesReached() {
    if (this.#instance.maxShapes == 0)
      return false;
    const records = await crs.call("data_manager", "get_all", {
      manager: this.#instance.dataset.manager
    });
    let count = 0;
    for (const record of records) {
      const readOnly = record.geographicLocation?.properties?.readonly ?? record.readonly;
      if (readOnly === true)
        continue;
      count++;
    }
    return count >= this.#instance.maxShapes;
  }
}
customElements.define("interactive-map-draw-toolbar", InteractiveMapDrawToolbar);
export {
  InteractiveMapDrawToolbar
};
