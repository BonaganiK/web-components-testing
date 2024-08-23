const PropertiesLookup = Object.freeze({
  "input": ["value"],
  "textarea": ["value"],
  "select": ["value"]
});
function getElementStatus(query, element) {
  const result = {
    "type": "assert",
    "action": "members",
    "args": {
      query
    }
  };
  getStyles(element, result.args);
  getAttributes(element, result.args);
  getProperties(element, result.args);
  getClasses(element, result.args);
  if (element.innerText.length > 0) {
    result.args.text_content = element.innerText;
  }
  return result;
}
function getStyles(element, status) {
  const result = {};
  const keys = Object.keys(element.style);
  for (const key of keys) {
    if (key.length === 1) {
      continue;
    }
    if (element.style[key] != null && element.style[key].trim().length > 0) {
      result[key] = element.style[key];
    }
  }
  if (Object.keys(result).length > 0) {
    status.styles = result;
  }
}
const skipAttributes = ["style", "class", "id", "data-id"];
function getAttributes(element, status) {
  const attributesObj = {};
  for (const attribute of element.attributes) {
    if (skipAttributes.includes(attribute.name)) {
      continue;
    }
    attributesObj[attribute.name] = attribute.value;
  }
  if (Object.keys(attributesObj).length > 0) {
    status.attributes = attributesObj;
  }
}
function getProperties(element, status) {
  const properties = {};
  const lookupProperties = PropertiesLookup[element.tagName.toLowerCase()] ?? [];
  for (const lookupProperty of lookupProperties) {
    properties[lookupProperty] = element[lookupProperty];
  }
  if (Object.keys(properties).length > 0) {
    status.properties = properties;
  }
}
function getClasses(element, status) {
  const classes = [...element.classList];
  if (classes.length > 0) {
    status.classes = classes;
  }
}
export {
  getElementStatus
};
