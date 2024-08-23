import { getShapeIndex, notifyCoordinatesChanged } from "../interactive-map-utils.js";
import { accept_shape } from "./draw/draw-helpers.js";
class DrawPolyBase {
  // This class will start the drawing of a polygon on the map when the user clicks on the map.
  // Each click will add a new point to the polygon.
  // Then when mouse moves the polygon will be updated.
  // When the user right-clicks the mouse the polygon will be finished.
  // The polygon will be drawn on the map using the Leaflet library.
  // The class will also handle the events for the polygon drawing.
  #shape = null;
  #subDivisionLine = null;
  #subDivisionLinePoints = [];
  #originalPoints = null;
  #instance = null;
  #points = [];
  #selectedPoints = [];
  #subDivisionPoints = [];
  #disableNewPoints = false;
  #pointClickHandler = this.#pointClick.bind(this);
  #pointDragStartHandler = this.#pointDragStart.bind(this);
  #pointDragHandler = this.#pointDrag.bind(this);
  #pointDragEndHandler = this.#pointDragEnd.bind(this);
  #pointContextMenuHandler = this.#pointContextMenu.bind(this);
  #subPointDragStartHandler = this.#subPointDragStart.bind(this);
  #subPointDragHandler = this.#subPointDrag.bind(this);
  #subPointDragEndHandler = this.#subPointDragEnd.bind(this);
  #clickHandler = this.#click.bind(this);
  #isEditing = false;
  get shapeKey() {
    throw new Error("Not implemented");
  }
  get editing() {
    return true;
  }
  get minPoints() {
    return 3;
  }
  get closeShape() {
    return true;
  }
  set points(value) {
    this.#points = value;
  }
  async initialize(instance, shape) {
    this.#instance = instance;
    this.#instance.map.on("click", this.#clickHandler);
    if (shape != null) {
      this.#disableNewPoints = true;
      await this.#drawHandles(shape);
      await this.#addSubDivisionMarkers();
      this.#shape = shape;
      this.#isEditing = true;
    }
  }
  async dispose() {
    if (this.#shape != null) {
      this.#shape.remove();
      this.#shape = null;
    }
    this.#instance.map.off("click", this.#clickHandler);
    this.#instance = null;
    for (const point of this.#points) {
      point.handle.off("drag", this.#pointDragHandler);
      point.handle.remove();
    }
    await this.#removeSubDivisionMarkers();
    this.#points = null;
    this.#clickHandler = null;
    this.#pointContextMenuHandler = null;
    this.#subPointDragStartHandler = null;
    this.#subPointDragHandler = null;
    this.#subPointDragEndHandler = null;
    this.#pointDragStartHandler = null;
    this.#pointDragHandler = null;
    this.#pointDragEndHandler = null;
    this.#pointClickHandler = null;
  }
  async redraw() {
    if (this.#shape != null && this.#points.length < this.minPoints) {
      this.#shape.remove();
      this.#shape = null;
      return;
    }
    this.#shape.setLatLngs(this.#points.map((_) => _.coordinates));
  }
  async cancel() {
    if (this.#shape != null) {
      const index = getShapeIndex(this.#shape);
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
    }
    notifyCoordinatesChanged(this.#instance);
  }
  async accept() {
    this.#shape = await accept_shape(this.#instance, this.shapeKey, this.#shape, this.#isEditing);
  }
  async #pointClick(event) {
    await notifyCoordinatesChanged(this.#instance, event.target);
  }
  async #pointDragStart(event) {
    await this.#removeSubDivisionMarkers();
  }
  async #pointDrag(event) {
    this.#points[event.target.options.index].coordinates = [event.latlng.lat, event.latlng.lng];
    await this.redraw();
  }
  async #pointDragEnd(event, test) {
    notifyCoordinatesChanged(this.#instance, event.target);
    await this.#addSubDivisionMarkers();
  }
  async #pointContextMenu(event) {
    return await this.#removePoint(event.target.options.index);
  }
  async #subPointDragStart(event) {
    const lastPointIndex = event.target.options.index + 1 >= this.#points.length ? 0 : event.target.options.index + 1;
    const lastPoint = this.#points[lastPointIndex].coordinates;
    this.#subDivisionLinePoints = [this.#points[event.target.options.index].coordinates, this.#subDivisionPoints[event.target.options.index].coordinates, lastPoint];
    const element = event.target.getElement();
    element.firstChild.dataset.type = "draghandle";
    const index = event.target.options.index;
    const dragPointIndex = index + 1;
    await this.#addPoint(dragPointIndex, event.target.getLatLng(), null);
  }
  async #subPointDrag(event) {
    const index = event.target.options.index + 1;
    this.#points[index].coordinates = [event.latlng.lat, event.latlng.lng];
    await this.redraw();
  }
  async #subPointDragEnd(event) {
    this.#disableNewPoints = true;
    const index = event.target.options.index + 1;
    const handle = await this.#createDragHandle(event.target.getLatLng(), index);
    this.#points[index].handle = handle;
    await notifyCoordinatesChanged(this.#instance, handle);
    await this.#updateHandleIndexes();
    await this.#removeSubDivisionMarkers();
    await this.#addSubDivisionMarkers();
  }
  async #click(event) {
    event.originalEvent.stopPropagation();
    if (this.#disableNewPoints === true) {
      return;
    }
    await this.#addNewPoint(event.latlng);
  }
  async #createDragHandle(coordinates, index) {
    const handle = await crs.call("interactive_map", "add_handle", {
      element: this.#instance,
      coordinates: [coordinates.lat, coordinates.lng],
      options: {
        draggable: true,
        index
      },
      type: "draghandle"
    });
    handle.on("click", this.#pointClickHandler);
    handle.on("dragstart", this.#pointDragStartHandler);
    handle.on("dragend", this.#pointDragEndHandler);
    handle.on("drag", this.#pointDragHandler);
    handle.on("contextmenu", this.#pointContextMenuHandler);
    return handle;
  }
  async #drawHandles(polygon) {
    let latLngs = polygon.getLatLngs();
    latLngs = Array.isArray(latLngs[0]) ? latLngs[0] : latLngs;
    for (let i = 0; i < latLngs.length; i++) {
      const latLng = latLngs[i];
      if (Array.isArray(latLng)) {
        await this.#drawHandles(latLng);
        continue;
      }
      const handle = await this.#createDragHandle(latLng, i);
      await this.#addPoint(i, latLng, handle);
    }
  }
  async #addNewPoint(coordinates, index = this.#points.length) {
    await this.#removeSubDivisionMarkers();
    const handle = await this.#createDragHandle(coordinates, index);
    await this.#addPoint(index, coordinates, handle);
    notifyCoordinatesChanged(this.#instance, handle);
    if (this.#points.length < 2)
      return;
    if (this.#shape == null) {
      this.#shape = await crs.call("interactive_map", "add_shape", {
        layer: this.#instance.activeLayer,
        data: {
          type: this.shapeKey,
          coordinates: this.#points.map((_) => _.coordinates),
          options: {
            color: this.#instance.map.selectionColor
          }
        },
        element: this.#instance
      });
    } else {
      await this.redraw();
    }
    await this.#addSubDivisionMarkers();
  }
  async #addPoint(index, coordinates, handle) {
    const newPoint = {
      handle,
      coordinates: [coordinates.lat, coordinates.lng]
    };
    this.#points.splice(index, 0, newPoint);
    return newPoint;
  }
  async #removePoint(index) {
    const removedPoint = this.#points.splice(index, 1);
    removedPoint[0].handle.remove();
    await this.#updateHandleIndexes();
    await this.redraw();
    await this.#removeSubDivisionMarkers();
    await this.#addSubDivisionMarkers();
    notifyCoordinatesChanged(this.#instance);
  }
  async #addSubDivisionMarkers() {
    for (let i = 0; i < this.#points.length; i++) {
      const startCoordinates = this.#points[i];
      const isLastPoint = i === this.#points.length - 1;
      if (isLastPoint === true && this.closeShape === false) {
        return;
      }
      const endCoordinates = isLastPoint ? this.#points[0] : this.#points[i + 1];
      await this.#addSubDivisionMarker(startCoordinates, endCoordinates, i);
    }
  }
  async #addSubDivisionMarker(startCoordinates, endCoordinates, index) {
    const lat = (endCoordinates.coordinates[0] + startCoordinates.coordinates[0]) / 2;
    const lng = (endCoordinates.coordinates[1] + startCoordinates.coordinates[1]) / 2;
    const handle = await crs.call("interactive_map", "add_handle", {
      element: this.#instance,
      coordinates: [lat, lng],
      type: "subdivide",
      options: {
        index,
        draggable: true,
        fillColor: "red"
      }
    });
    handle.on("dragstart", this.#subPointDragStartHandler);
    handle.on("drag", this.#subPointDragHandler);
    handle.on("dragend", this.#subPointDragEndHandler);
    this.#subDivisionPoints.push({
      handle,
      coordinates: [lat, lng]
    });
  }
  async #removeSubDivisionMarkers() {
    for (const point of this.#subDivisionPoints) {
      point.handle.off("dragstart", this.#subPointDragStartHandler);
      point.handle.off("drag", this.#subPointDragHandler);
      point.handle.off("dragend", this.#subPointDragEndHandler);
      point.handle.remove();
    }
    this.#subDivisionPoints = [];
  }
  async #updateHandleIndexes() {
    this.#points.forEach((point, i) => {
      point.handle.options.index = i;
    });
  }
}
function latLngsToCoordinates(shape) {
  let latLngs = shape.getLatLngs();
  latLngs = Array.isArray(latLngs[0]) ? latLngs[0] : latLngs;
  return latLngs.map((_) => [_.lat, _.lng]);
}
export {
  DrawPolyBase as default
};
