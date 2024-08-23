async function createStandardMap(container) {
  const map = L.map(container, { preferCanvas: true, zoomControl: false });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
  map.setView([-33.900404, 18.610625], 10);
  return map;
}
async function createImageMap(container, imageUrl) {
  const map = L.map(container, {
    crs: L.CRS.Simple,
    minZoom: -5,
    zoomControl: false
  });
  L.imageOverlay(imageUrl, bounds).addTo(map);
  const bounds = [[0, 0], [1406, 2300]];
  map.fitBounds(bounds);
  return map;
}
function getShapeIndex(shape) {
  return getShapeProperty(shape, "index");
}
function getShapeProperty(shape, property) {
  return shape.options?.[property] ?? shape.feature?.properties?.[property];
}
function isValidCoordinates(coordinatesString) {
  const parts = coordinatesString.split(",");
  if (parts.length !== 2) {
    return false;
  }
  const latitude = parseFloat(parts[0]);
  const longitude = parseFloat(parts[1]);
  if (isNaN(latitude) || isNaN(longitude)) {
    return false;
  }
  if (latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
    return true;
  }
  return false;
}
function addDynamicPopup(layer, popupDefinition, record) {
  let popupContent = [];
  popupContent.push(`<h3 class="${popupDefinition.type}">${popupDefinition.title}</h3>`);
  popupContent.push("<table>");
  for (const field of popupDefinition.fields) {
    if (field === "$seperator") {
      popupContent.push("<tr><td colspan='2'><hr></td></tr>");
      continue;
    }
    const value = record[field.name] ?? "";
    popupContent.push(`<tr><td class="map-popup-label">${field.label}:</td><td>${value}</td></tr>`);
  }
  popupContent.push("</table>");
  const isMarker = layer instanceof L.Marker;
  const offset = isMarker ? [0, -50] : [0, -20];
  layer.bindTooltip(popupContent.join(""), {
    direction: "top",
    sticky: !isMarker,
    offset
  });
}
function notifyCoordinatesChanged(instance, point) {
  let detail = "";
  if (point != null) {
    const latlng = point.getLatLng();
    detail = `${latlng.lat}, ${latlng.lng}`;
  }
  instance.dispatchEvent(new CustomEvent("update-coordinates", { detail }));
}
export {
  addDynamicPopup,
  createImageMap,
  createStandardMap,
  getShapeIndex,
  getShapeProperty,
  isValidCoordinates,
  notifyCoordinatesChanged
};
