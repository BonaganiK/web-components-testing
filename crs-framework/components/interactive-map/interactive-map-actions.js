import { COLORS } from "./interactive-map-colors.js";
import { getShapeIndex } from "./interactive-map-utils.js";
class InteractiveMapActions {
  static async perform(step, context, process, item) {
    await this[step.action]?.(step, context, process, item);
  }
  static async initialize_lib() {
    return new Promise((resolve) => {
      if (globalThis.L == null) {
        requestAnimationFrame(async () => {
          const leafletScript = document.createElement("script");
          const baseUrl = window.location.origin + window.location.pathname.split("/").slice(0, -1).join("/");
          leafletScript.src = `${baseUrl}/packages/leaflet/leaflet.js`;
          leafletScript.onload = async () => {
            resolve();
          };
          const leafletCss = document.createElement("link");
          leafletCss.rel = "stylesheet";
          leafletCss.href = `${baseUrl}/packages/leaflet/leaflet.css`;
          document.head.appendChild(leafletCss);
          document.body.appendChild(leafletScript);
        });
      } else {
        resolve();
      }
    });
  }
  static async initialize(step, context, process, item) {
    const instance = await crs.dom.get_element(step, context, process, item);
    const maxShapes = await crs.process.getValue(step.args.max_shapes, context, process, item);
    await instance.initialize(maxShapes);
  }
  static async set_colors(step, context, process, item) {
    const map = await getMap(step, context, process, item);
    const color = await crs.process.getValue(step.args.color || "#E00000", context, process, item);
    const fillColor = await crs.process.getValue(step.args.fill_color || "#E000004D", context, process, item);
    const selectionColor = await crs.process.getValue(step.args.selection_color || "#0276C2", context, process, item);
    map.color = color;
    map.fillColor = fillColor;
    map.selectionColor = selectionColor;
    if (map.selectedShape != null) {
      map.selectedShape.setStyle({ fillColor });
      map.selectedShape.setStyle({ color });
    }
  }
  static async set_mode(step, context, process, item) {
    const instance = await crs.dom.get_element(step, context, process, item);
    const mode = await crs.process.getValue(step.args.mode ?? "none", context, process, item);
    const shape = await crs.process.getValue(step.args.shape, context, process, item);
    if (instance.currentMode != null) {
      instance.currentMode.dispose(instance);
      instance.currentMode = null;
    }
    if (mode !== "none") {
      const modeClass = await getModeProvider(mode);
      instance.currentMode = await modeClass;
      await modeClass.initialize(instance, shape);
    }
    instance.dispatchEvent(new CustomEvent("mode-changed", { detail: { mode } }));
  }
  static async cancel_mode(step, context, process, item) {
    const instance = await crs.dom.get_element(step, context, process, item);
    if (instance.currentMode != null) {
      await instance.currentMode.cancel();
      await crs.call("data_manager", "set_selected", { manager: instance.dataset.manager, indexes: [], selected: false, deselect_others: true });
      await crs.call("interactive_map", "set_mode", { element: instance, mode: "select" });
    }
  }
  static async accept_mode(step, context, process, item) {
    const instance = await crs.dom.get_element(step, context, process, item);
    if (instance.currentMode?.accept != null) {
      await instance.currentMode.accept();
      await crs.call("interactive_map", "set_mode", { element: instance, mode: "select" });
    }
  }
  static async fit_bounds(step, context, process, item) {
    const instance = await crs.dom.get_element(step, context, process, item);
    const layer = await crs.process.getValue(step.args.layer, context, process, item);
    const padding = await crs.process.getValue(step.args.padding || [30, 30], context, process, item);
    const map = instance.map;
    let layerCount = 0;
    map.eachLayer(function() {
      layerCount += 1;
    });
    if (padding != null && layerCount > 0) {
      map.fitBounds(layer.getBounds(), { padding });
    }
  }
  static async find_shape_by_index(step, context, process, item) {
    const layer = await crs.process.getValue(step.args.layer, context, process, item);
    const index = await crs.process.getValue(step.args.index, context, process, item);
    return layer.getLayers().find((shape) => {
      const currentShapeIndex = getShapeIndex(shape);
      return index === currentShapeIndex;
    });
  }
  static async add_records(step, context, process, item) {
    const records = await crs.process.getValue(step.args.records, context, process, item);
    const layer = await crs.process.getValue(step.args.layer, context, process, item);
    const instance = await crs.dom.get_element(step, context, process, item);
    for (const record of records) {
      if (record.geographicLocation == null && record.type == null) {
        continue;
      }
      if (record.geographicLocation != null) {
        record.geographicLocation.properties = record.geographicLocation.properties || {};
        layer.addData(record.geographicLocation);
      } else {
        record.options = record.options || {};
        await ShapeFactory[`add_${record.type}`](instance.map, record, layer);
      }
    }
  }
  static async redraw_record(step, context, process, item) {
    const instance = await crs.dom.get_element(step, context, process, item);
    const layer = await crs.process.getValue(step.args.layer, context, process, item);
    const index = await crs.process.getValue(step.args.index, context, process, item);
    const shape = await crs.call("interactive_map", "find_shape_by_index", { layer, index });
    const record = await crs.call("data_manager", "get", { manager: instance.dataset.manager, index });
    if (shape != null) {
      layer.removeLayer(shape);
      await crs.call("interactive_map", "add_records", {
        element: instance,
        records: [record],
        layer
      });
    }
  }
  static async remove_record(step, context, process, item) {
    const layer = await crs.process.getValue(step.args.layer, context, process, item);
    const index = await crs.process.getValue(step.args.index, context, process, item);
    if (index == null) {
      throw new Error("Index is required to remove a record");
    }
    const shape = await crs.call("interactive_map", "find_shape_by_index", { layer, index });
    layer.removeLayer(shape);
  }
  static async add_shape(step, context, process, item) {
    const instance = await crs.dom.get_element(step, context, process, item);
    const map = instance.map;
    const layer = await crs.process.getValue(step.args.layer, context, process, item);
    const data = await crs.process.getValue(step.args.data, context, process, item);
    const shape = await ShapeFactory[`add_${data.type}`](map, data, layer);
    return shape;
  }
  static async add_handle(step, context, process, item) {
    const instance = await crs.dom.get_element(step, context, process, item);
    const map = instance.map;
    const coordinates = await crs.process.getValue(step.args.coordinates, context, process, item);
    const options = await crs.process.getValue(step.args.options || {}, context, process, item);
    const type = await crs.process.getValue(step.args.type || "drag", context, process, item);
    const customIcon = L.divIcon({
      className: "marker",
      html: `<div class="handle" data-type='${type}' data-index="${options.index}"></div>`,
      iconSize: [16, 16],
      // Size of the icon
      iconAnchor: [8, 8]
      // Point of the icon which will correspond to marker's location
    });
    const marker = L.marker(coordinates, { icon: customIcon, ...options }).addTo(map);
    marker.type = type;
    return marker;
  }
  static async show_drawing_tools(step, context, process, item) {
    const instance = await crs.dom.get_element(step, context, process, item);
    await import("./interactive-map-draw-toolbar/interactive-map-draw-toolbar.js");
    const toolbar = document.createElement("interactive-map-draw-toolbar");
    instance.querySelector("#drawing-tools").appendChild(toolbar);
    await toolbar.setInstance(instance);
    return toolbar;
  }
  static async clear_layers(step, context, process, item) {
    const instance = await crs.dom.get_element(step, context, process, item);
    const map = instance.map;
    if (map == null)
      return;
    map.eachLayer((layer) => {
      map.removeLayer(layer);
    });
  }
  static async clear_layer(step, context, process, item) {
    const instance = await crs.dom.get_element(step, context, process, item);
    const map = instance.map;
    const layer = await crs.process.getValue(step.args.layer, context, process, item);
    if (map == null)
      return;
    layer.eachLayer((child) => {
      layer.removeLayer(child);
    });
  }
  static async get_layer_geo_json(step, context, process, item) {
    const instance = await crs.dom.get_element(step, context, process, item);
    const layerName = await crs.process.getValue(step.args.layer, context, process, item);
    const target = await crs.process.getValue(step.args.target, context, process, item);
    const map = instance.map;
    const layers = map._layers;
    const layer = Object.values(layers).find((layer2) => layer2.layer_name === layerName);
    const value = layer.toGeoJSON();
    if (target != null) {
      await crs.process.setValue(step.args.target, value, context, process, item);
    }
    return value;
  }
  static async convert_geo_json_to_array(step, context, process, item) {
    const geoJson = await crs.process.getValue(step.args.geo_json, context, process, item);
    const target = await crs.process.getValue(step.args.target, context, process, item);
    const value = geoJson.features.map((feature) => {
      return feature.geometry.coordinates;
    });
    if (target != null) {
      await crs.process.setValue(step.args.target, value, context, process, item);
    }
    return value;
  }
  static async assign_colors_to_geo_data(step, context, process, item) {
    const data = await crs.process.getValue(step.args.data ?? [], context, process, item);
    const featurePath = await crs.process.getValue(step.args.feature_path || "geographicLocation", context, process, item);
    if (data.length === 0)
      return data;
    const colorsLength = Object.keys(COLORS).length;
    let index = 0;
    for (const item2 of data) {
      if (item2[featurePath] == null)
        continue;
      let source;
      if (item2[featurePath].type === "FeatureCollection") {
        source = item2[featurePath].features[0];
      } else {
        source = item2[featurePath];
      }
      source.properties = source.properties ?? {};
      source.properties.style = source.properties.style ?? {};
      source.properties.style.fillColor = COLORS[index].fillColor || COLORS[index].fillColor;
      source.properties.style.color = COLORS[index].color;
      index++;
      if (index >= colorsLength) {
        index = 0;
      }
    }
    return data;
  }
  static async assign_properties_to_geo_data(step, context, process, item) {
    let data = await crs.process.getValue(step.args.data ?? [], context, process, item);
    const featurePath = await crs.process.getValue(step.args.feature_path || "geographicLocation", context, process, item);
    const properties = await crs.process.getValue(step.args.properties, context, process, item);
    const keys = Object.keys(properties);
    let values = {};
    if (Array.isArray(data) === false) {
      data = [data];
    }
    for (const key of keys) {
      values[key] = await crs.process.getValue(properties[key], context, process, item);
    }
    for (const item2 of data) {
      if (item2[featurePath] == null)
        continue;
      let source;
      if (item2[featurePath].type === "FeatureCollection") {
        source = item2[featurePath].features[0];
      } else {
        source = item2[featurePath];
      }
      source.properties = source.properties ?? {};
      for (const key of keys) {
        source.properties[key] = structuredClone(values[key]);
      }
    }
    return data;
  }
}
async function getModeProvider(mode) {
  const module = await import(`./providers/${mode}.js`);
  return new module.default();
}
async function getMap(step, context, process, item) {
  const instance = await crs.dom.get_element(step, context, process, item);
  return instance.nodeName === "INTERACTIVE-MAP" ? instance.map : instance;
}
async function getColorData(step, context, process, item, map) {
  const fillColor = await crs.process.getValue(step.args.fill_color, context, process, item);
  const color = await crs.process.getValue(step.args.color, context, process, item);
  const weight = await crs.process.getValue(step.args.weight, context, process, item);
  return {
    fillColor: fillColor || map.fillColor,
    color: color || map.color,
    weight: weight || 2
  };
}
crs.intent.interactive_map = InteractiveMapActions;
class ShapeFactory {
  static add_polygon(map, data, layer = null) {
    const shape = L.polygon(data.coordinates, data.options);
    if (layer != null) {
      shape.addTo(layer);
    }
    return shape;
  }
  static add_polyline(map, data, layer = null) {
    const shape = L.polyline(data.coordinates, data.options);
    if (layer != null) {
      shape.addTo(layer);
    }
    return shape;
  }
  static add_point(map, data, layer = null) {
    const iconName = data.options?.iconName ?? "location-pin";
    const color = data.options?.color ?? "#E00000";
    const customIcon = L.divIcon({
      className: "marker",
      html: `<div style="color: ${color}" class="point">${iconName}</div>`,
      iconSize: [48, 48],
      // Size of the icon
      iconAnchor: [24, 48]
      // Point of the icon which will correspond to marker's location
    });
    const marker = L.marker(data.coordinates, { icon: customIcon, index: data.options.index });
    if (layer != null) {
      marker.addTo(layer);
    }
    return marker;
  }
}
export {
  InteractiveMapActions,
  ShapeFactory
};
