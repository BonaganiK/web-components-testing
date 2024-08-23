import { getShapeIndex } from "../interactive-map-utils.js";
class SelectionEditProvider {
  #instance;
  #shapeCache = [];
  async initialize(instance) {
    this.#instance = instance;
  }
  async dispose() {
    this.#instance = null;
  }
  async select() {
    const indexes = await crs.call("data_manager", "get_selected_indexes", { manager: this.#instance.dataset.manager });
    if (indexes.length === 0) {
      await this.clear();
      return crs.call("interactive_map", "fit_bounds", { element: this.#instance, layer: this.#instance.activeLayer });
    }
    this.#instance.activeLayer.eachLayer((layer) => {
      this.#shapeCache.push(layer);
      this.#instance.activeLayer.removeLayer(layer);
    });
    for (const index of indexes) {
      const shape = this.#shapeCache.find((shape2) => getShapeIndex(shape2) === index);
      if (shape) {
        this.#instance.activeLayer.addLayer(shape);
      }
    }
    if (this.#instance.activeLayer.getLayers().length > 0) {
      await crs.call("interactive_map", "fit_bounds", { element: this.#instance, layer: this.#instance.activeLayer });
    }
  }
  async clear() {
    this.#shapeCache.forEach((layer) => {
      this.#instance.activeLayer.addLayer(layer);
    });
    this.#shapeCache = [];
  }
}
export {
  SelectionEditProvider as default
};
