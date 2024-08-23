import { getShapeIndex, notifyCoordinatesChanged } from "../interactive-map-utils.js";
import { accept_shape } from "./draw/draw-helpers.js";
class DrawPoint {
  #instance = null;
  #clickHandler = this.#click.bind(this);
  #point = null;
  #isEditing = false;
  async initialize(instance, point) {
    this.#instance = instance;
    this.#instance.map.on("click", this.#clickHandler);
    if (point != null) {
      this.#point = point;
      this.#isEditing = true;
      notifyCoordinatesChanged(this.#instance, this.#point);
    }
  }
  async dispose() {
    this.#instance.map.off("click", this.#clickHandler);
    this.#instance = null;
    this.#point = null;
  }
  async #click(event) {
    if (this.#point != null) {
      this.#point.remove();
    }
    this.#point = await crs.call("interactive_map", "add_shape", {
      layer: this.#instance.activeLayer,
      data: {
        type: "point",
        coordinates: [event.latlng.lat, event.latlng.lng],
        options: {
          color: this.#instance.map.selectionColor,
          draggable: true
        }
      },
      element: this.#instance
    });
    notifyCoordinatesChanged(this.#instance, this.#point);
  }
  async cancel() {
    if (this.#point != null) {
      const index = getShapeIndex(this.#point);
      if (index != null) {
        await crs.call("data_manager", "set_selected", {
          manager: this.#instance.dataset.manager,
          indexes: [index],
          selected: false
        });
        await crs.call("interactive_map", "redraw_record", {
          element: this.#instance,
          index,
          layer: this.#instance.activeLayer
        });
      }
      this.#point.remove();
      this.#point = null;
    }
    notifyCoordinatesChanged(this.#instance);
  }
  async accept() {
    this.#point = await accept_shape(this.#instance, "point", this.#point, this.#isEditing);
  }
}
function latLngToCoordinates(point) {
  const latlng = point.getLatLng();
  return [latlng.lat, latlng.lng];
}
export {
  DrawPoint as default
};
