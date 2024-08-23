import { getShapeIndex, notifyCoordinatesChanged } from "../../interactive-map-utils.js";
async function accept_shape(instance, shapeKey, shape, isEditing) {
  if (shape != null) {
    if (isEditing === true) {
      await handleEditingShape(instance, shape);
    } else {
      await handleNewShape(instance, shapeKey, shape);
    }
    shape.remove();
    shape = null;
  }
  notifyCoordinatesChanged(instance);
}
async function handleEditingShape(instance, shape) {
  const index = getShapeIndex(shape);
  let changes = {};
  if (shape.feature) {
    changes.geographicLocation = shape.toGeoJSON();
  } else {
    changes.coordinates = latLngsToCoordinates(shape);
  }
  await crs.call("data_manager", "update", {
    index,
    manager: instance.dataset.manager,
    changes,
    is_dirty: true
  });
  await crs.call("data_manager", "set_selected", {
    manager: instance.dataset.manager,
    indexes: [index],
    selected: false
  });
}
async function handleNewShape(instance, shapeKey, shape) {
  let record;
  if (instance.dataset.format === "geojson") {
    record = {
      geographicLocation: shape.toGeoJSON()
    };
  } else {
    record = {
      coordinates: latLngsToCoordinates(shape),
      type: shapeKey
    };
  }
  await crs.call("data_manager", "append", {
    records: [record],
    manager: instance.dataset.manager,
    is_dirty: true
  });
}
function latLngsToCoordinates(shape) {
  if (shape instanceof L.Marker) {
    const latlong = shape.getLatLng();
    return [latlong.lat, latlong.lng];
  }
  let latLngs = shape.getLatLngs();
  latLngs = Array.isArray(latLngs[0]) ? latLngs[0] : latLngs;
  return latLngs.map((_) => [_.lat, _.lng]);
}
export {
  accept_shape
};
