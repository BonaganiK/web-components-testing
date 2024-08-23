import { getShapeIndex } from "../interactive-map-utils.js";
class SelectProvider {
  #instance;
  #shapeClickHandler;
  #clickHandler;
  #shapeSelected = false;
  async initialize(instance) {
    this.#instance = instance;
    await this.#setupEvents();
  }
  async dispose() {
    if (this.#instance.selectedShape != null) {
      this.#instance.selectedShape = null;
    }
    await this.#removeEvents();
    this.#instance = null;
  }
  async #onMapClick(e) {
    const shape = e.layer;
    shape.closePopup();
    if (shape.options?.readonly === true)
      return;
    const index = getShapeIndex(shape);
    if (index != null) {
      await crs.call("data_manager", "set_selected", { manager: this.#instance.dataset.manager, indexes: [index] });
    }
  }
  async #setupEvents() {
    this.#clickHandler = this.#onMapClick.bind(this);
    this.#instance.activeLayer.on("click", this.#clickHandler);
  }
  async #removeEvents() {
    this.#instance.activeLayer.off("click", this.#clickHandler);
    this.#clickHandler = null;
  }
}
export {
  SelectProvider as default
};
