class SelectPoint {
  #map = null;
  #point = null;
  #element = null;
  async initialize(map, point, element) {
    this.#map = map;
    debugger;
    if (point != null) {
      this.#point = point;
      this.#point.dragging.enable();
      this.#element = element;
      this.#element.classList.add("selected");
    }
  }
  async dispose() {
    this.#map = null;
    if (this.#point?.dragging != null) {
      this.#point.dragging.disable();
      this.#point = null;
    }
    this.#element.classList.remove("selected");
    this.#element = null;
  }
}
export {
  SelectPoint as default
};
